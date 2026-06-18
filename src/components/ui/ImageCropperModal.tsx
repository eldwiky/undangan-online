"use client";

import { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";

interface ImageCropperModalProps {
  imageSrc: string;           // The original image (data URL or object URL)
  aspectRatio?: number;       // e.g. 1 for square, 3/4 for portrait, 1200/630 for og
  cropShape?: "rect" | "round";
  onCrop: (croppedDataUrl: string) => void;
  onClose: () => void;
  title?: string;
}

// Helper: create image element
async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

// Helper: get cropped canvas with rotation support
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number = 0
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context not available");

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = getRotatedSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas center, rotate, then draw image
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Extract the cropped area
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) throw new Error("Canvas context not available");

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return croppedCanvas.toDataURL("image/jpeg", 0.92);
}

// Helper: calculate bounding box size after rotation
function getRotatedSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export default function ImageCropperModal({
  imageSrc,
  aspectRatio = 1,
  cropShape = "rect",
  onCrop,
  onClose,
  title = "Crop Foto",
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels || isCropping) return;
    setIsCropping(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCrop(croppedImage);
    } catch {
      // fallback: try without rotation
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      onCrop(croppedImage);
    } finally {
      setIsCropping(false);
    }
  };

  const handleRotateLeft = () => setRotation((prev) => (prev - 90) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetZoom = () => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-2xl bg-white">
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* Cropper area */}
          <div className="relative w-full bg-gray-900 overflow-hidden" style={{ height: 380 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              cropShape={cropShape}
              showGrid={true}
              restrictPosition={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              minZoom={1}
              maxZoom={5}
              zoomSpeed={0.3}
              objectFit="contain"
            />
          </div>

          {/* Controls */}
          <div className="px-4 py-3 border-b border-gray-100 space-y-3">
            {/* Zoom control */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom(Math.max(1, zoom - 0.2))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Zoom out"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="range"
                min={1}
                max={5}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 accent-rose-500 cursor-pointer"
                aria-label="Zoom level"
              />
              <button
                type="button"
                onClick={() => setZoom(Math.min(5, zoom + 0.2))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Zoom in"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <span className="text-xs text-gray-500 w-10 text-right">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Rotation & reset controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotateLeft}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Putar kiri 90°"
                  title="Putar kiri 90°"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h1.168a2 2 0 011.64.85l.86 1.28a2 2 0 001.64.87H20M3 10V4m0 6l3-3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleRotateRight}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Putar kanan 90°"
                  title="Putar kanan 90°"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-1.168a2 2 0 00-1.64.85l-.86 1.28a2 2 0 01-1.64.87H4M21 10V4m0 6l-3-3" />
                  </svg>
                </button>
                <span className="text-xs text-gray-500 ml-1">{rotation}°</span>
              </div>
              <button
                type="button"
                onClick={handleResetZoom}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Hint text */}
          <div className="px-4 pt-2 pb-1">
            <p className="text-xs text-gray-400 text-center">
              Geser foto untuk mengatur posisi. Pinch/scroll untuk zoom.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 px-4 py-3 rounded-b-2xl bg-white">
            <button
              onClick={onClose}
              disabled={isCropping}
              className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleCrop}
              disabled={isCropping}
              className="flex-1 py-2.5 text-sm text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCropping ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                "Gunakan Foto"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
