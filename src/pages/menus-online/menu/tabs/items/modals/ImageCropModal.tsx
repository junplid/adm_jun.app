import Cropper, { Area } from "react-easy-crop";
import { useState } from "react";
import { getCroppedImg } from "./utils/getCroppedImg";

export function ImageCropModal({ file, onFinish }: any) {
    const [image, _] = useState(URL.createObjectURL(file));
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedArea, setCroppedArea] = useState<Area | null>(null);

    return (
        <div className="fixed z-[999] inset-0 p-2 bg-black/70 flex items-center justify-center">
            <div className="bg-white p-4 rounded w-[400px]">
                <div className="relative h-[300px]">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(_, croppedAreaPixels) =>
                            setCroppedArea(croppedAreaPixels)
                        }
                    />
                </div>

                <button
                    className="mt-3 bg-blue-500 text-white px-3 py-1"
                    type="button"
                    onClick={async () => {
                        const cropped = await getCroppedImg(image, croppedArea);
                        onFinish(cropped);
                    }}
                >
                    salvar
                </button>
            </div>
        </div>
    );
}