// Check if user is logged in before loading PO
function loadPO(poNumber = null) {
    const session = sessionStorage.getItem('sapSession');
    if (!session) {
        alert('Please login first!');
        location.reload();
        return;
    }
    
    // ... বাকি কোড একই থাকবে ...
}
// Global variable to store current PO data
let currentPO = null;

// Load PO Function
async function loadPO() {
    const poInput = document.getElementById('poNumber');
    const poNumber = poInput.value.trim();
    const statusBar = document.getElementById('statusBar');
    const poHeader = document.getElementById('poHeader');
    const poItemsBody = document.getElementById('poItemsBody');
    
    // Validation
    if (!poNumber) {
        updateStatus('❌ Please enter a PO Number', 'error');
        return;
    }

    // UI Reset
    updateStatus('⏳ Loading data from server...', 'info');
    poHeader.style.display = 'none';
    poItemsBody.innerHTML = '';
    
    try {
        // API Call (Relative Path - সবচেয়ে নিরাপদ)
        console.log(`🔄 Fetching /api/get-po?po=${poNumber}`);
        const response = await fetch(`/api/get-po?po=${poNumber}`);
        
        // Check if response is OK (Status 200-299)
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Server Error: ${response.status}`);
        }

        // Parse JSON
        const result = await response.json();
        console.log('✅ Data received:', result);

        if (!result.success) {
            throw new Error(result.error);
        }

        // Success! Store and Render
        currentPO = result.poData;
        renderHeader(currentPO.header);
        renderItems(currentPO.items);
        
        poHeader.style.display = 'block';
        updateStatus(`✅ PO ${poNumber} loaded successfully!`, 'success');

    } catch (error) {
        console.error('❌ Frontend Error:', error);
        updateStatus(`❌ ${error.message}`, 'error');
        
        // Helpful hint for demo
        if (error.message.includes('not found')) {
            updateStatus('💡 Try PO: 4500001234', 'warning');
        }
    }
}

// Render Header Data
function renderHeader(header) {
    document.getElementById('hdr-poNumber').textContent = header.poNumber;
    document.getElementById('hdr-vendor').textContent = header.vendor;
    document.getElementById('hdr-poDate').textContent = header.poDate;
    document.getElementById('hdr-currency').textContent = header.currency;
    document.getElementById('hdr-totalValue').textContent = header.totalValue;
    
    // Status Badge Logic
    const badge = document.getElementById('hdr-statusBadge');
    badge.textContent = header.status;
    badge.className = `status-badge ${header.status.toLowerCase()}`;
}

// Render Table Items
function renderItems(items) {
    const tbody = document.getElementById('poItemsBody');
    
    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.itemNo}</td>
            <td>${item.material}</td>
            <td>${item.description}</td>
            <td>${item.quantity} ${item.unit}</td>
            <td>${item.price}</td>
            <td><strong>${item.amount}</strong></td>
            <td>${item.deliveryDate}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Update Status Bar Helper
function updateStatus(message, type) {
    const bar = document.getElementById('statusBar');
    const icon = bar.querySelector('.status-icon') || document.createElement('span');
    const text = bar.querySelector('.status-text') || document.createElement('span');
    
    // Reset classes
    bar.className = 'status-bar';
    
    // Set content based on type
    if (type === 'success') {
        bar.classList.add('success');
        icon.textContent = '✅';
    } else if (type === 'error') {
        bar.classList.add('error');
        icon.textContent = '❌';
    } else if (type === 'warning') {
        bar.classList.add('warning');
        icon.textContent = '⚠️';
    } else {
        icon.textContent = 'ℹ️';
    }
    
    // Update HTML if elements don't exist yet
    if (!bar.querySelector('.status-icon')) {
        bar.innerHTML = '';
        bar.appendChild(icon);
        bar.appendChild(text);
    }
    
    text.textContent = message;
}

// Approve/Reject Action (Demo)
async function handleAction(action) {
    if (!currentPO) return;
    
    if (!confirm(`Do you want to ${action} PO ${currentPO.header.poNumber}?`)) {
        return;
    }

    try {
        const response = await fetch('/api/approve-po', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                poNumber: currentPO.header.poNumber,
                action: action
            })
        });
        const result = await response.json();
        
        if (result.success) {
            // Update UI locally
            currentPO.header.status = result.newStatus;
            renderHeader(currentPO.header);
            updateStatus(`✅ ${result.message}`, 'success');
        }
    } catch (error) {
        updateStatus(`❌ Action failed: ${error.message}`, 'error');
    }
}

// Initialize: Allow "Enter" key to search
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('poNumber');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadPO();
    });
    
    // Auto-load demo PO for convenience
    // loadPO(); 
});