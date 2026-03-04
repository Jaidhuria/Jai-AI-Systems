import os
import time
import json
import warnings
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
from pandas import json_normalize
import io
import base64
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import traceback

# Try to import dask, but make it optional
try:
    import dask.dataframe as dd
    HAS_DASK = True
except ImportError:
    HAS_DASK = False
    print("⚠ Dask not installed. Large file handling will be limited to pandas.")

warnings.filterwarnings("ignore")

# Flask Configuration
app = Flask(__name__, static_folder='.', static_url_path='', template_folder='.')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'csv', 'json'}

SAMPLE_FRAC = 0.1
LARGE_FILE_MB = 50

def read_data(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)

    if ext == '.csv':
        if file_size_mb > LARGE_FILE_MB and HAS_DASK:
            print(f"⚙ Large CSV detected ({file_size_mb:.2f} MB). Using Dask...")
            ddf = dd.read_csv(file_path, assume_missing=True)
            df = ddf.sample(frac=SAMPLE_FRAC, random_state=42).compute()
        else:
            print(f"✓ Small CSV detected ({file_size_mb:.2f} MB). Using pandas...")
            try:
                df = pd.read_csv(file_path, encoding='utf-8')
            except UnicodeDecodeError:
                df = pd.read_csv(file_path, encoding='ISO-8859-1')

    elif ext == '.json':
        print("✓ Loading JSON file with pandas...")
        with open(file_path, 'r') as f:
            raw_data = json.load(f)

        if isinstance(raw_data, list):
            df = json_normalize(raw_data)
        elif isinstance(raw_data, dict):
            for v in raw_data.values():
                if isinstance(v, list):
                    df = json_normalize(v)
                    break
            else:
                df = pd.DataFrame([raw_data])
        else:
            df = pd.DataFrame(raw_data)

        if len(df) > 1_000_000:
            print(f"⚙ Large JSON detected ({len(df)} rows). Sampling {SAMPLE_FRAC*100}% ...")
            df = df.sample(frac=SAMPLE_FRAC, random_state=42)
    else:
        raise ValueError("Unsupported file format. Use CSV or JSON.")
    return df

def overview(df):
    """Generate basic dataset overview"""
    overview_data = {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "columns_list": df.columns.tolist(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "head_data": df.head(10).to_html(classes='table table-striped table-sm')
    }
    print(f"✓ Dataset Overview: {df.shape[0]} rows × {df.shape[1]} columns")
    return overview_data

def column_summary(df):
    """Generate column-wise summary"""
    summary_data = {}
    for col in df.columns:
        summary_data[col] = {
            "type": str(df[col].dtype),
            "unique_values": int(df[col].nunique()),
            "missing": int(df[col].isnull().sum()),
            "top_values": df[col].value_counts(dropna=False).head(5).to_dict()
        }
    print(f"✓ Column Summary generated for {len(summary_data)} columns")
    return summary_data

def numeric_analysis(df):
    """Generate numeric analysis with plots"""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    analysis_data = {
        "numeric_columns": numeric_cols,
        "statistics": df[numeric_cols].describe(include='all').to_dict() if numeric_cols else {},
        "plots": []
    }
    
    if not numeric_cols:
        print("⚠ No numeric columns found.")
        return analysis_data

    # Histogram for first numeric column
    if numeric_cols:
        col = numeric_cols[0]
        fig_plot = plt.figure(figsize=(8, 5))
        sns.histplot(df[col].dropna(), kde=True, color='teal', bins=30)
        plt.title(f"Distribution of '{col}'")
        plt.tight_layout()
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig_plot)
        analysis_data["plots"].append({
            "title": f"Distribution: {col}",
            "image": img_base64
        })

    # Correlation heatmap
    if len(numeric_cols) >= 2:
        fig_plot = plt.figure(figsize=(10, 8))
        sns.heatmap(df[numeric_cols].corr(), annot=True, cmap='coolwarm', fmt=".2f", linewidths=0.5, cbar_kws={"shrink": 0.8})
        plt.title("Correlation Heatmap")
        plt.tight_layout()
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig_plot)
        analysis_data["plots"].append({
            "title": "Correlation Heatmap",
            "image": img_base64
        })
    
    print(f"✓ Numeric analysis completed for {len(numeric_cols)} columns")
    return analysis_data

def categorical_analysis(df):
    """Generate categorical analysis with plots"""
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    analysis_data = {
        "categorical_columns": categorical_cols,
        "value_counts": {},
        "plots": []
    }
    
    if not categorical_cols:
        print("⚠ No categorical columns found.")
        return analysis_data

    for col in categorical_cols[:3]:  # Limit to first 3 categorical columns
        try:
            value_counts = df[col].value_counts(dropna=False).head(10)
            analysis_data["value_counts"][col] = value_counts.to_dict()
            
            # Create count plot - get top 10 values
            top_vals = df[col].value_counts().head(10).index.tolist()
            df_filtered = df[df[col].isin(top_vals)].copy()
            
            fig_plot = plt.figure(figsize=(10, 5))
            # Create a count plot by value
            value_counts_top = df_filtered[col].value_counts().head(10)
            plt.bar(range(len(value_counts_top)), value_counts_top.values)
            plt.xticks(range(len(value_counts_top)), value_counts_top.index, rotation=45, ha='right')
            plt.title(f"Count Plot: {col}")
            plt.ylabel("Count")
            plt.tight_layout()
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            img_base64 = base64.b64encode(buf.read()).decode('utf-8')
            plt.close(fig_plot)
            analysis_data["plots"].append({
                "title": f"Count Plot: {col}",
                "image": img_base64
            })
        except Exception as e:
            print(f"⚠ Error processing column {col}: {e}")
            continue
    
    print(f"✓ Categorical analysis completed for {len(categorical_cols)} columns")
    return analysis_data

def recommend_models(df, target_col=None):
    """Generate model recommendations"""
    n_rows, n_cols = df.shape
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    missing_pct = df.isnull().mean().mean() * 100
    
    recommendations = {
        "dataset_info": {
            "rows": n_rows,
            "columns": n_cols,
            "numeric_columns": len(numeric_cols),
            "categorical_columns": len(categorical_cols),
            "missing_percentage": round(missing_pct, 2)
        },
        "recommendations": []
    }

    if n_cols > 100:
        recommendations["recommendations"].append("High dimensionality detected: Try PCA or regularized models like Lasso/Ridge.")

    if missing_pct > 10:
        recommendations["recommendations"].append(f"High missing data ({missing_pct:.2f}%): Use imputation or robust models like XGBoost/CatBoost.")

    if len(categorical_cols) > 0:
        recommendations["recommendations"].append("Contains categorical features: Use CatBoost or LightGBM for better performance.")

    if n_rows > 100000:
        recommendations["recommendations"].append("Large dataset detected: Use Dask or Spark for processing and model training.")

    if n_rows < 10000:
        recommendations["recommendations"].append("Small to medium dataset: Linear Regression, Decision Trees, or SVM are suitable.")
    
    recommendations["recommendations"].append("For time-series: Consider ARIMA, Prophet, or LSTM models.")

    if not recommendations["recommendations"]:
        recommendations["recommendations"].append("Standard ML models (Random Forest, XGBoost, Linear Regression) are recommended.")
    
    print(f"✓ Model recommendations generated")
    return recommendations

def plot_histogram_base64(df, column):
    """Generate histogram as base64"""
    plt.figure(figsize=(8, 4))
    sns.histplot(df[column].dropna(), kde=True, color='teal')
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return img_base64


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Serve main page"""
    with open('index.html', 'r') as f:
        return f.read()


@app.route('/style.css')
def serve_css():
    """Serve CSS file"""
    with open('style.css', 'r') as f:
        return f.read(), 200, {'Content-Type': 'text/css'}


@app.route('/script.js')
def serve_js():
    """Serve JavaScript file"""
    with open('script.js', 'r') as f:
        return f.read(), 200, {'Content-Type': 'application/javascript'}


@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze uploaded CSV/JSON file"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Only CSV and JSON files are allowed"}), 400

        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        print(f"\n{'='*60}")
        print(f"📊 Analyzing file: {filename}")
        print(f"{'='*60}")

        # Read and analyze data
        df = read_data(filepath)
        
        # Generate analyses
        overview_data = overview(df)
        column_summary_data = column_summary(df)
        numeric_analysis_data = numeric_analysis(df)
        categorical_analysis_data = categorical_analysis(df)
        recommendations = recommend_models(df)

        # Prepare comprehensive report
        report = {
            "success": True,
            "message": f"✅ File analyzed successfully! Dataset: {df.shape[0]} rows × {df.shape[1]} columns",
            "filename": filename,
            "overview": overview_data,
            "column_summary": column_summary_data,
            "numeric_analysis": numeric_analysis_data,
            "categorical_analysis": categorical_analysis_data,
            "recommendations": recommendations,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        print(f"\n✓ Analysis completed successfully!")
        print(f"Report Generated at: {report['timestamp']}")
        print(f"{'='*60}\n")

        # Clean up uploaded file
        try:
            os.remove(filepath)
        except:
            pass

        return jsonify(report)

    except Exception as e:
        print(f"\n❌ Error during analysis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "InsightHub backend is running"}), 200


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 INSIGHT-HUB Backend Server Starting...")
    print("="*60)
    print(f"✓ Upload folder: {os.path.abspath(app.config['UPLOAD_FOLDER'])}")
    print(f"✓ Server running at: http://localhost:5000")
    print(f"✓ Open your browser and go to: http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)