let allPOs = [];
let currentPO = null;

// Load All POs for Dashboard Stats
async function loadAllPOs() {
    try {
        const res = await fetch('/api/po-list');
        const data = await res.json();
        
        if (data.success) {
            allPOs = data.poList;
            updateStats(allPOs);
            showToast('📊 Dashboard updated!');
        }
    } catch (err) {
        console.error(err);
    }
}

// Update Stats Cards
function updateStats(pos) {
    const approved = pos.filter(p => p.status === 'Approved').length;
    const pending = pos.filter(p => p.status === 'Pending').length;
    const rejected = pos.filter(p => p.status === 'Rejected').length;
    const total = pos.reduce((sum, p) => sum + parseFloat(p.totalValue.replace(/,/g, '')), 0);
    
    document.getElementById('statApproved').textContent = approved;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statRejected').textContent = rejected;
    document.getElementById('statTotal').textContent = '€' + total.toLocaleString();
}

// Load Single PO
async function loadPO() {
    const po = document.getElementById('poInput').value;
    const status = document.getElementById('status');
    const details = document.getElementById('poDetails');
    
    status.textContent = '⏳ Loading...';
    details.style.display = 'none';
    
    try {
        const res = await fetch(`/api/get-po?po=${po}`);
        const data = await res.json();
        
        if (data.success) {
            currentPO = data.poData;
            renderPO(currentPO);
            status.textContent = '✅ PO Loaded';
            details.style.display = 'block';
            showToast('✅ PO loaded successfully!');
        } else {
            status.textContent = '❌ ' + data.error;
            showToast('❌ ' + data.error);
        }
    } catch (err) {
        status.textContent = '❌ Error';
        showToast('❌ Connection failed');
    }
}

// Render PO Data
function renderPO(po) {
    document.getElementById('poNumber').textContent = po.header.poNumber;
    document.getElementById('poVendor').textContent = po.header.vendor;
    document.getElementById('poDate').textContent = po.header.poDate;
    document.getElementById('poCurrency').textContent = po.header.currency;
    document.getElementById('poTotal').textContent = po.header.totalValue;
    
    const badge = document.getElementById('poStatus');
    badge.textContent = po.header.status;
    badge.className = `status-badge ${po.header.status.toLowerCase()}`;
    
    const tbody = document.getElementById('itemsBody');
    tbody.innerHTML = '';
    po.items.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.itemNo}</td>
                <td>${item.material}</td>
                <td>${item.description}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>€${item.price}</td>
                <td><strong>€${item.amount}</strong></td>
            </tr>
        `;
    });
}

// Action (Approve/Reject)
async function actionPO(action) {
    if (!currentPO) return;
    
    try {
        const res = await fetch('/api/approve-po', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ poNumber: currentPO.header.poNumber, action })
        });
        
        const data = await res.json();
        
        if (data.success) {
            currentPO.header.status = data.newStatus;
            renderPO(currentPO);
            loadAllPOs(); // Refresh stats
            showToast(`✅ PO ${action}ed successfully!`);
        }
    } catch (err) {
        showToast('❌ Action failed');
    }
}

// Toggle Dark Mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const btn = document.querySelector('.btn-icon');
    btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    showToast(document.body.classList.contains('dark-mode') ? '🌙 Dark Mode ON' : '☀️ Light Mode ON');
}

// Export to Excel (CSV)
function exportData() {
    if (allPOs.length === 0) {
        showToast('❌ No data to export');
        return;
    }
    
    let csv = 'PO Number,Vendor,Date,Status,Total\n';
    allPOs.forEach(po => {
        csv += `${po.poNumber},${po.vendor},${po.poDate},${po.status},${po.totalValue}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PO_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showToast('📥 Exported successfully!');
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    const user = sessionStorage.getItem('sapUser');
    if (user) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userInfo').textContent = '👤 ' + user;
        loadAllPOs();
    }
});