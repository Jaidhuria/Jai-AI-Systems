# 🎯 INSIGHT-HUB - Automated EDA & Analytics System

A complete web-based system for Exploratory Data Analysis (EDA) that automatically analyzes CSV and JSON datasets, generates visualizations, and provides machine learning model recommendations.

## ✨ Features

### 📊 Data Analysis
- **Dataset Overview**: Displays row count, column count, data types, and missing values
- **Column Summary**: Detailed breakdown of each column including unique values and top values
- **Numeric Analysis**: 
  - Distribution histograms with KDE curve
  - Correlation heatmap for numeric columns
  - Statistical summaries (mean, median, std, etc.)
- **Categorical Analysis**:
  - Count plots for categorical features
  - Value count summaries
  - Top value identification

### 📈 Data Visualizations
- **Distribution Plots**: Histograms with KDE for numeric columns
- **Correlation Heatmaps**: Shows relationships between numeric variables
- **Count Plots**: Categorical feature distributions
- All plots are generated as base64-encoded PNG images for web display

### 🤖 Machine Learning Recommendations
- Automatically recommends suitable ML models based on:
  - Dataset size
  - Number and types of columns
  - Missing data percentage
  - Dimensionality
- Provides specific guidance for regression, classification, and other tasks

### 📁 File Support
- **CSV files**: Auto-detects encoding (UTF-8, ISO-8859-1)
- **JSON files**: Handles arrays, objects, and nested structures
- **Large files**: Graceful handling with sampling for performance

## 🚀 How to Run

### 1. Installation
```bash
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python main.py
```

You should see:
```
============================================================
🚀 INSIGHT-HUB Backend Server Starting...
============================================================
✓ Upload folder: C:\...\InsightHub\uploads
✓ Server running at: http://localhost:5000
✓ Open your browser and go to: http://localhost:5000
============================================================
```

### 3. Open in Browser
- Navigate to **http://localhost:5000**
- You should see the INSIGHT-HUB dashboard

## 📝 How to Use

### Step 1: Upload a File
1. Click "Choose CSV or JSON file"
2. Select a CSV or JSON file from your computer
3. Click "Upload & Analyze"

### Step 2: Wait for Analysis
- You'll see "⏳ Uploading and analyzing..." message
- Analysis may take a few seconds depending on file size

### Step 3: View Results
The analysis report includes:
- **📈 Dataset Overview**: Basic statistics and column information
- **🔢 Numeric Analysis**: Distributions, correlations, and statistics
- **📂 Categorical Analysis**: Category distributions and frequencies
- **🤖 Model Recommendations**: Suggested ML algorithms
- **📊 Visualizations**: Charts and heatmaps (as images)

### Step 4: Print or Download
- Click "🖨️ Print Report" to save as PDF
- Click "📁 Analyze Another File" to upload another dataset

## 🏗️ Project Structure

```
InsightHub/
├── main.py                    # Flask backend & analysis engine
├── index.html                 # Web interface
├── script.js                  # Frontend JavaScript
├── style.css                  # Styling
├── requirements.txt           # Python dependencies
├── uploads/                   # Uploaded files (temporary)
├── test_api.py               # API testing script
└── README.md                 # This file
```

## 📦 Dependencies

- **Flask**: Web framework
- **Pandas**: Data manipulation
- **NumPy**: Numerical computing
- **Matplotlib & Seaborn**: Visualization
- **Plotly**: Interactive plots (included for future use)
- **Werkzeug**: File upload handling

## 🔌 API Endpoints

### GET /
Returns the main HTML page

### GET /style.css
Returns the CSS stylesheet

### GET /script.js
Returns the JavaScript code

### GET /health
Health check endpoint
```json
HTTP/1.1 200 OK
{
  "status": "ok",
  "message": "InsightHub backend is running"
}
```

### POST /analyze
Analyzes uploaded file

**Request:**
- Multipart form data with 'file' parameter

**Response:**
```json
{
  "success": true,
  "message": "✅ File analyzed successfully! Dataset: 10 rows × 5 columns",
  "filename": "employees.csv",
  "timestamp": "2026-02-26 11:05:30",
  "overview": {
    "rows": 10,
    "columns": 5,
    "columns_list": ["Name", "Age", "Salary", "Department", "Years"],
    "dtypes": {...},
    "missing_values": {...},
    "head_data": "..."
  },
  "column_summary": {...},
  "numeric_analysis": {
    "numeric_columns": ["Age", "Salary", "Years"],
    "statistics": {...},
    "plots": [
      {
        "title": "Distribution: Age",
        "image": "base64_encoded_png_image"
      }
    ]
  },
  "categorical_analysis": {...},
  "recommendations": {
    "dataset_info": {...},
    "recommendations": [...]
  }
}
```

## ⚙️ Configuration

### MAX_CONTENT_LENGTH
Maximum file upload size: **100MB** (configurable in main.py)

### SAMPLE_FRAC
For very large files, sampling fraction: **0.1** (10%)

### LARGE_FILE_MB
Threshold for large file handling: **50MB**

## ✅ Testing

Run the test script to verify everything is working:

```bash
python test_api.py
```

Expected output:
```
✅ Health Check: Server is running
...
✅ TEST SUCCESSFUL!
✅ Output is printing correctly!
✅ Backend is working properly!
```

## 🐛 Troubleshooting

### Issue: "Address already in use"
- Another instance is running on port 5000
- Kill the process or use a different port in main.py

### Issue: "ModuleNotFoundError"
- Install dependencies: `pip install -r requirements.txt`

### Issue: File won't upload
- Check file size (max 100MB by default)
- Ensure file is CSV or JSON format
- Try with the sample file first

### Issue: Analysis takes too long
- Large files will be slower
- Dask helps with very large files (optional install)
- Try uploading a smaller sample first

## 📊 Example Datasets

Sample datasets are included:
- `uploads/sample_employees.csv` - Example HR dataset
- `uploads/IPL_Matches_2008-2020.csv` - Cricket dataset
- `uploads/zomato.csv` - Restaurant data (if encoding works)

## 🔮 Future Enhancements

- [ ] Advanced filtering and custom analysis
- [ ] Time-series analysis
- [ ] Missing value imputation suggestions
- [ ] Outlier detection and handling
- [ ] Dimensionality reduction (PCA) visualization
- [ ] Database integration for storing analyses
- [ ] User authentication
- [ ] Scheduled batch analysis
- [ ] Export reports to PDF/Excel
- [ ] Interactive dashboards with Plotly

## 📄 License

This project is open source and available for educational and commercial use.

## 👤 Author

INSIGHT-HUB Development Team

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-26  
**Status:** ✅ Fully Functional
