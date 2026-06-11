import requests
import json

# Test the health endpoint
print("Testing health endpoint...")
try:
    response = requests.get('http://localhost:5000/health')
    if response.status_code == 200:
        print('✅ Health Check: Server is running')
        print(f'Response: {response.json()}')
    else:
        print(f'❌ Health check failed: {response.status_code}')
except Exception as e:
    print(f'❌ Connection error: {e}')

print("\n" + "="*60)
print("Testing analyze endpoint with test.csv...")
print("="*60)

try:
    with open('uploads/sample_employees.csv', 'rb') as f:
        files = {'file': f}
        response = requests.post('http://localhost:5000/analyze', files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print('\n✅ Analysis Result Received!\n')
            
            # Print key information
            print(f'Message: {data.get("message")}')
            print(f'Filename: {data.get("filename")}')
            print(f'Timestamp: {data.get("timestamp")}')
            
            # Overview
            if 'overview' in data:
                overview = data['overview']
                print(f'\n📊 Dataset Overview:')
                print(f'  - Rows: {overview.get("rows")}')
                print(f'  - Columns: {overview.get("columns")}')
                print(f'  - Columns: {overview.get("columns_list")}')
            
            # Numeric Analysis
            if 'numeric_analysis' in data:
                numeric = data['numeric_analysis']
                print(f'\n🔢 Numeric Analysis:')
                print(f'  - Numeric columns: {numeric.get("numeric_columns")}')
                print(f'  - Plots generated: {len(numeric.get("plots", []))}')
                for plot in numeric.get("plots", []):
                    print(f'    • {plot["title"]} - Image encoded in base64')
            
            # Categorical Analysis
            if 'categorical_analysis' in data:
                categorical = data['categorical_analysis']
                print(f'\n📂 Categorical Analysis:')
                print(f'  - Categorical columns: {categorical.get("categorical_columns")}')
                print(f'  - Plots generated: {len(categorical.get("plots", []))}')
            
            # Recommendations
            if 'recommendations' in data:
                rec = data['recommendations']
                print(f'\n🤖 Model Recommendations:')
                print(f'  - Dataset Size: {rec["dataset_info"]["rows"]} rows x {rec["dataset_info"]["columns"]} columns')
                print(f'  - Recommendations:')
                for r in rec["recommendations"][:3]:
                    print(f'    • {r}')
            
            print('\n' + "="*60)
            print('✅ TEST SUCCESSFUL!')
            print('✅ Output is printing correctly!')
            print('✅ Backend is working properly!')
            print("="*60)
        else:
            print(f'❌ Error: {response.status_code}')
            print(f'Response: {response.text}')
            
except FileNotFoundError:
    print('❌ test.csv not found in uploads folder')
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
