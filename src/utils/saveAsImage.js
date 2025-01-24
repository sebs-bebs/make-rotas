import html2canvas from 'html2canvas';

export async function saveAsImage(elementId, filename) {
  try {
    // Get table
    const table = document.getElementById(elementId);
    if (!table) return;

    // Create container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.background = '#fff';
    document.body.appendChild(container);

    // Create new table
    const newTable = document.createElement('table');
    newTable.style.borderCollapse = 'collapse';
    newTable.style.width = 'auto';
    newTable.style.background = '#fff';
    container.appendChild(newTable);

    // Copy only the necessary rows and cells
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      const newRow = document.createElement('tr');
      
      // Copy cells
      row.querySelectorAll('td, th').forEach((cell, cellIndex) => {
        const newCell = document.createElement(cell.tagName.toLowerCase());
        
        // Copy text content, handling special cases
        if (cellIndex === 0 && cell.tagName === 'TD') {
          // For staff names column, get text directly from cell
          const staffName = cell.textContent.replace('OFF', '').trim();
          newCell.textContent = staffName;
        } else if (cell.querySelector('input[type="checkbox"]')) {
          newCell.textContent = cell.querySelector('input[type="checkbox"]').checked ? 'OFF' : '';
        } else if (cell.querySelector('select')) {
          const select = cell.querySelector('select');
          newCell.textContent = select.value || '';
        } else {
          // For other cells, clean up the text
          newCell.textContent = cell.textContent.replace(/\s+/g, ' ').trim();
        }

        // Style cell
        newCell.style.border = '1px solid #e5e7eb';
        newCell.style.padding = '0.75rem';
        newCell.style.textAlign = cellIndex === 0 ? 'left' : 'center';
        newCell.style.background = cell.tagName === 'TH' ? '#f9fafb' : '#fff';
        newCell.style.color = '#374151';
        
        // Set width
        if (cellIndex === 0) {
          newCell.style.width = '150px'; // First column wider
          newCell.style.fontWeight = 'normal';
        } else {
          newCell.style.width = '120px';
        }

        newRow.appendChild(newCell);
      });

      newTable.appendChild(newRow);
    });

    // Capture
    const canvas = await html2canvas(newTable, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      width: newTable.offsetWidth,
      height: newTable.offsetHeight
    });

    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(container);
    }, 'image/png');

  } catch (error) {
    console.error('Capture error:', error);
  }
}