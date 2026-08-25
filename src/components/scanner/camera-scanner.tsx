"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Upload,
  SwitchCamera,
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPages, setCapturedPages] = useState<CapturedPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Inicia a câmera de forma robusta com fallbacks
  const startCameraStream = useCallback(async (facing: "environment" | "user") => {
    try {
      setCameraError(null);
      setIsCameraActive(false);

      // Para qualquer track anterior
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      let mediaStream: MediaStream | null = null;

      try {
        // Tentativa 1: Alta resolução com facingMode ideal
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
          audio: false,
        });
      } catch (err1) {
        // Tentativa 2: Restrições básicas
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing },
            audio: false,
          });
        } catch (err2) {
          // Tentativa 3: Qualquer câmera disponível
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (mediaStream && videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsCameraActive(true);
          }).catch((e) => {
            console.warn("Erro ao dar play no vídeo:", e);
            setIsCameraActive(true);
          });
        };
        setStream(mediaStream);
      }
    } catch (err: any) {
      console.warn("Câmera indisponível ou permissão negada:", err);
      setCameraError(
        "Acesso à câmera bloqueado ou indisponível. Você pode usar a câmera nativa do celular tocando no botão abaixo."
      );
      setIsCameraActive(false);
    }
  }, [stream]);

  useEffect(() => {
    startCameraStream(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleFacingMode = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCameraStream(next);
  };

  // Captura um quadro do fluxo de vídeo e aplica o pipeline CamScanner
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

    // Aplica o pipeline do CamScanner (correção de iluminação e nitidez)
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

  // Suporte à câmera nativa do celular (input capture="environment")
  const handleNativeCameraPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          applyCamScannerPipeline(canvas, {
            removeShadows: true,
            contrastBoost: 1.5,
            brightnessBoost: 12,
            sharpen: true,
          });
          const enhancedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
          const newPage: CapturedPage = {
            id: `page-${Date.now()}`,
            originalDataUrl: dataUrl,
            enhancedDataUrl,
            pageNumber: capturedPages.length + 1,
          };
          const updated = [...capturedPages, newPage];
          setCapturedPages(updated);
          setSelectedPageIndex(updated.length - 1);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const finishCapture = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    onPagesCaptured(capturedPages);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19] flex flex-col">
      {/* Input escondido para acionamento da câmera nativa do sistema */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeCameraPhoto}
        className="hidden"
      />

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
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Guia Visual da Folha / Documento */}
        {isCameraActive && (
          <div className="absolute inset-6 sm:inset-16 border-2 border-indigo-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
            <div className="flex justify-between">
              <span className="w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
              <span className="w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
            </div>

            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse" />

            <div className="flex justify-between">
              <span className="w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
              <span className="w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
            </div>
          </div>
        )}

        {/* Mensagem de fallback caso a câmera WebRTC esteja bloqueada */}
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 z-20 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Camera className="w-7 h-7" />
            </div>
            <div className="max-w-xs space-y-1">
              <h4 className="text-sm font-bold text-white">Tirar Foto da Prova</h4>
              <p className="text-xs text-slate-400">
                {cameraError || "Iniciando câmera do dispositivo..."}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button
                variant="primary"
                size="default"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2 text-xs font-bold"
              >
                <Camera className="w-4 h-4" />
                <span>Usar Câmera Nativa do Celular</span>
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
                Voltar ao Menu
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls & Gallery Strip */}
      <div className="p-4 bg-[#0B0F19]/95 border-t border-slate-800 flex flex-col gap-3">
        {/* Galeria de miniaturas das páginas capturadas */}
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
          {/* Botão de Câmera Nativa / Alternar Câmera */}
          <button
            type="button"
            onClick={toggleFacingMode}
            className="text-xs text-slate-400 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:text-white"
            title="Alternar câmera frontal / traseira"
          >
            <SwitchCamera className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Alternar</span>
          </button>

          {/* Botão Central de Disparo (Shutter) */}
          <button
            type="button"
            onClick={isCameraActive ? captureFrame : () => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-lg shadow-indigo-600/40 active:scale-90 transition-transform cursor-pointer"
            aria-label="Capturar Foto"
          >
            <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>

          {/* Botão de Abrir Câmera Nativa do Celular */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-slate-400 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:text-white"
            title="Abrir câmera nativa com foco automático"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Foto HD</span>
          </button>
        </div>
      </div>
    </div>
  );
}
