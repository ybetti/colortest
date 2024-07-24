let globalData = null;
let autoMinValue = Number.POSITIVE_INFINITY;
let autoMaxValue = Number.NEGATIVE_INFINITY;

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
        rowData.forEach(cell => {
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                if (numericValue < autoMinValue) autoMinValue = numericValue;
                if (numericValue > autoMaxValue) autoMaxValue = numericValue;
            }
        });
    }

    document.getElementById('minValue').value = autoMinValue;
    document.getElementById('maxValue').value = autoMaxValue;
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

    const cells = [];
    const markedCells = [];

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        const row = document.createElement('tr');
        let rowInRange = false;
        rowData.forEach((cell, index) => {
            const td = document.createElement('td');
            td.textContent = cell;
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                const color = getColorForValue(numericValue, minValue, maxValue);
                td.style.backgroundColor = color;
                rowInRange = true;

                // セル情報を保存
                cells.push({ value: numericValue, rowIndex: i, colIndex: index, color });
            }
            row.appendChild(td);
        });
        if (rowInRange || !applyZoom) {
            table.appendChild(row);
        }
    }

    colorMap.appendChild(table);

    // 数値が小さいトップ5を選ぶ
    cells.sort((a, b) => a.value - b.value);
    const worst5 = [];
    
    for (const cell of cells) {
        if (!isCellWithinMarkedArea(cell.rowIndex, cell.colIndex, worst5)) {
            worst5.push(cell);
            markSurroundingCells(cell.rowIndex, cell.colIndex, worst5);
            if (worst5.length === 5) break;
        }
    }

    const cellSize = 30; // セルのサイズ（例：30px）

    worst5.forEach(cell => {
        const circle = document.createElement('div');
        circle.style.width = `${cellSize * 5}px`; // セル5つ分の大きさ
        circle.style.height = `${cellSize * 5}px`; // セル5つ分の大きさ
        circle.style.border = '2px solid black';
        circle.style.borderRadius = '50%';
        circle.style.position = 'absolute';
        circle.style.left = `${cell.colIndex * cellSize + cellSize * 2.5}px`; // セル5つ分の中心位置
        circle.style.top = `${cell.rowIndex * cellSize + cellSize * 2.5}px`; // セル5つ分の中心位置
        circle.style.pointerEvents = 'none';
        circle.style.transform = 'translate(-50%, -50%)'; // 中心を調整
        colorMap.appendChild(circle);
    });
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
        return colors[colors.length - 1];
    }
}

function isCellWithinMarkedArea(rowIndex, colIndex, markedCells) {
    for (let rowOffset = -5; rowOffset <= 5; rowOffset++) {
        for (let colOffset = -5; colOffset <= 5; colOffset++) {
            if (markedCells.some(cell => cell.rowIndex === rowIndex + rowOffset && cell.colIndex === colIndex + colOffset)) {
                return true;
            }
        }
    }
    return false;
}

function markSurroundingCells(rowIndex, colIndex, markedCells) {
    for (let rowOffset = -5; rowOffset <= 5; rowOffset++) {
        for (let colOffset = -5; colOffset <= 5; colOffset++) {
            markedCells.push({ rowIndex: rowIndex + rowOffset, colIndex: colIndex + colOffset });
        }
    }
}
