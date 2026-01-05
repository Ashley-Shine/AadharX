// ====== MOCK DATA ======
const MOCK_PATIENTS = {
    '123456789012': {
        name: 'Rajesh Kumar',
        dob: '1990-05-15',
        age: 34,
        gender: 'Male',
        bloodType: 'O+',
        phone: '+91 9876543210',
        address: '123 Main Street, Delhi 110045',
        medical: {
            allergies: ['Penicillin', 'NSAIDs'],
            conditions: ['Hypertension', 'Type 2 Diabetes'],
            medications: ['Metformin 500mg', 'Amlodipine 5mg'],
            lastVisit: '2024-01-15: Apollo Hospital - Fever treatment',
            surgeries: ['Appendectomy (2018)']
        },
        emergencyContacts: [
            { name: 'Ramesh Kumar', relation: 'Father', phone: '+91 8765432109' },
            { name: 'Priya Kumar', relation: 'Sister', phone: '+91 7654321098' }
        ],
        government: {
            pan: 'ABCDE1234F',
            voterId: 'DL/2023/1234567',
            rationCard: 'BPL-2024-001',
            aadhaar: '1234 5678 9012'
        },
        financial: {
            bank: 'State Bank of India',
            account: 'XXXXXX1234',
            creditScore: 780
        }
    },
    '987654321098': {
        name: 'Priya Sharma',
        dob: '1985-12-20',
        age: 38,
        gender: 'Female',
        bloodType: 'A-',
        phone: '+91 8765432109',
        address: '456 Park Avenue, Mumbai 400001',
        medical: {
            allergies: ['Iodine', 'Latex'],
            conditions: ['Asthma', 'Migraine'],
            medications: ['Salbutamol inhaler', 'Sumatriptan'],
            lastVisit: '2024-02-10: Fortis Hospital - Asthma checkup'
        },
        emergencyContacts: [
            { name: 'Amit Sharma', relation: 'Husband', phone: '+91 7654321098' }
        ]
    },
    '456789012345': {
        name: 'Amit Patel',
        dob: '1978-03-10',
        age: 46,
        gender: 'Male',
        bloodType: 'B+',
        phone: '+91 7654321098',
        address: '789 Gandhi Road, Ahmedabad 380001',
        medical: {
            allergies: [],
            conditions: [],
            medications: [],
            lastVisit: '2023-11-05: Regular checkup - All clear'
        },
        emergencyContacts: [
            { name: 'Neha Patel', relation: 'Wife', phone: '+91 6543210987' }
        ]
    }
};

const FORM_TEMPLATES = {
    ration: {
        name: 'Ration Card Application Form',
        fields: [
            { id: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
            { id: 'fatherName', label: "Father's/Husband's Name", type: 'text', required: true },
            { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
            { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
            { id: 'address', label: 'Residential Address', type: 'textarea', required: true },
            { id: 'familyMembers', label: 'Number of Family Members', type: 'number', required: true },
            { id: 'annualIncome', label: 'Annual Family Income (₹)', type: 'number', required: true },
            { id: 'rationCardType', label: 'Type of Ration Card Required', type: 'select', options: ['BPL', 'APL', 'AAY'], required: true }
        ],
        timeToFill: 45,
        fieldsCount: 24
    },
    passport: {
        name: 'Passport Application Form',
        fields: [
            { id: 'fullName', label: 'Full Name (as in Aadhaar)', type: 'text', required: true },
            { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
            { id: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true },
            { id: 'fatherName', label: "Father's Name", type: 'text', required: true },
            { id: 'motherName', label: "Mother's Name", type: 'text', required: true },
            { id: 'address', label: 'Current Address', type: 'textarea', required: true },
            { id: 'permanentAddress', label: 'Permanent Address', type: 'textarea', required: true },
            { id: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'], required: true }
        ],
        timeToFill: 60,
        fieldsCount: 30
    }
};

// ====== EMERGENCY FUNCTIONS ======
let currentPatient = null;

function testPatient(aadhaar) {
    document.getElementById('aadhaarInput').value = aadhaar;
    fetchPatientData();
}

function checkkey() {
    const hospitalkey = document.getElementById('hospitalkeyInput').value.trim();

    if (hospitalkey === 'HOSP1234') {
        fetchPatientData();
    } else {
        showKeyPopup('Invalid Hospital Key. Access Denied.');
    }
}


function showKeyPopup(message) {
    document.getElementById('keyErrorMessage').innerText = message;
    document.getElementById('keyErrorModal').style.display = 'flex';
}

function closeKeyModal() {
    document.getElementById('keyErrorModal').style.display = 'none';
}

function fetchPatientData() {
    const aadhaar = document.getElementById('aadhaarInput').value.trim();
    
    if (!aadhaar || aadhaar.length !== 12) {
        showAlert('Please enter a valid 12-digit Aadhaar number');
        return;
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Simulate API call delay
    setTimeout(() => {
        currentPatient = MOCK_PATIENTS[aadhaar] || MOCK_PATIENTS['123456789012'];
        
        if (!currentPatient) {
            showAlert('Patient not found in database');
            document.getElementById('loading').style.display = 'none';
            return;
        }
        
        displayPatientData();
        
        // Update access time
        document.getElementById('accessTime').textContent = 
            `Accessed: ${new Date().toLocaleTimeString()}`;
        
        // Hide loading, show results
        document.getElementById('loading').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        
        // Scroll to results
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
        
    }, 1500);
}

function displayPatientData() {
    if (!currentPatient) return;
    
    // AI Analysis
    let aiAnalysis = "⚠️ <strong>AI Analysis Complete</strong><br>";
    if (currentPatient.medical.allergies.length > 0) {
        aiAnalysis += `• Critical allergies detected: ${currentPatient.medical.allergies.join(', ')}<br>`;
    }
    if (currentPatient.medical.conditions.length > 0) {
        aiAnalysis += `• Medical conditions: ${currentPatient.medical.conditions.join(', ')}<br>`;
    }
    if (currentPatient.bloodType) {
        aiAnalysis += `• Blood type: ${currentPatient.bloodType}<br>`;
    }
    if (currentPatient.medical.allergies.length === 0 && currentPatient.medical.conditions.length === 0) {
        aiAnalysis = "✅ <strong>AI Analysis:</strong> No critical issues detected. Patient has clean medical history.";
    }
    document.getElementById('aiAnalysis').innerHTML = aiAnalysis;
    
    // Patient Details
    document.getElementById('patientDetails').innerHTML = `
        <p><strong>Name:</strong> ${currentPatient.name}</p>
        <p><strong>Age:</strong> ${currentPatient.age} years</p>
        <p><strong>Gender:</strong> ${currentPatient.gender}</p>
        <p><strong>Contact:</strong> ${currentPatient.phone}</p>
        <p><strong>Address:</strong> ${currentPatient.address}</p>
    `;
    
    // Medical History
    let medicalHTML = '';
    if (currentPatient.medical.conditions.length > 0) {
        medicalHTML += `<p><strong>Conditions:</strong> ${currentPatient.medical.conditions.join(', ')}</p>`;
    }
    if (currentPatient.medical.medications.length > 0) {
        medicalHTML += `<p><strong>Medications:</strong> ${currentPatient.medical.medications.join(', ')}</p>`;
    }
    medicalHTML += `<p><strong>Last Visit:</strong> ${currentPatient.medical.lastVisit}</p>`;
    if (currentPatient.medical.surgeries) {
        medicalHTML += `<p><strong>Surgeries:</strong> ${currentPatient.medical.surgeries.join(', ')}</p>`;
    }
    document.getElementById('medicalHistory').innerHTML = medicalHTML;
    
    // Critical Alerts
    let alertsHTML = '';
    if (currentPatient.medical.allergies.length > 0) {
        alertsHTML += `<div class="alert-item danger">
            <i class="fas fa-skull-crossbones"></i>
            <div>
                <strong>ALLERGIES</strong>
                <p>${currentPatient.medical.allergies.join(', ')}</p>
            </div>
        </div>`;
    }
    if (currentPatient.bloodType) {
        alertsHTML += `<div class="alert-item info">
            <i class="fas fa-tint"></i>
            <div>
                <strong>BLOOD TYPE</strong>
                <p>${currentPatient.bloodType}</p>
            </div>
        </div>`;
    }
    if (currentPatient.medical.conditions.length > 0) {
        alertsHTML += `<div class="alert-item warning">
            <i class="fas fa-stethoscope"></i>
            <div>
                <strong>MEDICAL CONDITIONS</strong>
                <p>${currentPatient.medical.conditions.join(', ')}</p>
            </div>
        </div>`;
    }
    document.getElementById('criticalAlerts').innerHTML = alertsHTML || 
        '<p class="no-alerts">No critical alerts detected</p>';
    
    // Emergency Contacts
    let contactsHTML = '';
    currentPatient.emergencyContacts.forEach(contact => {
        contactsHTML += `
            <div class="contact">
                <strong>${contact.name}</strong> (${contact.relation})<br>
                <i class="fas fa-phone"></i> ${contact.phone}
            </div>
        `;
    });
    document.getElementById('emergencyContacts').innerHTML = contactsHTML;
}

// ====== QR SCANNER FUNCTIONS ======
function openQRScanner() {
    document.getElementById('qrModal').style.display = 'flex';
}

function closeQRScanner() {
    document.getElementById('qrModal').style.display = 'none';
}

function simulateQRScan() {
    // Simulate scanning a QR code
    document.getElementById('aadhaarInput').value = '123456789012';
    closeQRScanner();
    fetchPatientData();
    showAlert('QR code scanned successfully!', 'success');
}

// ====== FORM FUNCTIONS ======
function loadCitizenProfile() {
    const aadhaar = document.getElementById('formAadhaar').value.trim();
    
    if (!aadhaar || aadhaar.length !== 12) {
        showAlert('Please enter valid Aadhaar number');
        return;
    }
    
    const patient = MOCK_PATIENTS[aadhaar] || MOCK_PATIENTS['123456789012'];
    
    document.getElementById('citizenName').textContent = patient.name;
    document.getElementById('citizenAadhaar').textContent = `•••• •••• ${aadhaar.slice(-4)}`;
    document.getElementById('citizenAddress').textContent = patient.address;
    
    document.getElementById('citizenProfile').style.display = 'block';
    showAlert('Citizen profile loaded successfully', 'success');
}

function selectForm(formType) {
    const form = FORM_TEMPLATES[formType];
    if (!form) return;
    
    document.getElementById('formTitle').textContent = form.name;
    document.getElementById('timeSaved').textContent = form.timeToFill - 2;
    document.getElementById('aiFilled').textContent = form.fields.length;
    
    // Generate form fields
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = '';
    
    form.fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field';
        
        let fieldHTML = `<label for="${field.id}">${field.label}</label>`;
        
        if (field.type === 'select') {
            fieldHTML += `
                <select id="${field.id}">
                    <option value="">Select...</option>
                    ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
            `;
        } else if (field.type === 'textarea') {
            fieldHTML += `<textarea id="${field.id}" rows="3"></textarea>`;
        } else {
            fieldHTML += `<input type="${field.type}" id="${field.id}">`;
        }
        
        fieldHTML += `<div class="auto-fill-badge"><i class="fas fa-robot"></i> Will auto-fill</div>`;
        
        fieldDiv.innerHTML = fieldHTML;
        formFields.appendChild(fieldDiv);
    });
    
    // Show form display
    document.getElementById('formDisplay').style.display = 'block';
    
    // Auto-fill after a delay
    setTimeout(() => autoFillForm(formType), 500);
}

function autoFillForm(formType) {
    const patient = MOCK_PATIENTS['123456789012']; // Use default patient
    const form = FORM_TEMPLATES[formType];
    
    form.fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element) return;
        
        let value = '';
        
        // Map fields to patient data
        switch(field.id) {
            case 'applicantName':
            case 'fullName':
                value = patient.name;
                break;
            case 'fatherName':
                value = 'Ramesh Kumar';
                break;
            case 'motherName':
                value = 'Sunita Kumar';
                break;
            case 'dob':
                value = patient.dob;
                break;
            case 'gender':
                value = patient.gender;
                break;
            case 'address':
            case 'permanentAddress':
                value = patient.address;
                break;
            case 'familyMembers':
                value = '4';
                break;
            case 'annualIncome':
                value = '500000';
                break;
            case 'placeOfBirth':
                value = 'Delhi';
                break;
            case 'maritalStatus':
                value = 'Married';
                break;
            case 'rationCardType':
                value = patient.government?.rationCard?.includes('BPL') ? 'BPL' : 'APL';
                break;
        }
        
        if (value) {
            if (element.tagName === 'SELECT') {
                element.value = value;
            } else {
                element.value = value;
            }
            
            // Add auto-filled styling
            element.style.backgroundColor = '#f0f9ff';
            element.style.borderColor = '#3b82f6';
        }
    });
    
    // Show success message
    showAlert(`${form.fields.length} fields auto-filled successfully!`, 'success');
}

// ====== VAULT FUNCTIONS ======
function manageAccess(vaultType) {
    const vaultNames = {
        medical: 'Medical Vault',
        govt: 'Government Vault',
        financial: 'Financial Vault'
    };
    
    showAlert(`Managing access for ${vaultNames[vaultType]}. In full version, this would open access control panel.`, 'info');
}

function generateQR() {
    document.getElementById('qrGenerator').style.display = 'block';
}

function closeQRGenerator() {
    document.getElementById('qrGenerator').style.display = 'none';
}

// ====== UTILITY FUNCTIONS ======
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert ${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            .custom-alert {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .custom-alert.success {
                background: #d1fae5;
                color: #065f46;
                border-left: 4px solid #10b981;
            }
            .custom-alert.danger {
                background: #fee2e2;
                color: #991b1b;
                border-left: 4px solid #dc2626;
            }
            .custom-alert.info {
                background: #dbeafe;
                color: #1e40af;
                border-left: 4px solid #3b82f6;
            }
            .custom-alert button {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: auto;
                color: inherit;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

function clearResults() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('aadhaarInput').value = '';
    currentPatient = null;
    showAlert('Cleared. Ready for next patient.', 'info');
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function() {
    // Set current time in emergency access log
    const now = new Date();
    document.getElementById('accessTime').textContent = 
        `Accessed: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
    // Load access logs in citizen page
    if (document.getElementById('accessLogBody')) {
        loadAccessLogs();
    }
});

function loadAccessLogs() {
    const logs = [
        {
            time: new Date(Date.now() - 3600000).toLocaleTimeString(),
            vault: 'Medical',
            accessor: 'Apollo Hospital',
            purpose: 'Emergency treatment',
            status: 'Completed'
        },
        {
            time: new Date(Date.now() - 7200000).toLocaleTimeString(),
            vault: 'Government',
            accessor: 'Ration Office',
            purpose: 'Subsidy verification',
            status: 'Completed'
        },
        {
            time: new Date(Date.now() - 86400000).toLocaleTimeString(),
            vault: 'Medical',
            accessor: 'City Clinic',
            purpose: 'Routine checkup',
            status: 'Completed'
        }
    ];
    
    const logBody = document.getElementById('accessLogBody');
    if (logBody) {
        logBody.innerHTML = logs.map(log => `
            <div class="log-row">
                <div class="log-cell">${log.time}</div>
                <div class="log-cell">
                    <span class="vault-tag ${log.vault.toLowerCase()}">
                        ${log.vault}
                    </span>
                </div>
                <div class="log-cell">${log.accessor}</div>
                <div class="log-cell">${log.purpose}</div>
                <div class="log-cell">
                    <span class="status-badge ${log.status.toLowerCase()}">
                        ${log.status}
                    </span>
                </div>
            </div>
        `).join('');
    }
}

// Add these styles to the existing styles.css
const additionalStyles = `
.vault-tag {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
}
.vault-tag.medical {
    background: #fee2e2;
    color: #991b1b;
}
.vault-tag.government {
    background: #dbeafe;
    color: #1e40af;
}
.vault-tag.financial {
    background: #d1fae5;
    color: #065f46;
}
.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
}
.status-badge.completed {
    background: #d1fae5;
    color: #065f46;
}
.log-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 2fr 1fr;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
}
.log-row:last-child {
    border-bottom: none;
}
.auto-fill-badge {
    font-size: 0.75rem;
    color: #2563eb;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
}
`;

// Inject additional styles
if (!document.querySelector('#additional-styles')) {
    const style = document.createElement('style');
    style.id = 'additional-styles';
    style.textContent = additionalStyles;
    document.head.appendChild(style);
}

// Add to your existing script.js file

// Show alert function (if not already exists)
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert ${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

// Your existing fetchPatientData function should work with QR scanner
// Make sure it uses the aadhaarInput value