// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize event listeners
    document.getElementById('addStaffBtn').addEventListener('click', addStaffMember);
    updateDateHeaders();
});

function updateDateHeaders() {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(monday.getDate() - monday.getDay() + 1);

    const dateLabels = document.querySelectorAll('.date-label');
    dateLabels.forEach((label, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        label.textContent = `${date.getDate()} ${months[date.getMonth()]}`;
    });
}

function addStaffMember() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const role = document.getElementById('role').value.trim();

    if (!firstName || !lastName || !role) {
        alert('Please fill in all fields');
        return;
    }

    const tableBody = document.getElementById('rotaTableBody');
    const row = document.createElement('tr');
    row.className = 'staff-row';

    // Staff name cell
    const nameCell = document.createElement('td');
    nameCell.innerHTML = `
        <div class="staff-tag">
            ${firstName} ${lastName}
            <button class="remove-btn" onclick="removeStaffMember(this)">×</button>
        </div>
        <small class="text-muted d-block">${role}</small>
    `;

    row.appendChild(nameCell);

    // Add shift cells for each day
    for (let i = 0; i < 7; i++) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'shift-input';
        input.placeholder = 'OFF';
        input.addEventListener('change', updateTotals);
        cell.appendChild(input);
        row.appendChild(cell);
    }

    // Add total hours, O/T, and grand total cells
    const totalHoursCell = document.createElement('td');
    totalHoursCell.className = 'total-hours';
    totalHoursCell.textContent = '0.00';

    const otCell = document.createElement('td');
    otCell.className = 'ot-hours';
    otCell.textContent = '0.00';

    const grandTotalCell = document.createElement('td');
    grandTotalCell.className = 'grand-total';
    grandTotalCell.textContent = '0.00';

    row.appendChild(totalHoursCell);
    row.appendChild(otCell);
    row.appendChild(grandTotalCell);

    tableBody.appendChild(row);

    // Clear input fields
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('role').value = '';
}

function removeStaffMember(button) {
    const row = button.closest('tr');
    row.remove();
    updateTotals();
}

function updateTotals() {
    const rows = document.querySelectorAll('.staff-row');
    let weeklyTotal = 0;
    let otTotal = 0;

    rows.forEach(row => {
        let rowTotal = 0;
        const inputs = row.querySelectorAll('.shift-input');
        
        inputs.forEach(input => {
            const hours = parseShiftHours(input.value);
            rowTotal += hours;
        });

        const ot = rowTotal > 40 ? rowTotal - 40 : 0;
        weeklyTotal += rowTotal;
        otTotal += ot;

        row.querySelector('.total-hours').textContent = rowTotal.toFixed(2);
        row.querySelector('.ot-hours').textContent = ot.toFixed(2);
        row.querySelector('.grand-total').textContent = rowTotal.toFixed(2);
    });

    // Update footer totals
    document.querySelector('tfoot .total-hours').textContent = weeklyTotal.toFixed(2);
    document.querySelector('tfoot .total-ot').textContent = otTotal.toFixed(2);
    document.querySelector('tfoot .grand-total').textContent = weeklyTotal.toFixed(2);
}

function parseShiftHours(shiftText) {
    if (!shiftText || shiftText.toLowerCase() === 'off') return 0;
    
    const times = shiftText.split('-');
    if (times.length !== 2) return 0;

    const [start, end] = times.map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours + (minutes || 0) / 60;
    });

    let hours = end - start;
    if (hours < 0) hours += 24;
    return hours;
}

function saveAsImage() {
    html2canvas(document.getElementById('rotaContainer')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'rota.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}
