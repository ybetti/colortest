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

    let topValues = [];

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(',');
        const row = document.createElement('tr');
        let rowInRange = false;
        rowData.forEach((cell, index) => {
            const td = document.createElement('td');
            td.textContent = cell;
            const numericValue = parseFloat(cell);
            if (!isNaN(numericValue)) {
                td.style.backgroundColor = getColorForValue(numericValue, minValue, maxValue);
                rowInRange = true;

                // トップの値を追跡する
                topValues.push({ value: numericValue, cell: td, position: `${String.fromCharCode(65 + index)}${i + 1}`, row: i, col: index });
            }
            row.appendChild(td);
        });
        if (rowInRange || !applyZoom) {
            table.appendChild(row);
        }
    }

    colorMap.appendChild(table);

    // トップの5つの値を取得し、赤色が最も強いセルの位置を知らせる
    topValues.sort((a, b) => b.value - a.value);
    let top5 = [];
    for (let i = 0; i < topValues.length; i++) {
        const current = topValues[i];
        let valid = true;
        for (let j = 0; j < top5.length; j++) {
            const selected = top5[j];
            if (Math.abs(current.row - selected.row) < 5 && Math.abs(current.col - selected.col) < 5) {
                valid = false;
                break;
            }
        }
        if (valid) {
            top5.push(current);
            if (top5.length === 5) break;
        }
    }

    top5.forEach((item, index) => {
        item.cell.style.position = 'relative';
        const marker = document.createElement('div');
        marker.style.position = 'absolute';
        marker.style.top = '50%';
        marker.style.left = '50%';
        marker.style.transform = 'translate(-50%, -50%)';
        marker.style.width = '20px';
        marker.style.height = '20px';
        marker.style.borderRadius = '50%';
        marker.style.border = '2px solid black';
        marker.style.pointerEvents = 'none';
        item.cell.appendChild(marker);

        if (index === 0) {
            alert(`赤色が最も強いセル: ${item.position}`);
        }
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

    // 最小値より小さい値に対して最初の色を適用
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
        return colors[colors.length - 1]; // マッチしない場合は最後の色をデフォルトとして使用
    }
}
