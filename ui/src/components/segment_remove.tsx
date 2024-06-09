import React, { useState, ChangeEvent, MouseEvent, useRef, useEffect } from 'react';

export function InteractiveSegment() {
  const [confidence, setConfidence] = useState(0.92);

  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Confidence</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="my-2"
        />
        <div className="text-gray-500 text-right">{confidence.toFixed(2)}</div>
      </div>
    </div>
  );
}

export function Segment() {
  const [inputImage, setInputImage] = useState<HTMLImageElement | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          setInputImage(img);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
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

        if (img.width > containerWidth || img.height > containerHeight) {
          if (containerWidth / containerHeight > aspectRatio) {
            canvasHeight = containerHeight;
            canvasWidth = canvasHeight * aspectRatio;
          } else {
            canvasWidth = containerWidth;
            canvasHeight = canvasWidth / aspectRatio;
          }
        } else {
          canvasWidth = img.width;
          canvasHeight = img.height;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      }
    }
  };

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPoints(prevPoints => {
        const newPoints = [...prevPoints, { x, y }];
        drawPoints(newPoints);
        console.log(newPoints);
        return newPoints;
      });
    }
  };

  const drawPoints = (pointsToDraw: { x: number, y: number }[]) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx && inputImage) {
        drawImageOnCanvas(inputImage);
        pointsToDraw.forEach(point => {
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2, true);
          ctx.fill();
        });
      }
    }
  };

  const handleGenerate = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setOutputImage(canvas.toDataURL('image/png'));
    }
  };

  const handleSave = () => {
    if (outputImage) {
      const link = document.createElement('a');
      link.href = outputImage;
      link.download = 'output_image.png';
      link.click();
    }
  };

  const handleTryAgain = () => {
    setInputImage(null);
    setOutputImage(null);
    setPoints([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    if (inputImage) {
      drawImageOnCanvas(inputImage);
    }
  }, [inputImage]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex max-md:flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col w-1/2 max-md:w-full h-[calc(100vh-140px)] p-4 bg-white rounded-lg border border-neutral-200">
          <div className="text-base font-medium leading-6 text-neutral-700 mb-4">
            Input
          </div>
          <div className="flex flex-col justify-center items-center h-full bg-neutral-100 rounded-lg border border-neutral-200">
            {!inputImage && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload an image:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mb-4"
                />
              </>
            )}
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="border border-neutral-200 max-w-full max-h-full"
            ></canvas>
          </div>
        </div>
        <div className="flex flex-col w-1/2 max-md:w-full h-[calc(100vh-140px)] p-4 bg-white rounded-lg border border-neutral-200">
          <div className="text-base font-medium leading-6 text-neutral-700 mb-4">
            Output
          </div>
          <div className="flex flex-col justify-center items-center h-full bg-neutral-100 rounded-lg border border-neutral-200">
            {outputImage ? (
              <img
                src={outputImage}
                alt="Generated"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-gray-500">No image generated yet</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between py-4 bg-white">
        <button
          onClick={handleGenerate}
          className="px-4 py-2 text-white rounded-lg bg-neutral-700"
        >
          Generate
        </button>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white rounded-lg bg-neutral-700"
          >
            Save
          </button>
          <button
            onClick={handleTryAgain}
            className="px-4 py-2 text-neutral-700 rounded-lg bg-zinc-100"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
