// Initialize dates when page loads
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/default-dates')
        .then(response => response.json())
        .then(dates => {
            document.getElementById('startDate').value = dates[0];
            updateDateHeaders(dates[0]);
        });
});

function updateDateHeaders(startDate) {
    const date = new Date(startDate);
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const headers = document.querySelectorAll('thead th');
    
    for (let i = 1; i <= 7; i++) {
        const currentDate = new Date(date);
        currentDate.setDate(date.getDate() + i - 1);
        const dateStr = currentDate.toLocaleDateString('en-GB', { 
            day: '2-digit',
            month: 'short'
        });
        headers[i].textContent = `${days[i-1]}\n${dateStr}`;
    }
}

function addStaffMember() {
    const tbody = document.getElementById('rotaBody');
    const row = document.createElement('tr');
    row.className = 'staff-row';
    
    // Staff name cell
    const nameCell = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'form-control staff-name';
    nameInput.placeholder = 'Name';
    nameCell.appendChild(nameInput);
    row.appendChild(nameCell);
    
    // Days cells
    for (let i = 0; i < 7; i++) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control shift-input';
        input.placeholder = '00:00-00:00';
        input.addEventListener('change', () => calculateHours(row));
        cell.appendChild(input);
        row.appendChild(cell);
    }
    
    // Total hours cells
    for (let i = 0; i < 3; i++) {
        const cell = document.createElement('td');
        cell.className = i === 0 ? 'total-hours' : i === 1 ? 'overtime' : 'final-total';
        cell.textContent = '0';
        row.appendChild(cell);
    }
    
    tbody.appendChild(row);
    updateTotals();
}

function calculateHours(row) {
    let totalHours = 0;
    const shiftInputs = row.querySelectorAll('.shift-input');
    
    shiftInputs.forEach(input => {
        const shift = input.value;
        if (shift) {
            const [start, end] = shift.split('-');
            if (start && end) {
                const [startHour, startMin] = start.split(':').map(Number);
                const [endHour, endMin] = end.split(':').map(Number);
                let hours = endHour - startHour + (endMin - startMin) / 60;
                if (hours < 0) hours += 24;
                totalHours += hours;
            }
        }
    });
    
    const totalCell = row.querySelector('.total-hours');
    const overtimeCell = row.querySelector('.overtime');
    const finalTotalCell = row.querySelector('.final-total');
    
    totalCell.textContent = totalHours.toFixed(1);
    
    // Calculate overtime (hours over 40)
    const overtime = Math.max(0, totalHours - 40);
    overtimeCell.textContent = overtime.toFixed(1);
    
    // Calculate final total
    finalTotalCell.textContent = totalHours.toFixed(1);
    
    updateTotals();
}

function updateTotals() {
    let grandTotal = 0;
    let overtimeTotal = 0;
    
    document.querySelectorAll('.staff-row').forEach(row => {
        grandTotal += parseFloat(row.querySelector('.total-hours').textContent) || 0;
        overtimeTotal += parseFloat(row.querySelector('.overtime').textContent) || 0;
    });
    
    document.getElementById('grandTotal').textContent = grandTotal.toFixed(1);
    document.getElementById('overtimeTotal').textContent = overtimeTotal.toFixed(1);
    document.getElementById('finalTotal').textContent = (grandTotal).toFixed(1);
}

function exportToPNG() {
    const storeName = document.getElementById('storeName').value || 'STAFF ROTA';
    document.querySelector('h1').textContent = `STAFF ROTA - ${storeName}`;
    
    html2canvas(document.getElementById('rotaContainer')).then(canvas => {
        const link = document.createElement('a');
        link.download = `${storeName.toLowerCase().replace(/\s+/g, '-')}-rota.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}
