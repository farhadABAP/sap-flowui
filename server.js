require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// ⚙️ MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// 🔐 LOGIN API
// ============================================
app.post('/api/login', (req, res) => {
    const { username, password, client } = req.body;
    
    console.log(`🔐 Login Attempt: User=${username}, Client=${client}`);
    
    // Demo Credentials (পরে SAP এ ভেরিফাই করা যাবে)
    if (username === 'demo' && password === 'demo123') {
        console.log(`✅ Login Success: ${username}`);
        return res.json({
            success: true,
            username: username,
            client: client || '100',
            message: 'Welcome to SAP PO Dashboard'
        });
    }
    
    // Invalid Credentials
    console.log(`❌ Login Failed: ${username}`);
    return res.status(401).json({
        success: false,
        error: 'Invalid Username or Password. Try: demo / demo123'
    });
});

// ============================================
// 📊 DASHBOARD STATS API (All POs)
// ============================================
app.get('/api/po-list', (req, res) => {
    console.log('📊 Fetching PO List for Dashboard');
    
    // Multiple POs for Dashboard Stats
    const poList = [
        { poNumber: '4500001234', vendor: 'Siemens AG', poDate: '2024-01-15', status: 'Approved', totalValue: '15750.00' },
        { poNumber: '4500001235', vendor: 'Bosch GmbH', poDate: '2024-01-20', status: 'Pending', totalValue: '8420.00' },
        { poNumber: '4500001236', vendor: 'SAP SE', poDate: '2024-02-01', status: 'Rejected', totalValue: '25000.00' },
        { poNumber: '4500001237', vendor: 'ABB Ltd', poDate: '2024-02-05', status: 'Approved', totalValue: '12300.00' },
        { poNumber: '4500001238', vendor: 'Schneider Electric', poDate: '2024-02-10', status: 'Pending', totalValue: '9800.00' },
        { poNumber: '4500001239', vendor: 'General Electric', poDate: '2024-02-15', status: 'Approved', totalValue: '18500.00' },
        { poNumber: '4500001240', vendor: 'Honeywell Inc', poDate: '2024-02-20', status: 'Pending', totalValue: '7200.00' }
    ];
    
    res.json({ success: true,  poList });
});

// ============================================
// 📋 GET SINGLE PO DETAILS
// ============================================
const mockPOs = {
    '4500001234': {
        header: {
            poNumber: "4500001234",
            vendor: "10001234 - Siemens AG",
            vendorName: "Siemens Aktiengesellschaft",
            poDate: "2024-01-15",
            currency: "EUR",
            status: "Approved",
            totalValue: "15,750.00",
            purchasingOrg: "1000",
            companyCode: "1000",
            paymentTerms: "0001"
        },
        items: [
            { itemNo: "10", material: "1000001", description: "Motor Assembly M100 - High Performance", quantity: "10", unit: "PC", price: "450.00", amount: "4,500.00", deliveryDate: "2024-02-01", plant: "1000", storageLoc: "0001" },
            { itemNo: "20", material: "1000002", description: "Control Unit CU-200 - Industrial Grade", quantity: "5", unit: "PC", price: "1,200.00", amount: "6,000.00", deliveryDate: "2024-02-15", plant: "1000", storageLoc: "0002" },
            { itemNo: "30", material: "1000003", description: "Cable Set CS-50 - Power Supply", quantity: "50", unit: "M", price: "25.00", amount: "1,250.00", deliveryDate: "2024-01-25", plant: "1100", storageLoc: "0001" },
            { itemNo: "40", material: "1000004", description: "Mounting Bracket MB-10 - Steel", quantity: "100", unit: "PC", price: "40.00", amount: "4,000.00", deliveryDate: "2024-02-10", plant: "1000", storageLoc: "0003" }
        ]
    },
    '4500001235': {
        header: {
            poNumber: "4500001235",
            vendor: "20005678 - Bosch GmbH",
            vendorName: "Robert Bosch GmbH",
            poDate: "2024-01-20",
            currency: "EUR",
            status: "Pending",
            totalValue: "8,420.00",
            purchasingOrg: "1000",
            companyCode: "1000",
            paymentTerms: "0002"
        },
        items: [
            { itemNo: "10", material: "2000001", description: "Sensor Module SM-50 - Temperature", quantity: "20", unit: "PC", price: "120.00", amount: "2,400.00", deliveryDate: "2024-02-20", plant: "1000", storageLoc: "0001" },
            { itemNo: "20", material: "2000002", description: "Connector Kit CK-100 - Universal", quantity: "100", unit: "SET", price: "15.00", amount: "1,500.00", deliveryDate: "2024-02-05", plant: "1100", storageLoc: "0002" },
            { itemNo: "30", material: "2000003", description: "Power Adapter PA-220 - 24V DC", quantity: "30", unit: "PC", price: "85.00", amount: "2,550.00", deliveryDate: "2024-02-28", plant: "1000", storageLoc: "0001" }
        ]
    },
    '4500001236': {
        header: {
            poNumber: "4500001236",
            vendor: "30009999 - SAP SE",
            vendorName: "SAP SE Walldorf",
            poDate: "2024-02-01",
            currency: "USD",
            status: "Rejected",
            totalValue: "25,000.00",
            purchasingOrg: "2000",
            companyCode: "2000",
            paymentTerms: "0003"
        },
        items: [
            { itemNo: "10", material: "3000001", description: "Software License SL-ENT - Enterprise Edition", quantity: "50", unit: "LIC", price: "500.00", amount: "25,000.00", deliveryDate: "2024-03-01", plant: "2000", storageLoc: "0001" }
        ]
    }
};

app.get('/api/get-po', (req, res) => {
    const poNumber = req.query.po?.trim();
    
    console.log(`📋 Fetching PO: ${poNumber}`);
    
    if (!poNumber) {
        return res.status(400).json({ success: false, error: 'PO number is required' });
    }
    
    const poData = mockPOs[poNumber];
    
    if (!poData) {
        return res.status(404).json({ 
            success: false, 
            error: `PO ${poNumber} not found. Try: 4500001234, 4500001235, 4500001236` 
        });
    }
    
    console.log(`✅ PO ${poNumber} sent successfully`);
    res.json({ success: true,  poData });
});

// ============================================
// ✓✗ APPROVE/REJECT PO API
// ============================================
app.post('/api/approve-po', (req, res) => {
    const { poNumber, action } = req.body;
    
    console.log(`🔄 ${action} PO: ${poNumber}`);
    
    if (!poNumber || !action) {
        return res.status(400).json({ success: false, error: 'PO number and action required' });
    }
    
    // Update mock data status (in-memory for demo)
    if (mockPOs[poNumber]) {
        mockPOs[poNumber].header.status = action;
    }
    
    res.json({ 
        success: true, 
        message: `PO ${poNumber} has been ${action}ed`,
        newStatus: action
    });
});

// ============================================
// 📥 EXPORT TO CSV API
// ============================================
app.get('/api/export-po', (req, res) => {
    console.log('📥 Exporting PO data to CSV');
    
    const poList = [
        { poNumber: '4500001234', vendor: 'Siemens AG', poDate: '2024-01-15', status: 'Approved', totalValue: '15750.00' },
        { poNumber: '4500001235', vendor: 'Bosch GmbH', poDate: '2024-01-20', status: 'Pending', totalValue: '8420.00' },
        { poNumber: '4500001236', vendor: 'SAP SE', poDate: '2024-02-01', status: 'Rejected', totalValue: '25000.00' }
    ];
    
    let csv = 'PO Number,Vendor,Date,Status,Total Value\n';
    poList.forEach(po => {
        csv += `${po.poNumber},${po.vendor},${po.poDate},${po.status},${po.totalValue}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=PO_Export.csv');
    res.send(csv);
});

// ============================================
// 🚀 SERVER START
// ============================================
app.listen(PORT, () => {
    console.log(`\n✅ ========================================`);
    console.log(`   🚀 SAP PO Dashboard Running!`);
    console.log(`   📡 URL: http://localhost:${PORT}`);
    console.log(`   🔐 Login: demo / demo123`);
    console.log(`   📊 Try POs: 4500001234, 4500001235, 4500001236`);
    console.log(`✅ ========================================\n`);
});