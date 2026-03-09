async function loadPO() {
    const po = document.getElementById('poInput').value;
    const status = document.getElementById('status');
    const poData = document.getElementById('poData');
    
    status.textContent = '⏳ Loading...';
    poData.style.display = 'none';
    
    try {
        const res = await fetch(`/api/get-po?po=${po}`);
        const data = await res.json();
        
        if (data.success) {
            renderPO(data.poData);
            status.textContent = '✅ Loaded';
            poData.style.display = 'block';
        } else {
            status.textContent = '❌ ' + data.error;
        }
    } catch (err) {
        status.textContent = '❌ Error: ' + err.message;
    }
}

function renderPO(po) {
    // Header
    document.getElementById('headerData').innerHTML = `
        <p><strong>PO:</strong> ${po.header.poNumber}</p>
        <p><strong>Vendor:</strong> ${po.header.vendor}</p>
        <p><strong>Status:</strong> ${po.header.status}</p>
        <p><strong>Total:</strong> ${po.header.totalValue}</p>
    `;
    
    // Items
    const tbody = document.getElementById('itemsBody');
    tbody.innerHTML = '';
    po.items.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.itemNo}</td>
                <td>${item.material}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.amount}</td>
            </tr>
        `;
    });
}