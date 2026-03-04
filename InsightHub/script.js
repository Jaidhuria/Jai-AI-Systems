let latestSample = null;

document.getElementById('uploadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const fileInput = document.getElementById('datasetFile');
  const statusDiv = document.getElementById('uploadStatus');
  statusDiv.innerHTML = "";
  const oldOutput = document.getElementById('resultOutput');
  if(oldOutput) oldOutput.remove();
  if(!fileInput.files.length) {
    statusDiv.innerHTML = "Please select a file before uploading.";
    return;
  }
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  statusDiv.innerHTML = "Uploading and analyzing...";
  fetch('/analyze', {method: 'POST', body: formData})
    .then(response => response.json())
    .then(data => {
      if(data.error) {
        statusDiv.innerHTML = 'Error: ' + data.error;
        console.error("Server Error:", data.error);
        return;
      }
      statusDiv.innerHTML = "File analyzed successfully!";
      console.log("Analysis completed!", data);
      // store sample data for interactive charting
      latestSample = data.sample || null;

      const missingPct = (data.recommendations && data.recommendations.dataset_info)
        ? data.recommendations.dataset_info.missing_percentage
        : null;

      const resultDiv = document.createElement('div');
      resultDiv.id = "resultOutput";
      resultDiv.className = "mt-5";
      let html = '<div class="card mb-4 border-success"><div class="card-header bg-success text-white"><h4 class="m-0">Analysis Report</h4></div><div class="card-body">';
      html += '<p><strong>File:</strong> ' + data.filename + '</p>';
      html += '<p><strong>Analysis Time:</strong> ' + data.timestamp + '</p><hr>';
      if(data.overview) {
        html += '<div class="section-header mt-4 mb-3"><h5 class="text-primary">Dataset Overview</h5></div>';
        html += '<div class="row g-3 report-kpi-row">';
        html += '<div class="col-md-4"><div class="report-kpi"><div class="report-kpi-label">Rows</div><div class="report-kpi-value">' + (data.overview.rows||0).toLocaleString() + '</div></div></div>';
        html += '<div class="col-md-4"><div class="report-kpi"><div class="report-kpi-label">Columns</div><div class="report-kpi-value">' + (data.overview.columns||0) + '</div></div></div>';
        let missingText = 'N/A';
        if(missingPct !== null) {
          missingText = missingPct.toFixed(2) + '%';
        } else if (data.overview.missing_values) {
          const vals = Object.values(data.overview.missing_values);
          const hasMissing = vals.some(v => v > 0);
          missingText = hasMissing ? 'Present' : 'None';
        }
        html += '<div class="col-md-4"><div class="report-kpi"><div class="report-kpi-label">Missing (%)</div><div class="report-kpi-value">' + missingText + '</div></div></div>';
        html += '</div>';
        html += '<div class="mt-3"><p><strong>Column Names:</strong></p><div class="bg-light p-2 rounded" style="max-height:200px;overflow-y:auto;"><code>' + (data.overview.columns_list||[]).join(', ') + '</code></div></div>';
        if(data.overview.head_data) {
          html += '<div class="mt-3"><p><strong>First 10 Rows:</strong></p><div style="overflow-x:auto;max-height:300px;overflow-y:auto;">' + data.overview.head_data + '</div></div>';
        }
      }
      if(data.numeric_analysis && data.numeric_analysis.numeric_columns && data.numeric_analysis.numeric_columns.length > 0) {
        html += '<div class="section-header mt-4 mb-3"><h5 class="text-primary">Numeric Analysis</h5></div>';
        const numCols = (data.numeric_analysis.numeric_columns||[]);
        html += '<p class="mb-1"><strong>Numeric Columns (' + numCols.length + '):</strong></p>';
        html += '<div class="chip-list mb-3">';
        numCols.forEach(col => {
          html += '<span class="chip-pill">' + col + '</span>';
        });
        html += '</div>';
        if(data.numeric_analysis.plots && data.numeric_analysis.plots.length > 0) {
          html += '<div class="row">';
          for(let plot of data.numeric_analysis.plots) {
            html += '<div class="col-md-6 mb-3"><div class="card"><div class="card-header"><h6 class="m-0">' + plot.title + '</h6></div>';
            html += '<div class="card-body p-2"><img src="data:image/png;base64,' + plot.image + '" style="width:100%;max-height:300px;object-fit:contain;"></div></div></div>';
          }
          html += '</div>';
        }
      }
      if(data.categorical_analysis && data.categorical_analysis.categorical_columns && data.categorical_analysis.categorical_columns.length > 0) {
        html += '<div class="section-header mt-4 mb-3"><h5 class="text-primary">Categorical Analysis</h5></div>';
        const catCols = (data.categorical_analysis.categorical_columns||[]);
        html += '<p class="mb-1"><strong>Categorical Columns (' + catCols.length + '):</strong></p>';
        html += '<div class="chip-list mb-3">';
        catCols.forEach(col => {
          html += '<span class="chip-pill chip-pill-soft">' + col + '</span>';
        });
        html += '</div>';
        if(data.categorical_analysis.plots && data.categorical_analysis.plots.length > 0) {
          html += '<div class="row">';
          for(let plot of data.categorical_analysis.plots) {
            html += '<div class="col-md-6 mb-3"><div class="card"><div class="card-header"><h6 class="m-0">' + plot.title + '</h6></div>';
            html += '<div class="card-body p-2"><img src="data:image/png;base64,' + plot.image + '" style="width:100%;max-height:300px;object-fit:contain;"></div></div></div>';
          }
          html += '</div>';
        }
      }
      if(data.recommendations) {
        html += '<div class="section-header mt-4 mb-3"><h5 class="text-primary">Model Recommendations</h5></div>';
        html += '<div class="alert alert-light border"><p><strong>Dataset Info:</strong></p><ul>';
        html += '<li>Rows: ' + (data.recommendations.dataset_info.rows||0).toLocaleString() + '</li>';
        html += '<li>Columns: ' + (data.recommendations.dataset_info.columns||0) + '</li>';
        html += '<li>Numeric: ' + (data.recommendations.dataset_info.numeric_columns||0) + '</li>';
        html += '<li>Categorical: ' + (data.recommendations.dataset_info.categorical_columns||0) + '</li>';
        html += '<li>Missing: ' + (data.recommendations.dataset_info.missing_percentage||0) + '%</li></ul></div>';
        html += '<div class="alert alert-success"><strong>Recommendations:</strong><ul>';
        for(let rec of (data.recommendations.recommendations||[])) {
          html += '<li>' + rec + '</li>';
        }
        html += '</ul></div>';
      }
      // Dynamic chart controls
      if(latestSample && latestSample.columns && latestSample.columns.length > 0) {
        html += '<div class="section-header mt-4 mb-3"><h5 class="text-primary">Create Your Own Chart</h5></div>';
        html += '<div class="card mb-4"><div class="card-body">';
        html += '<div class="row g-3 align-items-end">';
        html += '<div class="col-md-4"><label class="form-label">X-axis column</label><select id="chartX" class="form-select"></select></div>';
        html += '<div class="col-md-4"><label class="form-label">Y-axis column</label><select id="chartY" class="form-select"></select></div>';
        html += '<div class="col-md-4 text-md-start text-center mt-3 mt-md-0"><button id="drawChartBtn" class="btn btn-outline-success w-100">Generate Chart</button></div>';
        html += '</div>';
        html += '<div id="userChart" class="mt-4"></div>';
        html += '</div></div>';
      }

      html += '</div></div><div class="text-center mt-4"><button class="btn btn-primary" onclick="window.print()">Print Report</button> ';
      html += '<button class="btn btn-secondary" onclick="location.reload()">Analyze Another</button></div>';
      resultDiv.innerHTML = html;
      document.querySelector('main').appendChild(resultDiv);

      // Populate dropdowns and bind chart button after DOM insert
      if(latestSample && latestSample.columns && latestSample.columns.length > 0) {
        const xSelect = document.getElementById('chartX');
        const ySelect = document.getElementById('chartY');
        latestSample.columns.forEach(col => {
          const optX = document.createElement('option');
          optX.value = col;
          optX.textContent = col;
          xSelect.appendChild(optX);
          const optY = document.createElement('option');
          optY.value = col;
          optY.textContent = col;
          ySelect.appendChild(optY);
        });
        // sensible defaults
        if(latestSample.columns.length > 1) {
          xSelect.value = latestSample.columns[0];
          ySelect.value = latestSample.columns[1];
        }
        const drawBtn = document.getElementById('drawChartBtn');
        drawBtn.addEventListener('click', function() {
          const xCol = xSelect.value;
          const yCol = ySelect.value;
          if(!xCol || !yCol) return;
          const xData = (latestSample.data && latestSample.data[xCol]) ? latestSample.data[xCol] : [];
          const yData = (latestSample.data && latestSample.data[yCol]) ? latestSample.data[yCol] : [];
          const trace = {
            x: xData,
            y: yData,
            mode: 'markers',
            type: 'scatter',
            marker: { color: '#2e8b57', opacity: 0.7 }
          };
          const layout = {
            margin: { t: 40, l: 60, r: 20, b: 60 },
            xaxis: { title: xCol },
            yaxis: { title: yCol },
            title: xCol + ' vs ' + yCol,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
          };
          Plotly.newPlot('userChart', [trace], layout, {displayModeBar: true, responsive: true});
        });
      }

      resultDiv.scrollIntoView({behavior:'smooth'});
    })
    .catch(error => {
      console.error("Upload error:", error);
      statusDiv.innerHTML = "Error uploading file. Please try again.";
    });
});
