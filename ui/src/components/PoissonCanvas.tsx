// components/PoissonCanvas.tsx

import React, { useState, ChangeEvent, MouseEvent, useRef, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';

type Point = { x: number; y: number };
type CanvasData = {
  canvas: HTMLCanvasElement | null;
  image: HTMLImageElement | null;
  size: { width: number; height: number };
  imagePath: string;
};

interface DisplayAssets {
  selectedCard: File | null;
}

const PoissonCanvas: React.FC<DisplayAssets> = ({ selectedCard }) => {
  const [canvasData, setCanvasData] = useState<CanvasData>({
    canvas: null,
    image: null,
    size: { width: 0, height: 0 },
    imagePath: '',
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const img = new Image();
      img.onload = () => {
        setCanvasData({
          ...canvasData,
          image: img,
          size: { width: img.width, height: img.height },
          imagePath: file.name,
        });
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const drawImageOnCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const containerWidth = canvas.parentElement?.clientWidth || 0;
        const containerHeight = canvas.parentElement?.clientHeight || 0;

        const aspectRatio = img.width / img.height;
        let canvasWidth, canvasHeight;

        if (containerWidth / containerHeight > aspectRatio) {
          canvasHeight = containerHeight;
          canvasWidth = canvasHeight * aspectRatio;
        } else {
          canvasWidth = containerWidth;
          canvasHeight = canvasWidth / aspectRatio;
        }

        setCanvasData({ ...canvasData, canvas, size: { width: canvasWidth, height: canvasHeight } });
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      }
    }
  };

  const drawCardOnCanvas = (card: File) => {
    const { canvas, image, size } = canvasData;
    if (canvas && image) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const cardImage = new Image();
        cardImage.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, size.width, size.height);
          ctx.drawImage(cardImage, 10, 10, cardImage.width / 2, cardImage.height / 2); 
        };
        cardImage.src = URL.createObjectURL(card);
      }
    }
  };

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const { canvas, size } = canvasData;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const scaleX = canvas.width / canvasData.image!.width;
      const scaleY = canvas.height / canvasData.image!.height;
      const originalX = x * scaleX;
      const originalY = y * scaleY;
    }
  };

  useEffect(() => {
    if (canvasData.image) {
      drawImageOnCanvas(canvasData.image);
    }
  }, [canvasData.image]);

  useEffect(() => {
    if (selectedCard && canvasData.image) {
      drawCardOnCanvas(selectedCard);
    }
  }, [selectedCard, canvasData.image]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex max-md:flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col w-1/2 max-md:w-full h-[calc(100vh-140px)] p-4 bg-white rounded-lg border border-neutral-200">
          <div className="text-base font-medium leading-6 text-neutral-700 mb-4">
            Input
          </div>
          <div className="flex flex-col justify-center items-center h-full bg-neutral-100 rounded-lg border border-neutral-200">
            {!canvasData.image && (
              <label className="flex flex-col items-center gap-2 text-gray-700 cursor-pointer">
                <FaUpload size={48} />
                <span className="text-lg">Upload an image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
            {canvasData.image && (
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="border border-neutral-200 max-w-full max-h-full"
              ></canvas>
            )}
          </div>
        </div>
        <div className="flex flex-col w-1/2 max-md:w-full h-[calc(100vh-140px)] p-4 bg-white rounded-lg border border-neutral-200">
          <div className="text-base font-medium leading-6 text-neutral-700 mb-4">
            Output
          </div>
          <div className="flex flex-col justify-center items-center h-full bg-neutral-100 rounded-lg border border-neutral-200">
            <div className="text-gray-500">No output image generated yet</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PoissonCanvas };
