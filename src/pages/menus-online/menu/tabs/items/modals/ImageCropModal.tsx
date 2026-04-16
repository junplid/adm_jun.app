import Cropper, { Area } from "react-easy-crop";
import { useEffect, useState } from "react";
import { getCroppedImg } from "./utils/getCroppedImg";

type ImageCropModalProps = {
  file: File;
  onFinish: (file: File) => void;
  aspect?: number; // ex: 1, 700 / 200
  outputWidth?: number; // ex: 700
  outputHeight?: number; // ex: 200
  fileName?: string;
  mimeType?: "image/png" | "image/jpeg" | "image/webp";
};

export function ImageCropModal({
  file,
  onFinish,
  aspect = 1,
  outputWidth,
  outputHeight,
}: ImageCropModalProps) {
  const [image] = useState(URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // 1. Limpa a imagem original APENAS quando o componente for desmontado
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(image);
    };
  }, [image]);

  // 2. Limpa a URL de preview antiga sempre que ela mudar ou o componente for desmontado
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!croppedArea) return;

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const croppedFile = await getCroppedImg(image, croppedArea, {
          outputWidth: outputWidth ?? croppedArea.width,
          outputHeight: outputHeight ?? croppedArea.height,
        });

        if (!active) return;

        const nextPreviewUrl = URL.createObjectURL(croppedFile);

        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return nextPreviewUrl;
        });
      } catch (error) {
        console.error("Erro ao gerar preview:", error);
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [croppedArea, image, outputWidth, outputHeight]);

  return (
    <div className="fixed z-[999] inset-0 p-2 bg-black/70 flex items-center w-full justify-center">
      <div className="bg-white p-4 rounded w-full max-w-[95vw]">
        <div className="flex gap-2 w-full">
          <div className="w-full">
            <div className="relative h-[400px] bg-gray-100 w-full rounded overflow-hidden">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) =>
                  setCroppedArea(croppedAreaPixels)
                }
              />
            </div>

            <label className="block text-sm font-medium mb-1 text-black">
              Zoom
            </label>
            <div className="flex items-center gap-x-1.5">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />

              <button
                className="mt-0 bg-blue-500 text-white px-4 py-2 rounded"
                type="button"
                disabled={!croppedArea}
                onClick={async () => {
                  if (!croppedArea) return;

                  const cropped = await getCroppedImg(image, croppedArea, {
                    outputWidth: outputWidth ?? croppedArea.width,
                    outputHeight: outputHeight ?? croppedArea.height,
                  });

                  onFinish(cropped);
                }}
              >
                salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
