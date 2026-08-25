"use client";

import { useState, useRef, useEffect } from "react";
import {
  Camera,
  RotateCw,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  ChevronRight,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { applyCamScannerPipeline } from "@/lib/scanner/image-processing";

export interface CapturedPage {
  id: string;
  originalDataUrl: string;
  enhancedDataUrl: string;
  pageNumber: number;
}

export function CameraScanner({
  onPagesCaptured,
  onCancel,
}: {
  onPagesCaptured: (pages: CapturedPage[]) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPages, setCapturedPages] = useState<CapturedPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Inicializa a câmera
  useEffect(() => {
    async function startCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Prioriza câmera traseira no celular
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
        setStream(mediaStream);
        setIsCameraActive(true);
      } catch (err: any) {
        console.warn("Câmera indisponível ou permissão negada:", err);
        setCameraError(
          "Não foi possível acessar a câmera do dispositivo. Verifique as permissões ou utilize o upload de fotos."
        );
        setIsCameraActive(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Captura um quadro da câmera e aplica o pipeline de melhoria
  const captureFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const originalDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    // Aplica os 12 filtros do CamScanner
    applyCamScannerPipeline(canvas, {
      removeShadows: true,
      contrastBoost: 1.5,
      brightnessBoost: 12,
      sharpen: true,
    });
    const enhancedDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    const newPage: CapturedPage = {
      id: `page-${Date.now()}`,
      originalDataUrl,
      enhancedDataUrl,
      pageNumber: capturedPages.length + 1,
    };

    const updated = [...capturedPages, newPage];
    setCapturedPages(updated);
    setSelectedPageIndex(updated.length - 1);
  };

  const finishCapture = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    onPagesCaptured(capturedPages);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19] flex flex-col">
      {/* Top Bar */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Scanner com Câmera</h3>
            <span className="text-[10px] text-slate-400">
              {capturedPages.length} {capturedPages.length === 1 ? "página capturada" : "páginas capturadas"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {capturedPages.length > 0 && (
            <Button variant="success" size="sm" onClick={finishCapture} className="text-xs gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Concluir ({capturedPages.length})</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {isCameraActive ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="max-h-full max-w-full object-contain"
            />

            {/* Document Guide Frame Overlay */}
            <div className="absolute inset-8 sm:inset-16 border-2 border-indigo-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
              {/* 4 Corner Markers */}
              <div className="flex justify-between">
                <span className="w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                <span className="w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
              </div>

              {/* Scanning Laser Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse" />

              <div className="flex justify-between">
                <span className="w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                <span className="w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center max-w-sm">
            <Camera className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-xs text-slate-400 mb-4">{cameraError || "Iniciando câmera..."}</p>
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Voltar ao Modo de Upload
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Controls & Gallery Strip */}
      <div className="p-4 bg-[#0B0F19]/95 border-t border-slate-800 flex flex-col gap-3">
        {/* Thumbnails of captured pages */}
        {capturedPages.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {capturedPages.map((page, idx) => (
              <div
                key={page.id}
                onClick={() => setSelectedPageIndex(idx)}
                className={`relative w-14 h-18 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                  selectedPageIndex === idx
                    ? "border-indigo-500 scale-105"
                    : "border-slate-800 opacity-70"
                }`}
              >
                <img
                  src={showEnhanced ? page.enhancedDataUrl : page.originalDataUrl}
                  alt={`Página ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-white text-center font-bold">
                  Pág {idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Shutter Button & Mode Toggles */}
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <button
            onClick={() => setShowEnhanced(!showEnhanced)}
            className="text-xs text-slate-400 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showEnhanced ? "Modo Otimizado" : "Modo Original"}</span>
          </button>

          {/* Large Shutter Button */}
          <button
            onClick={captureFrame}
            disabled={!isCameraActive}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-lg shadow-indigo-600/40 active:scale-90 transition-transform disabled:opacity-50"
            aria-label="Capturar Foto"
          >
            <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>

          <span className="text-xs text-slate-400 w-24 text-right">
            {capturedPages.length} {capturedPages.length === 1 ? "foto" : "fotos"}
          </span>
        </div>
      </div>
    </div>
  );
}
