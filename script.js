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
    const cellSize = 30; // セルのサイズ、調整が必要な場合があります

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        const row = document.createElement('tr');
        rowData.forEach((cell, colIndex) => {
            const td = document.createElement('td');
            td.textContent = cell;
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                td.style.backgroundColor = getColorForValue(numericValue, minValue, maxValue);
                if (numericValue >= zoomMinValue && numericValue <= zoomMaxValue) {
                    cells.push({ rowIndex: i - 1, colIndex: colIndex, value: numericValue });
                }
            }
            row.appendChild(td);
        });
        table.appendChild(row);
    }

    colorMap.appendChild(table);

    // 数値が小さい上位5か所を特定
    cells.sort((a, b) => a.value - b.value);
    const worst5 = cells.slice(0, 5);
    
    // すでにマークされたセルのリスト
    const markedCells = [];

    // 丸の描画
    worst5.forEach(cell => {
        if (!isCellWithinMarkedArea(cell.rowIndex, cell.colIndex, markedCells)) {
            const circle = document.createElement('div');
            circle.className = 'circle';
            circle.style.width = `${cellSize * 5}px`; // セル5つ分の大きさ
            circle.style.height = `${cellSize * 5}px`; // セル5つ分の大きさ
            circle.style.position = 'absolute';
            circle.style.border = '2px solid black';
            circle.style.borderRadius = '50%';
            circle.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; // 赤色の薄い背景
            circle.style.left = `${cell.colIndex * cellSize - cellSize * 2}px`; // セル5つ分の中心位置
            circle.style.top = `${cell.rowIndex * cellSize - cellSize * 2}px`; // セル5つ分の中心位置
            colorMap.appendChild(circle);
            markSurroundingCells(cell.rowIndex, cell.colIndex, markedCells);
        }
    });

    if (worst5.length > 0) {
        const minCell = worst5[0];
        document.getElementById('minCellLocation').textContent = 
            `最小値のセル: 行${minCell.rowIndex + 1}, 列${minCell.colIndex + 1}`;
    }
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
