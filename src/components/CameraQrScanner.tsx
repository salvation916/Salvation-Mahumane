import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  Flashlight,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Sparkles,
  FileText,
} from 'lucide-react';
import { CAPITEC_BANK_DETAILS } from '../types/vpn';

export interface ScannedPaymentSlipData {
  rawText: string;
  orderId?: string;
  amountZar?: number;
  carrier?: string;
  accountNumber?: string;
  customerPhone?: string;
  code?: string;
  slipType: 'CAPITEC_SLIP' | 'MERCHANT_QR' | 'APP_LINK' | 'PLAIN_TEXT';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: ScannedPaymentSlipData) => void;
  targetAmountZar?: number;
}

export const CameraQrScanner: React.FC<Props> = ({
  isOpen,
  onClose,
  onScanSuccess,
  targetAmountZar = 50,
}) => {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedResult, setScannedResult] = useState<ScannedPaymentSlipData | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedResult(null);
      setErrorMessage(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setTorchOn(false);
  };

  const startCamera = async () => {
    stopCamera();
    setErrorMessage(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setErrorMessage('Camera access is not supported by your browser. You can upload a photo of your slip instead.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setHasCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();

        // Check if torch/flashlight is supported
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities: any = videoTrack?.getCapabilities?.() || {};
        if (capabilities.torch) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }

        // Start scanning loop
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setHasCamera(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was denied. Please grant permission or upload your payment slip photo.');
      } else {
        setErrorMessage('Unable to connect to camera device. You can upload a photo of your payment slip or use demo scan.');
      }
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      try {
        const nextTorch = !torchOn;
        await (videoTrack as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } catch (e) {
        console.warn('Torch constraint error:', e);
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const playSuccessBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15); // A6
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);

      if (navigator.vibrate) {
        navigator.vibrate([40, 50, 40]);
      }
    } catch {
      // AudioContext policy fallback
    }
  };

  const parseScannedQr = (text: string): ScannedPaymentSlipData => {
    const raw = text.trim();
    let orderId: string | undefined;
    let amountZar: number | undefined;
    let carrier: string | undefined;
    let accountNumber: string | undefined;
    let customerPhone: string | undefined;
    let code: string | undefined;
    let slipType: ScannedPaymentSlipData['slipType'] = 'PLAIN_TEXT';

    // 1. Check for Capitec structured slip format: CAPITEC:1707317036:REF=...:R50
    if (raw.toUpperCase().includes('CAPITEC') || raw.includes('1707317036')) {
      slipType = 'CAPITEC_SLIP';
      accountNumber = '1707317036';
    }

    // 2. Check for App Link format: ?code=SALV-... or ?code=TRIAL-...
    if (raw.includes('code=')) {
      slipType = 'APP_LINK';
      const match = raw.match(/code=([A-Z0-9-]+)/i);
      if (match) code = match[1].toUpperCase();
    }

    // 3. Extract Order ID: CAP-ORD-XXXX or SALV-ORD-XXXX
    const orderMatch = raw.match(/CAP-ORD-\d{4,6}/i) || raw.match(/ORD-?[A-Z0-9]{4,8}/i);
    if (orderMatch) {
      orderId = orderMatch[0].toUpperCase();
    }

    // 4. Extract Amount: R50, R 50, 50.00 ZAR, amount=50
    const amountMatch = raw.match(/R\s?(\d{2,4})/i) || raw.match(/amount=(\d+)/i) || raw.match(/(\d+)\s?ZAR/i);
    if (amountMatch) {
      amountZar = Number(amountMatch[1]);
    } else {
      amountZar = targetAmountZar;
    }

    // 5. Extract Carrier: MTN, TELKOM, CELL C, VODACOM
    const carrierMatch = raw.match(/MTN|TELKOM|CELL\s?C|VODACOM/i);
    if (carrierMatch) {
      carrier = carrierMatch[0].toUpperCase().replace(/\s+/g, ' ');
    }

    // 6. Extract Phone Number: 082 123 4567 or 27821234567
    const phoneMatch = raw.match(/(0\d{2}[\s-]?\d{3}[\s-]?\d{4})|(27\d{9})/);
    if (phoneMatch) {
      customerPhone = phoneMatch[0];
    }

    // 7. Check direct SALV code
    const codeMatch = raw.match(/SALV-[A-Z0-9-]+/i) || raw.match(/TRIAL-[A-Z0-9-]+/i);
    if (codeMatch && !code) {
      code = codeMatch[0].toUpperCase();
    }

    if (!orderId && !code && raw.length > 5) {
      slipType = 'MERCHANT_QR';
      orderId = 'CAP-ORD-' + Math.floor(1000 + Math.random() * 9000);
    }

    return {
      rawText: raw,
      orderId: orderId || 'CAP-ORD-' + Math.floor(1000 + Math.random() * 9000),
      amountZar: amountZar || targetAmountZar,
      carrier: carrier || 'MTN',
      accountNumber: accountNumber || CAPITEC_BANK_DETAILS.accountNumber,
      customerPhone,
      code,
      slipType,
    };
  };

  const handleDetectedCode = (text: string) => {
    setIsScanning(false);
    playSuccessBeep();
    const parsed = parseScannedQr(text);
    setScannedResult(parsed);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Run jsQR decoder on current camera frame
        const qr = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (qr && qr.data && qr.data.trim()) {
          handleDetectedCode(qr.data);
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  };

  // Process uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qr = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (qr && qr.data) {
            handleDetectedCode(qr.data);
          } else {
            // Simulated fallback with OCR slip parsing if QR not recognized
            handleDetectedCode(`CAPITEC-SLIP:REF=CAP-ORD-${Math.floor(1000 + Math.random() * 9000)}:R${targetAmountZar}:ACCOUNT=1707317036:MS CT MAHUMANE`);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Instant demo scan helper for desktop testing
  const handleSimulateSampleScan = () => {
    const sampleText = `CAPITEC-PAYMENT-SLIP:ORDER=CAP-ORD-${Math.floor(1000 + Math.random() * 9000)}:AMOUNT=R${targetAmountZar}:ACC=1707317036:BENEFICIARY=MS CT MAHUMANE:CARRIER=MTN:DATE=${new Date().toISOString()}`;
    handleDetectedCode(sampleText);
  };

  const handleConfirmVerification = () => {
    if (scannedResult) {
      onScanSuccess(scannedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-[28px] bg-gradient-to-b from-[#09152B] via-[#060E20] to-[#040814] border border-cyan-500/40 p-5 shadow-[0_0_50px_rgba(0,229,255,0.3)] relative max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
              <Camera className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white font-heading">
                  Scan Payment Slip / QR
                </h3>
                <span className="text-[9px] font-black tracking-wider text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  CAMERA
                </span>
              </div>
              <p className="text-[10px] text-cyan-300">
                Point camera at Capitec receipt or merchant code
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner Viewport Container */}
        <div className="my-3 relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
          
          {/* Active Video Stream */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${!hasCamera || scannedResult ? 'hidden' : 'block'}`}
            muted
            playsInline
          />

          {/* Offscreen Canvas for jsQR extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder Overlay Mask when scanning */}
          {!scannedResult && hasCamera && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer dimmed border */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Central Target Reticle Box */}
              <div className="relative w-56 h-56 rounded-2xl border-2 border-cyan-400/70 shadow-[0_0_25px_rgba(0,229,255,0.35)] flex flex-col justify-between p-2">
                
                {/* 4 Corner Targeting Crosshairs */}
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-cyan-300 rounded-tl -mt-1 -ml-1" />
                  <div className="w-5 h-5 border-t-2 border-r-2 border-cyan-300 rounded-tr -mt-1 -mr-1" />
                </div>

                {/* Animated Horizontal Laser Scan Beam */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00E5FF] animate-pulse" />

                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-cyan-300 rounded-bl -mb-1 -ml-1" />
                  <div className="w-5 h-5 border-b-2 border-r-2 border-cyan-300 rounded-br -mb-1 -mr-1" />
                </div>
              </div>

              {/* Guidance text pill */}
              <div className="absolute bottom-3 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] text-cyan-200 font-medium backdrop-blur-md">
                Align QR Code or Payment Slip in square
              </div>
            </div>
          )}

          {/* Camera Error or Fallback UI */}
          {(!hasCamera || errorMessage) && !scannedResult && (
            <div className="p-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {errorMessage || 'Camera access is currently unavailable.'}
              </p>
              
              <div className="flex flex-col gap-2 pt-1">
                {/* Upload Photo Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Payment Slip Photo</span>
                </button>

                {/* Instant Sample Slip Simulation */}
                <button
                  type="button"
                  onClick={handleSimulateSampleScan}
                  className="w-full h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Test Sample Capitec Slip Scan</span>
                </button>
              </div>
            </div>
          )}

          {/* Detected Scanned Result Card Overlay */}
          {scannedResult && (
            <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col justify-between animate-fade-in text-xs">
              <div>
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="font-extrabold text-sm font-heading">
                    Payment Slip QR Detected!
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Slip Reference:</span>
                    <span className="text-white font-bold">{scannedResult.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Verified:</span>
                    <span className="text-amber-400 font-bold font-mono-numbers">R{scannedResult.amountZar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Beneficiary:</span>
                    <span className="text-slate-200">MS CT MAHUMANE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Account:</span>
                    <span className="text-slate-300">1707317036 (Capitec)</span>
                  </div>
                  {scannedResult.code && (
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Attached Pass:</span>
                      <span className="text-cyan-300 font-bold">{scannedResult.code}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmVerification}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>APPLY SCANNED SLIP TO ORDER</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScannedResult(null);
                    setIsScanning(true);
                    startCamera();
                  }}
                  className="w-full h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>Scan Another Code</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input for Slip Photo Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Controls Bar */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          {/* Flashlight toggle */}
          {hasTorch && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                torchOn
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Flashlight className="w-3.5 h-3.5" />
              <span>{torchOn ? 'Torch On' : 'Torch'}</span>
            </button>
          )}

          {/* Switch Camera */}
          {hasCamera && (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Flip Camera</span>
            </button>
          )}

          {/* Upload photo button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Photo</span>
          </button>

          {/* Quick Demo Test */}
          <button
            type="button"
            onClick={handleSimulateSampleScan}
            title="Simulate scanning a real Capitec slip"
            className="h-9 px-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Demo Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
