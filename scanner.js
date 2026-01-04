// scanner.js - Complete QR Scanner with Camera Access
class QRScanner {
    constructor() {
        this.html5QrCode = null;
        this.cameraStream = null;
        this.scanTimer = null;
        this.scanning = false;
        this.scanStartTime = null;
        this.cameraId = null;
        
        // QR code patterns for Aadhaar validation
        this.aadhaarPatterns = [
            /AADHAAR:(\d{12})/i,
            /UID:(\d{12})/i,
            /(\d{4}\s?\d{4}\s?\d{4})/, // 12 digits with optional spaces
            /^(\d{12})$/ // Plain 12 digits
        ];
    }
    
    // Initialize the scanner
    async initialize() {
        try {
            // Initialize HTML5 QR Code scanner
            this.html5QrCode = new Html5Qrcode("qrReader");
            
            // Get available cameras
            await this.loadCameras();
            
            // Start camera selection listener
            document.getElementById('cameraSelect').addEventListener('change', (e) => {
                this.switchCamera(e.target.value);
            });
            
            this.updateStatus('Ready to scan', 'info');
            return true;
        } catch (error) {
            this.showError('Initialization Failed', 'Failed to initialize QR scanner: ' + error.message);
            return false;
        }
    }
    
    // Load available cameras
    async loadCameras() {
        try {
            const devices = await Html5Qrcode.getCameras();
            const select = document.getElementById('cameraSelect');
            select.innerHTML = '';
            
            if (devices && devices.length > 0) {
                devices.forEach((device, index) => {
                    const option = document.createElement('option');
                    option.value = device.id;
                    option.text = device.label || `Camera ${index + 1}`;
                    select.appendChild(option);
                });
                
                // Select first back camera by default
                const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
                this.cameraId = backCamera ? backCamera.id : devices[0].id;
                select.value = this.cameraId;
                
                // Auto-start camera
                this.startCamera();
            } else {
                throw new Error('No cameras found');
            }
        } catch (error) {
            this.showError('Camera Error', 'No camera detected. Please check permissions or connect a camera.');
        }
    }
    
    // Start camera with selected device
    async startCamera(cameraId = this.cameraId) {
        if (!cameraId) return;
        
        try {
            this.updateStatus('Starting camera...', 'loading');
            
            // Configuration for QR scanning
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1,
                disableFlip: false
            };
            
            // Start QR code scanning
            await this.html5QrCode.start(
                cameraId,
                config,
                (decodedText) => this.onScanSuccess(decodedText),
                (errorMessage) => this.onScanError(errorMessage)
            );
            
            this.scanning = true;
            this.startScanTimer();
            this.updateStatus('Scanning...', 'scanning');
            
        } catch (error) {
            this.showError('Camera Start Failed', error.message);
        }
    }
    
    // Switch to different camera
    async switchCamera(newCameraId) {
        if (!newCameraId || !this.scanning) return;
        
        try {
            await this.stopCamera();
            this.cameraId = newCameraId;
            await this.startCamera(newCameraId);
        } catch (error) {
            console.error('Failed to switch camera:', error);
        }
    }
    
    // Stop camera
    async stopCamera() {
        if (this.html5QrCode && this.scanning) {
            try {
                await this.html5QrCode.stop();
                this.scanning = false;
                this.stopScanTimer();
                this.updateStatus('Camera stopped', 'info');
            } catch (error) {
                console.error('Failed to stop camera:', error);
            }
        }
    }
    
    // Handle successful scan
    onScanSuccess(decodedText) {
        console.log('QR Code scanned:', decodedText);
        
        // Validate if it's an Aadhaar QR code
        const aadhaarNumber = this.extractAadhaarNumber(decodedText);
        
        if (aadhaarNumber) {
            this.stopCamera();
            this.stopScanTimer();
            this.showScanResult(aadhaarNumber, decodedText);
        } else {
            // Not an Aadhaar QR code
            this.showError('Invalid QR Code', 'This QR code does not contain a valid Aadhaar number.');
            setTimeout(() => {
                this.updateStatus('Scanning...', 'scanning');
            }, 2000);
        }
    }
    
    // Handle scan errors
    onScanError(errorMessage) {
        // Don't show errors if we're not actively scanning
        if (!this.scanning) return;
        
        // Update status but don't show error modal for continuous errors
        if (errorMessage.includes('NotFoundException') || errorMessage.includes('NotReadableError')) {
            this.updateStatus('No QR code detected', 'warning');
        }
    }
    
    // Extract Aadhaar number from QR text
    extractAadhaarNumber(qrText) {
        for (const pattern of this.aadhaarPatterns) {
            const match = qrText.match(pattern);
            if (match) {
                // Extract and clean the Aadhaar number
                let aadhaar = match[1] || match[0];
                // Remove any non-digit characters
                aadhaar = aadhaar.replace(/\D/g, '');
                
                // Validate it's exactly 12 digits
                if (aadhaar.length === 12 && /^\d+$/.test(aadhaar)) {
                    return aadhaar;
                }
            }
        }
        return null;
    }
    
    // Show scan result
    showScanResult(aadhaarNumber, rawData) {
        document.getElementById('scanResult').style.display = 'block';
        document.getElementById('scannedData').textContent = `Aadhaar: ${aadhaarNumber}`;
        
        // Store the scanned data globally
        window.scannedAadhaar = aadhaarNumber;
        window.scannedQRData = rawData;
        
        this.updateStatus('QR Code found!', 'success');
    }
    
    // Show error message
    showError(title, message) {
        const errorDiv = document.getElementById('scannerError');
        const titleEl = document.getElementById('errorTitle');
        const messageEl = document.getElementById('errorMessage');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        errorDiv.style.display = 'block';
        this.updateStatus(title, 'error');
    }
    
    // Hide error message
    hideError() {
        document.getElementById('scannerError').style.display = 'none';
    }
    
    // Update status message
    updateStatus(message, type = 'info') {
        const statusEl = document.getElementById('scannerStatus');
        let icon = 'fa-camera';
        let color = 'white';
        
        switch(type) {
            case 'success':
                icon = 'fa-check-circle';
                color = '#10b981';
                break;
            case 'error':
                icon = 'fa-exclamation-circle';
                color = '#ef4444';
                break;
            case 'warning':
                icon = 'fa-exclamation-triangle';
                color = '#f59e0b';
                break;
            case 'loading':
                icon = 'fa-spinner fa-spin';
                color = '#3b82f6';
                break;
            case 'scanning':
                icon = 'fa-search';
                color = '#3b82f6';
                break;
        }
        
        statusEl.innerHTML = `<i class="fas ${icon}" style="color: ${color}"></i> ${message}`;
    }
    
    // Start scan timer
    startScanTimer() {
        this.scanStartTime = Date.now();
        this.scanTimer = setInterval(() => {
            const elapsed = Date.now() - this.scanStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const display = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
            document.getElementById('scanTimer').textContent = display;
        }, 1000);
    }
    
    // Stop scan timer
    stopScanTimer() {
        if (this.scanTimer) {
            clearInterval(this.scanTimer);
            this.scanTimer = null;
        }
    }
    
    // Clean up resources
    cleanup() {
        this.stopCamera();
        this.stopScanTimer();
        this.html5QrCode = null;
        this.cameraStream = null;
        this.scanning = false;
    }
}

// Global scanner instance
let qrScanner = null;

// Open QR Scanner
async function openQRScanner() {
    // Show modal
    document.getElementById('qrModal').style.display = 'flex';
    
    // Initialize scanner
    if (!qrScanner) {
        qrScanner = new QRScanner();
    }
    
    // Wait a bit for modal to show
    setTimeout(async () => {
        await qrScanner.initialize();
    }, 100);
}

// Close QR Scanner
function closeQRScanner() {
    if (qrScanner) {
        qrScanner.cleanup();
        qrScanner = null;
    }
    
    // Hide modal and all result/error messages
    document.getElementById('qrModal').style.display = 'none';
    document.getElementById('scanResult').style.display = 'none';
    document.getElementById('scannerError').style.display = 'none';
    
    // Reset status
    if (document.getElementById('scannerStatus')) {
        document.getElementById('scannerStatus').innerHTML = '<i class="fas fa-camera"></i> Ready to scan';
    }
}

// Use scanned data
function useScannedData() {
    if (window.scannedAadhaar) {
        // Fill the Aadhaar input
        document.getElementById('aadhaarInput').value = window.scannedAadhaar;
        
        // Show success message
        showAlert(`Aadhaar ${window.scannedAadhaar} scanned successfully!`, 'success');
        
        // Close scanner
        closeQRScanner();
        
        // Auto-fetch patient data after 1 second
        setTimeout(() => {
            fetchPatientData();
        }, 1000);
    } else {
        showAlert('No valid Aadhaar data found', 'danger');
    }
}

// Retry camera
function retryCamera() {
    if (qrScanner) {
        qrScanner.hideError();
        qrScanner.loadCameras();
    }
}

// Upload QR Image
function uploadQRImage() {
    document.getElementById('qrImageUpload').click();
}

// Handle QR image upload
document.getElementById('qrImageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Show loading
        if (qrScanner) {
            qrScanner.updateStatus('Processing image...', 'loading');
        }
        
        // Read image and process
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                // Create image element
                const img = new Image();
                img.onload = async function() {
                    try {
                        // Use jsQR to decode
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, canvas.width, canvas.height);
                        
                        if (code) {
                            // Extract Aadhaar
                            const aadhaarNumber = qrScanner.extractAadhaarNumber(code.data);
                            
                            if (aadhaarNumber) {
                                window.scannedAadhaar = aadhaarNumber;
                                window.scannedQRData = code.data;
                                qrScanner.showScanResult(aadhaarNumber, code.data);
                            } else {
                                qrScanner.showError('Invalid QR Code', 'The uploaded image does not contain a valid Aadhaar QR code.');
                            }
                        } else {
                            qrScanner.showError('No QR Code Found', 'No QR code detected in the uploaded image.');
                        }
                    } catch (error) {
                        qrScanner.showError('Processing Error', error.message);
                    }
                };
                img.src = event.target.result;
            } catch (error) {
                if (qrScanner) {
                    qrScanner.showError('Upload Error', error.message);
                }
            }
        };
        reader.readAsDataURL(file);
    }
    
    // Reset input
    this.value = '';
});

// Use demo QR (for testing)
function useDemoQR() {
    // Create a fake Aadhaar number
    const demoAadhaar = '123456789012';
    const demoData = `AADHAAR:${demoAadhaar}|TYPE:MEDICAL|HOSPITAL:APOLLO`;
    
    if (qrScanner) {
        qrScanner.showScanResult(demoAadhaar, demoData);
        showAlert('Demo QR code loaded. Click "Use This Aadhaar" to continue.', 'info');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('qrModal');
    if (modal && event.target === modal) {
        closeQRScanner();
    }
});

// Handle escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeQRScanner();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Setup file upload
    const fileInput = document.getElementById('qrImageUpload');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            uploadQRImage(e);
        });
    }
    
    // Simulate QR scan (for demo)
    window.simulateQRScan = function() {
        const demoAadhaar = '123456789012';
        document.getElementById('aadhaarInput').value = demoAadhaar;
        closeQRScanner();
        fetchPatientData();
        showAlert('Demo QR scanned successfully!', 'success');
    };
});