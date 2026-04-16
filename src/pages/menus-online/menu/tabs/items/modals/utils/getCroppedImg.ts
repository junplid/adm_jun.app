type GetCroppedImgOptions = {
  outputWidth?: number;
  outputHeight?: number;
  fileName?: string;
  mimeType?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number;
};

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function getCroppedImg(
  imageSrc: string,
  crop: CropArea,
  options: GetCroppedImgOptions = {},
) {
  const {
    outputWidth = crop.width,
    outputHeight = crop.height,
    quality = 1,
  } = options;

  const image = new Image();
  image.src = imageSrc;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Erro ao carregar a imagem"));
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Não foi possível criar o contexto do canvas");
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao gerar a imagem recortada"));
          return;
        }

        resolve(new File([blob], "cropped.png", { type: "image/png" }));
      },
      "image/png",
      quality,
    );
  });
}
