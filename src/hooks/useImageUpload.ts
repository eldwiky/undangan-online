"use client";

import { useState } from "react";

export function useImageUpload() {
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [cropperConfig, setCropperConfig] = useState<{
    aspectRatio?: number;
    cropShape?: "rect" | "round";
    title?: string;
    onCrop: (dataUrl: string) => void;
  } | null>(null);

  const openCropper = (
    file: File,
    options: {
      aspectRatio?: number;
      cropShape?: "rect" | "round";
      title?: string;
      onCrop: (dataUrl: string) => void;
    }
  ) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropperSrc(reader.result as string);
      setCropperConfig(options);
    };
    reader.readAsDataURL(file);
  };

  const closeCropper = () => {
    setCropperSrc(null);
    setCropperConfig(null);
  };

  return { cropperSrc, cropperConfig, openCropper, closeCropper };
}
