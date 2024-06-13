import React, { useState, ChangeEvent, MouseEvent, useRef, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';

type Point = { x: number; y: number };
type CanvasData = {
  canvas: HTMLCanvasElement | null;
  image: HTMLImageElement | null;
  size: { width: number; height: number };
};

const InteractiveSegment: React.FC<{ points: Point[]; setPoints: React.Dispatch<React.SetStateAction<Point[]>>; canvasData: CanvasData }> = ({ points, setPoints, canvasData }) => {
  const [confidence, setConfidence] = useState(0.92);

  const handleSegment = async (threshold: number) => {
    const positivePoints = points.map((point) => [point.x, point.y]);
    const requestBody = {
      positive_points: positivePoints,
      negative_points: [],
      threshold,
    };
  
    try {
      const response = await fetch('http://127.0.0.1:8188/sam/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error('Segmentation API call failed');
      }
  
      const data = await response.blob();
      const mask = URL.createObjectURL(data);
  
      const maskImage = new Image();
      maskImage.onload = () => {
        const { canvas, image, size } = canvasData;
        if (canvas && image) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Create a separate canvas for the mask
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = size.width;
            maskCanvas.height = size.height;
            const maskCtx = maskCanvas.getContext('2d');
            if (maskCtx) {
              // Draw the mask on the separate canvas
              maskCtx.drawImage(maskImage, 0, 0, size.width, size.height);
  
              // Blend the mask with the original image on the main canvas
              ctx.drawImage(image, 0, 0, size.width, size.height);
              ctx.globalCompositeOperation = 'source-in'; // Set composite mode to only show areas where mask is present
              ctx.drawImage(maskCanvas, 0, 0, size.width, size.height);
            }
          }
        }
      };
      maskImage.src = mask;
    } catch (error) {
      console.error('Error during segmentation:', error);
    }
  };
  

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
        <button
          onClick={() => handleSegment(confidence)}
          className="mt-2 px-4 py-2 text-white rounded-lg bg-neutral-700"
        >
          Segment
        </button>
      </div>
    </div>
  );
}

const Segment: React.FC<{ points: Point[]; setPoints: React.Dispatch<React.SetStateAction<Point[]>> }> = ({ points, setPoints }) => {
  const [canvasData, setCanvasData] = useState<CanvasData>({ canvas: null, image: null, size: { width: 0, height: 0 } });
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('http://127.0.0.1:8188/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Image upload failed');
        }

        const data = await response.json();

        if (data && data.type === 'input') {
          const img = new Image();
          img.onload = () => {
            setCanvasData({ ...canvasData, image: img });
            setOriginalImageSize({ width: img.width, height: img.height });
          };
          img.src = URL.createObjectURL(file);

          // Call the prepare API with the required JSON body
          const prepareResponse = await fetch('http://127.0.0.1:8188/sam/prepare', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sam_model_name: 'auto',
              filename: data.name,
              subfolder: data.subfolder,
              type: data.type,
            }),
          });

          if (!prepareResponse.ok) {
            throw new Error('Prepare API call failed');
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
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

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const { canvas, size } = canvasData;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const scaleX = originalImageSize.width / size.width;
      const scaleY = originalImageSize.height / size.height;
      const originalX = x * scaleX;
      const originalY = y * scaleY;
      setPoints(prevPoints => {
        const newPoints = [...prevPoints, { x: originalX, y: originalY }];
        drawPoints(newPoints);
        return newPoints;
      });
    }
  };

  const drawPoints = (pointsToDraw: Point[]) => {
    const { canvas, image, size } = canvasData;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx && image) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing
        ctx.drawImage(image, 0, 0, size.width, size.height); // Maintain original size
        pointsToDraw.forEach(point => {
          const scaleX = canvas.width / originalImageSize.width;
          const scaleY = canvas.height / originalImageSize.height;
          const canvasX = point.x * scaleX;
          const canvasY = point.y * scaleY;
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(canvasX, canvasY, 5, 0, Math.PI * 2, true);
          ctx.fill();
        });
      }
    }
  };

  const handleGenerate = () => {
    const { canvas } = canvasData;
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
    setCanvasData({ canvas: null, image: null, size: { width: 0, height: 0 } });
    setOutputImage(null);
    setPoints([]);
    const { canvas } = canvasData;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    if (canvasData.image) {
      drawImageOnCanvas(canvasData.image);
    }
  }, [canvasData.image]);

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
      <InteractiveSegment points={points} setPoints={setPoints} canvasData={canvasData} />
    </div>
  );
}

export { Segment, InteractiveSegment };
