// ================================
// scanner.js — FINAL WORKING VERSION
// ================================

class QRScanner {
    constructor() {
        this.html5QrCode = null;
        this.cameraId = null;
        this.scanning = false;
        this.scanTimer = null;
        this.scanStartTime = null;

        this.aadhaarPatterns = [
            /AADHAAR:(\d{12})/i,
            /UID:(\d{12})/i,
            /(\d{4}\s?\d{4}\s?\d{4})/,
            /^(\d{12})$/
        ];
    }

    // 🔥 FORCE CAMERA PERMISSION + INIT
    async initialize() {
        try {
            // 🔑 THIS LINE TRIGGERS THE PERMISSION POPUP
            await navigator.mediaDevices.getUserMedia({ video: true });

            if (typeof Html5Qrcode === "undefined") {
                throw new Error("html5-qrcode library not loaded");
            }

            const reader = document.getElementById("qrReader");
            if (!reader) {
                throw new Error("qrReader element not found");
            }

            this.html5QrCode = new Html5Qrcode("qrReader");
            await this.loadCameras();
            return true;

        } catch (error) {
            console.error("Camera init error:", error);
            this.showError(
                "Camera Permission Required",
                "Please allow camera access in your browser settings."
            );
            return false;
        }
    }

    async loadCameras() {
        try {
            const devices = await Html5Qrcode.getCameras();
            if (!devices || devices.length === 0) {
                throw new Error("No cameras found");
            }

            const select = document.getElementById("cameraSelect");
            select.innerHTML = "";

            devices.forEach((device, index) => {
                const option = document.createElement("option");
                option.value = device.id;
                option.text = device.label || `Camera ${index + 1}`;
                select.appendChild(option);
            });

            this.cameraId = devices[0].id;
            select.value = this.cameraId;

            select.onchange = () => {
                this.stopCamera();
                this.cameraId = select.value;
                this.startCamera();
            };

            await this.startCamera();

        } catch (error) {
            console.error("Load camera error:", error);
            this.showError("Camera Error", error.message);
        }
    }

    async startCamera() {
        try {
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1
            };

            await this.html5QrCode.start(
                this.cameraId,
                config,
                (decodedText) => this.onScanSuccess(decodedText),
                () => {} // ignore scan noise
            );

            this.scanning = true;
            this.startTimer();
            this.updateStatus("Scanning...", "scanning");

        } catch (error) {
            console.error("Start camera error:", error);
            this.showError("Camera Start Failed", error.message);
        }
    }

    async stopCamera() {
        if (this.html5QrCode && this.scanning) {
            await this.html5QrCode.stop();
            this.scanning = false;
            this.stopTimer();
        }
    }

    onScanSuccess(text) {
        const aadhaar = this.extractAadhaar(text);
        if (!aadhaar) return;

        this.stopCamera();
        document.getElementById("scanResult").style.display = "block";
        document.getElementById("scannedData").textContent = `Aadhaar: ${aadhaar}`;

        window.scannedAadhaar = aadhaar;
        this.updateStatus("QR Code Detected", "success");
    }

    extractAadhaar(text) {
        for (const pattern of this.aadhaarPatterns) {
            const match = text.match(pattern);
            if (match) {
                const num = match[1] || match[0];
                const clean = num.replace(/\D/g, "");
                if (clean.length === 12) return clean;
            }
        }
        return null;
    }

    showError(title, message) {
        const box = document.getElementById("scannerError");
        box.style.display = "block";
        document.getElementById("errorTitle").textContent = title;
        document.getElementById("errorMessage").textContent = message;
        this.updateStatus(title, "error");
    }

    updateStatus(msg, type) {
        const el = document.getElementById("scannerStatus");
        const icons = {
            scanning: "fa-search",
            success: "fa-check-circle",
            error: "fa-exclamation-circle"
        };
        el.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
    }

    startTimer() {
        this.scanStartTime = Date.now();
        this.scanTimer = setInterval(() => {
            const s = Math.floor((Date.now() - this.scanStartTime) / 1000);
            document.getElementById("scanTimer").textContent =
                `00:${String(s).padStart(2, "0")}`;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.scanTimer);
        this.scanTimer = null;
    }

    cleanup() {
        this.stopCamera();
        this.html5QrCode = null;
    }
}

// ================================
// GLOBAL HANDLERS
// ================================

let qrScanner = null;

async function openQRScanner() {
    const modal = document.getElementById("qrModal");
    modal.style.display = "flex";

    if (!qrScanner) qrScanner = new QRScanner();
    await qrScanner.initialize();
}

function closeQRScanner() {
    if (qrScanner) {
        qrScanner.cleanup();
        qrScanner = null;
    }
    document.getElementById("qrModal").style.display = "none";
}

function useScannedData() {
    const input = document.getElementById("aadhaarInput");
    input.value = window.scannedAadhaar;
    closeQRScanner();
}
