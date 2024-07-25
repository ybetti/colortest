let globalData = null;
let autoMinValue = Number.POSITIVE_INFINITY;
let autoMaxValue = Number.NEGATIVE_INFINITY;
let minCellLocation = { row: -1, col: -1 };

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function() {
        globalData = reader.result;
        calculateMinMax();
        updateColorMap();
    };
});

document.getElementById('updateButton').addEventListener('click', function() {
    updateColorMap();
});

document.getElementById('applyZoomButton').addEventListener('click', function() {
    updateColorMap(true);
});

function calculateMinMax() {
    if (!globalData) return;

    const lines = globalData.split('\n');
    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        rowData.forEach((cell, colIndex) => {
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                if (numericValue < autoMinValue) {
                    autoMinValue = numericValue;
                    minCellLocation = { row: i, col: colIndex };
                }
                if (numericValue > autoMaxValue) autoMaxValue = numericValue;
            }
        });
    }

    document.getElementById('minValue').value = autoMinValue;
    document.getElementById('maxValue').value = autoMaxValue;
    displayMinCellLocation();
}

function displayMinCellLocation() {
    const locationText = `最小値のセル: 行 ${minCellLocation.row}, 列 ${minCellLocation.col}`;
    document.getElementById('minCellLocation').textContent = locationText;
}

function updateColorMap(applyZoom = false) {
    if (!globalData) return;

    const minValue = parseFloat(document.getElementById('minValue').value);
    const maxValue = parseFloat(document.getElementById('maxValue').value);
    const zoomMinValue = applyZoom ? parseFloat(document.getElementById('zoomMinValue').value) : minValue;
    const zoomMaxValue = applyZoom ? parseFloat(document.getElementById('zoomMaxValue').value) : maxValue;

    const lines = globalData.split('\n');
    const headers = lines[0].split(',');
    const colorMap = document.getElementById('colorMap');
    colorMap.innerHTML = '';

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        const row = document.createElement('tr');
        rowData.forEach((cell, colIndex) => {
            const td = document.createElement('td');
            td.textContent = cell;
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue) && numericValue >= minValue && numericValue <= maxValue) {
                td.style.backgroundColor = getColorForValue(numericValue, minValue, maxValue);
            }
            row.appendChild(td);
        });
        table.appendChild(row);
    }

    colorMap.appendChild(table);
    drawCircleOnMinValue();
}

function drawCircleOnMinValue() {
    const table = document.querySelector('#colorMap table');
    if (!table || minCellLocation.row === -1 || minCellLocation.col === -1) return;

    const row = table.rows[minCellLocation.row];
    const cell = row.cells[minCellLocation.col];
    if (!cell) return;

    const circle = document.createElement('div');
    circle.classList.add('circle');
    circle.style.width = '25px'; // セル5つ分のサイズに合わせて調整
    circle.style.height = '25px'; // セル5つ分のサイズに合わせて調整
    circle.style.position = 'absolute';
    circle.style.borderRadius = '50%';
    circle.style.border = '2px solid red';

    const rect = cell.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();

    circle.style.left = `${rect.left - tableRect.left + cell.offsetWidth / 2 - 12.5}px`;
    circle.style.top = `${rect.top - tableRect.top + cell.offsetHeight / 2 - 12.5}px`;

    document.getElementById('colorMap').appendChild(circle);
}

function getColorForValue(value, min, max) {
    const ranges = [
        parseFloat(document.getElementById('range1').value),
        parseFloat(document.getElementById('range2').value),
        parseFloat(document.getElementById('range3').value),
        parseFloat(document.getElementById('range4').value),
        parseFloat(document.getElementById('range5').value),
        parseFloat(document.getElementById('range6').value),
        parseFloat(document.getElementById('range7').value),
        parseFloat(document.getElementById('range8').value),
        parseFloat(document.getElementById('range9').value),
        parseFloat(document.getElementById('range10').value)
    ];

    const colors = [
        document.getElementById('color1').value,
        document.getElementById('color2').value,
        document.getElementById('color3').value,
        document.getElementById('color4').value,
        document.getElementById('color5').value,
        document.getElementById('color6').value,
        document.getElementById('color7').value,
        document.getElementById('color8').value,
        document.getElementById('color9').value,
        document.getElementById('color10').value
    ];

    if (value <= min) {
        return colors[0];
    } else if (value > max) {
        return colors[colors.length - 1];
    } else {
        const percentage = (value - min) / (max - min) * 100;
        for (let i = 0; i < ranges.length; i++) {
            if (percentage <= ranges[i]) {
                return colors[i];
            }
        }
        return colors[colors.length - 1]; // Default to the last color if no match is found
    }
}
