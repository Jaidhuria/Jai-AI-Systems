# 🚀 InsightHub React Frontend - Complete Setup Guide

## ✨ What Was Converted

The InsightHub frontend has been successfully converted from vanilla HTML/CSS/JavaScript to **React with Vite**. This provides:

- ✅ **Component-based Architecture**: Modular, reusable components
- ✅ **Better State Management**: React hooks (useState, useEffect)
- ✅ **Modern Build Tool**: Vite for fast development and production builds
- ✅ **Improved Developer Experience**: HMR (Hot Module Replacement)
- ✅ **Professional Workflow**: npm scripts for dev, build, preview
- ✅ **Direct API Connection**: Connected to Flask backend

---

## 📊 Project Structure

```
InsightHub/
├── main.py                           # Flask backend (unchanged)
├── requirements.txt                  # Backend dependencies
├── ...
└── frontend/                         # NEW React Frontend
    ├── index.html                    # HTML template
    ├── package.json                  # npm dependencies
    ├── vite.config.js               # Vite configuration
    ├── .gitignore                   # Git ignore rules
    ├── README.md                    # Frontend documentation
    ├── public/                      # Static assets
    └── src/
        ├── main.jsx                 # Entry point
        ├── App.jsx                  # Main App component
        ├── index.css                # Global styles
        └── components/
            ├── Header.jsx           # Header with navigation
            ├── Footer.jsx           # Footer
            ├── UploadForm.jsx       # File upload form
            ├── ResultsDisplay.jsx   # Results container
            ├── OverviewSection.jsx  # Dataset overview
            ├── NumericAnalysisSection.jsx
            ├── CategoricalAnalysisSection.jsx
            └── RecommendationsSection.jsx
```

---

## 🎯 React Components Explained

### **App.jsx** - Main Application Component
```
Responsibilities:
- Manages overall app state
- Handles file upload
- Communication with Flask API
- Switches between upload form and results display
```

**State Management**:
```jsx
const [analysisResults, setAnalysisResults] = useState(null)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)
```

### **Header.jsx** - Navigation Header
```
Displays:
- Application title "INSIGHT-HUB"
- Navigation menu (Home, About, Contact)
- Responsive layout
```

### **UploadForm.jsx** - File Upload Form
```
Features:
- File input with validation
- Accept CSV and JSON files only
- Loading state during upload
- Error message display
- Submit button with loading animation
```

### **ResultsDisplay.jsx** - Results Container
```
Composition:
- Overview section
- Numeric analysis section
- Categorical analysis section
- Recommendations section
- Print and Reset buttons
```

### **OverviewSection.jsx** - Dataset Overview
```
Shows:
- Total rows and columns
- Column names list
- Data types
- First 10 rows preview
```

### **NumericAnalysisSection.jsx** - Numeric Analysis
```
Displays:
- List of numeric columns
- Histogram plots (base64 images)
- Correlation heatmaps
- Statistical summaries table
```

### **CategoricalAnalysisSection.jsx** - Categorical Analysis
```
Shows:
- Categorical columns list
- Count plots (base64 images)
- Value distributions tables
```

### **RecommendationsSection.jsx** - ML Recommendations
```
Provides:
- Dataset statistics
- Recommended ML algorithms
- Data handling suggestions
```

### **Footer.jsx** - Application Footer
```
Contains:
- Application info
- Copyright notice
- Technology stack info
```

---

## 🔄 Data Flow & API Integration

### **Upload Flow**
```
User selects file
    ↓
UploadForm handles submission
    ↓
App.jsx calls handleFileUpload()
    ↓
Fetch POST to http://localhost:5000/analyze
    ↓
FormData with file sent to backend
    ↓
Flask processes file
    ↓
Returns JSON with analysis results
    ↓
App.jsx updates analysisResults state
    ↓
ResultsDisplay renders components with data
```

### **API Endpoint**
```
POST /analyze
Request: multipart/form-data with 'file'
Response: JSON with:
  - success (boolean)
  - message (string)
  - filename
  - timestamp
  - overview (object)
  - numeric_analysis (object)
  - categorical_analysis (object)
  - recommendations (object)
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ (check: `node --version`)
- npm or yarn (check: `npm --version`)
- Flask backend running on port 5000

### **Start Both Servers**

**Terminal 1 - Start Flask Backend**:
```bash
cd c:\Coding\machine learning\ML-projects\InsightHub
python main.py
```

Expected:
```
🚀 INSIGHT-HUB Backend Server Starting...
✓ Server running at: http://localhost:5000
```

**Terminal 2 - Start React Frontend**:
```bash
cd c:\Coding\machine learning\ML-projects\InsightHub\frontend
npm run dev
```

Expected:
```
VITE v4.5.14  ready in 527 ms

➜  Local:   http://localhost:3000/
```

### **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

---

## 📝 Code Examples

### **Making API Calls**
```jsx
// In App.jsx or any component
const handleFileUpload = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setAnalysisResults(data)
  } catch (err) {
    setError(err.message)
  }
}
```

### **Using State & Props**
```jsx
// App.jsx - parent component
<UploadForm onUpload={handleFileUpload} isLoading={isLoading} error={error} />

// UploadForm.jsx - child component
function UploadForm({ onUpload, isLoading, error }) {
  const [selectedFile, setSelectedFile] = useState(null)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onUpload(selectedFile)
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### **Rendering Lists**
```jsx
// In ResultsDisplay or any component
{data.numeric_analysis.plots.map((plot, index) => (
  <div key={index} className="image-container">
    <img
      src={`data:image/png;base64,${plot.image}`}
      alt={plot.title}
    />
  </div>
))}
```

### **Conditional Rendering**
```jsx
{error && <div className="alert alert-danger">{error}</div>}

{isLoading ? (
  <div>Loading...</div>
) : analysisResults ? (
  <ResultsDisplay results={analysisResults} />
) : (
  <UploadForm />
)}
```

---

## 🛠️ Development Workflow

### **Add a New Component**

1. **Create component file** `src/components/MyComponent.jsx`:
```jsx
import React from 'react'

function MyComponent({ data }) {
  return (
    <div>
      {/* Your JSX here */}
    </div>
  )
}

export default MyComponent
```

2. **Import in parent**:
```jsx
import MyComponent from './components/MyComponent'

// Use in JSX
<MyComponent data={someData} />
```

### **Add Styling**

#### Option 1: CSS
```css
/* In src/index.css */
.my-class {
  color: #2e8b57;
  font-weight: 500;
}
```

#### Option 2: Inline Styles
```jsx
<div style={{ color: '#2e8b57', fontWeight: 500 }}>
  Content
</div>
```

#### Option 3: Bootstrap Classes
```jsx
<div className="alert alert-info">
  This uses Bootstrap
</div>
```

---

## 🧪 Testing the React Frontend

### **Test 1: File Upload**
1. Open http://localhost:3000
2. Select a CSV file
3. Click "Upload & Analyze"
4. Wait for results to display

### **Test 2: Visualizations**
- Check if plots display correctly
- Verify images load from base64 data
- Check responsive layout

### **Test 3: Print Functionality**
- Click "Print Report" button
- Verify PDF preview
- Save as PDF

### **Test 4: Reset**
- Click "Analyze Another File"
- Verify upload form appears again
- Upload another file

---

## 🔧 Vite Configuration

### **vite.config.js**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // Development port
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### **Using the Proxy**
Change fetch URL in App.jsx:
```javascript
// Before
fetch('http://localhost:5000/analyze', ...)

// After (with proxy)
fetch('/api/analyze', ...)
```

---

## 📦 Build & Deployment

### **Production Build**
```bash
npm run build
```

Creates optimized `dist/` folder with:
- Minified JavaScript
- Optimized CSS
- Compressed assets

### **Preview Build**
```bash
npm run preview
```

Serves the production build locally for testing.

### **Deploy to Vercel**
```bash
npm install -g vercel
cd frontend
vercel
```

### **Deploy to Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

### **Update Backend URL for Production**
Create `.env` file:
```
VITE_API_URL=https://your-backend-api.com
```

Update App.jsx:
```jsx
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
fetch(`${apiUrl}/analyze`, ...)
```

---

## 🎯 Key Features Implemented

### **Component-Based Architecture ✅**
- Header component with navigation
- Upload form component
- Results display with sub-components
- Footer component
- Modular and reusable

### **State Management ✅**
- File upload state
- Analysis results state
- Loading state
- Error handling state

### **API Integration ✅**
- Connected to Flask backend
- Proper error handling
- Loading indicators
- Data transformation

### **Responsive Design ✅**
- Mobile-first approach
- Bootstrap 5 grid system
- Media queries for different screen sizes
- Touch-friendly interface

### **Styling ✅**
- Professional color scheme
- Consistent design
- Alert/notification system
- Print-friendly CSS

### **User Experience ✅**
- File validation
- Loading animations
- Error messages
- Print functionality
- Intuitive navigation

---

## 🐛 Troubleshooting

### **Issue: "Module not found" errors**
**Solution**: Install dependencies
```bash
npm install
npm install --legacy-peer-deps
```

### **Issue: Port 3000 already in use**
**Solution**: Change port in vite.config.js
```javascript
server: {
  port: 3001,  // Different port
}
```

### **Issue: Flask backend connection refused**
**Solution**: Ensure Flask server is running
```bash
# In another terminal
python main.py
```

### **Issue: Changes not reflecting**
**Solution**: Clear cache and restart
```bash
npm run dev
# Vite will reload automatically
```

### **Issue: npm install fails**
**Solution**: Use legacy peer deps
```bash
npm install --legacy-peer-deps
```

---

## 📚 React Hooks Used

| Hook | Purpose | Used In |
|------|---------|----------|
| `useState` | Manage component state | App, UploadForm |
| `useEffect` | Side effects (optional) | Can be added |
| `useCallback` | Memoize callbacks (optional) | Performance |
| `useRef` | Access DOM directly (optional) | Advanced |

---

## 🔄 Migration Summary

### **From Vanilla JS to React**

| Aspect | Before | After |
|--------|--------|-------|
| **File** | script.js | Multiple .jsx files |
| **State** | Global variables | useState hooks |
| **DOM Updates** | Manual with innerHTML | Automatic with JSX |
| **Build** | None | Vite build process |
| **Dev Server** | Simple HTTP | Vite with HMR |
| **Styling** | Single CSS file | CSS + Bootstrap |
| **Components** | N/A | Modular components |
| **Testing** | Console logs | React DevTools |

---

## ✅ Verification Checklist

- [x] React project created with proper structure
- [x] All components implemented
- [x] State management working
- [x] API integration with Flask backend
- [x] Styling applied with CSS
- [x] Bootstrap 5 integrated
- [x] Loading states implemented
- [x] Error handling working
- [x] File upload functional
- [x] Results display working
- [x] Print functionality working
- [x] Responsive design implemented
- [x] npm scripts (dev, build, preview) working
- [x] Frontend running on LocalHost:3000
- [x] Backend running on localhost:5000
- [x] Data flowing between frontend and backend

---

## 🎉 Conclusion

The InsightHub frontend has been successfully converted to React with full integration to the Flask backend. The new React-based frontend provides:

✅ **Better Code Organization** - Component-based architecture  
✅ **Improved Maintainability** - Modular, reusable components  
✅ **Modern Development** - Vite build tool with HMR  
✅ **Professional UI** - Bootstrap 5 + custom CSS  
✅ **Full Functionality** - All features from original version  
✅ **Production Ready** - Optimized builds and deployment options  

---

**Frontend Version**: 1.0.0 (React)  
**Backend Version**: 1.0.0 (Flask)  
**Status**: ✅ Production Ready  
**Date**: 2026-02-26

For issues or questions, refer to:
- `frontend/README.md` - Frontend documentation
- `README.md` - Main project documentation
