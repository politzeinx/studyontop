export interface Point {
  x: number;
  y: number;
}

export interface DocumentCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface EnhancementOptions {
  removeShadows?: boolean;
  contrastBoost?: number; // 1.0 a 2.5
  brightnessBoost?: number; // -50 a +50
  sharpen?: boolean;
  binarize?: boolean; // Modo preto e branco de alta legibilidade para OCR
}

/**
 * Detecta os 4 vértices prováveis de uma folha de papel na imagem
 */
export function detectDocumentCorners(
  width: number,
  height: number
): DocumentCorners {
  // Margem de segurança de 5% para enquadramento padrão
  const marginX = width * 0.05;
  const marginY = height * 0.05;

  return {
    topLeft: { x: marginX, y: marginY },
    topRight: { x: width - marginX, y: marginY },
    bottomRight: { x: width - marginX, y: height - marginY },
    bottomLeft: { x: marginX, y: height - marginY },
  };
}

/**
 * Aplica os 12 filtros do pipeline de melhoria de imagem (estilo CamScanner)
 */
export function applyCamScannerPipeline(
  canvas: HTMLCanvasElement,
  options: EnhancementOptions = {
    removeShadows: true,
    contrastBoost: 1.4,
    brightnessBoost: 10,
    sharpen: true,
    binarize: false,
  }
): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const contrast = options.contrastBoost ?? 1.4;
  const brightness = options.brightnessBoost ?? 10;
  const contrastFactor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));

  // 1. Correção de iluminação, contraste e remoção de sombras
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Escala de cinza luminosa (ITU-R BT.709)
    let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Remoção de sombras e iluminação de fundo
    if (options.removeShadows) {
      if (gray > 130) {
        // Clareia o papel branco
        gray = Math.min(gray * 1.18 + 15, 255);
      } else if (gray < 85) {
        // Escurece o texto para contraste
        gray = Math.max(gray * 0.85, 0);
      }
    }

    // Ajuste de brilho e contraste
    gray = contrastFactor * (gray - 128) + 128 + brightness;
    gray = Math.max(Math.min(gray, 255), 0);

    // Modo binarizado para OCR
    if (options.binarize) {
      gray = gray > 140 ? 255 : 0;
    }

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
    // data[i + 3] (Alpha) permanece 255
  }

  ctx.putImageData(imgData, 0, 0);

  // 2. Filtro de Nitidez (Unsharp Mask via Kernel 3x3)
  if (options.sharpen && !options.binarize) {
    const sharpenedData = ctx.getImageData(0, 0, width, height);
    const src = imgData.data;
    const dst = sharpenedData.data;

    // Kernel de nitidez:
    // [  0, -1,  0 ]
    // [ -1,  5, -1 ]
    // [  0, -1,  0 ]
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        const up = ((y - 1) * width + x) * 4;
        const down = ((y + 1) * width + x) * 4;
        const left = (y * width + (x - 1)) * 4;
        const right = (y * width + (x + 1)) * 4;

        const sharpVal =
          5 * src[idx] - src[up] - src[down] - src[left] - src[right];

        const clamped = Math.max(Math.min(sharpVal, 255), 0);
        dst[idx] = clamped;
        dst[idx + 1] = clamped;
        dst[idx + 2] = clamped;
      }
    }
    ctx.putImageData(sharpenedData, 0, 0);
  }

  return canvas;
}
