import React, { useState, ChangeEvent, MouseEvent, useRef, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';

type Point = { x: number; y: number };
type CanvasData = {
  canvas: HTMLCanvasElement | null;
  backgroundCanvas: HTMLCanvasElement | null;
  image: HTMLImageElement | null;
  size: { width: number; height: number };
  imagePath: string;
};

interface DisplayAssets {
  selectedCard: { file: File; processedImage: string | null } | null;
}

const PoissonCanvas: React.FC<DisplayAssets> = ({ selectedCard }) => {
  const [canvasData, setCanvasData] = useState<CanvasData>({
    canvas: null,
    backgroundCanvas: null,
    image: null,
    size: { width: 0, height: 0 },
    imagePath: '',
  });
  const [cardImage, setCardImage] = useState<HTMLImageElement | null>(null);
  const [cardPosition, setCardPosition] = useState<Point>({ x: 10, y: 10 });
  const [cardSize, setCardSize] = useState<{ width: number; height: number }>({ width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isHoveringResizeHandle, setIsHoveringResizeHandle] = useState(false);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragOffset = useRef<Point>({ x: 0, y: 0 });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const img = new Image();
      img.onload = () => {
        const backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.width = img.width;
        backgroundCanvas.height = img.height;
        const ctx = backgroundCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
        }
        setCanvasData({
          ...canvasData,
          backgroundCanvas,
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

  const drawCardOnCanvas = () => {
    const { canvas, image, size } = canvasData;
    if (canvas && image) {
      const ctx = canvas.getContext('2d');
      if (ctx && cardImage) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, size.width, size.height);
        ctx.drawImage(cardImage, cardPosition.x, cardPosition.y, cardSize.width, cardSize.height);

        if (isSelected) {
          // Draw border around card image
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 2;
          ctx.strokeRect(cardPosition.x, cardPosition.y, cardSize.width, cardSize.height);

          // Draw resize handles (small squares at corners)
          const handleSize = 10;
          ctx.fillStyle = 'red';
          ctx.fillRect(cardPosition.x - handleSize / 2, cardPosition.y - handleSize / 2, handleSize, handleSize);
          ctx.fillRect(cardPosition.x + cardSize.width - handleSize / 2, cardPosition.y - handleSize / 2, handleSize, handleSize);
          ctx.fillRect(cardPosition.x - handleSize / 2, cardPosition.y + cardSize.height - handleSize / 2, handleSize, handleSize);
          ctx.fillRect(cardPosition.x + cardSize.width - handleSize / 2, cardPosition.y + cardSize.height - handleSize / 2, handleSize, handleSize);
        }
      }
    }
  };

  const handleCanvasMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const { canvas } = canvasData;
    if (canvas && cardImage) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (
        x >= cardPosition.x &&
        x <= cardPosition.x + cardSize.width &&
        y >= cardPosition.y &&
        y <= cardPosition.y + cardSize.height
      ) {
        setIsSelected(true);
        if (x >= cardPosition.x + cardSize.width - 10 && y >= cardPosition.y + cardSize.height - 10) {
          setIsResizing(true);
          dragOffset.current = { x: x - cardSize.width, y: y - cardSize.height };
        } else {
          setIsDragging(true);
          dragOffset.current = { x: x - cardPosition.x, y: y - cardPosition.y };
        }
      } else {
        setIsSelected(false);
      }
    }
  };

  const handleCanvasMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const { canvas } = canvasData;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isDragging) {
        setCardPosition({ x: x - dragOffset.current.x, y: y - dragOffset.current.y });
      } else if (isResizing) {
        setCardSize({ width: x - cardPosition.x, height: y - cardPosition.y });
      } else if (
        x >= cardPosition.x + cardSize.width - 10 &&
        y >= cardPosition.y + cardSize.height - 10 &&
        x <= cardPosition.x + cardSize.width &&
        y <= cardPosition.y + cardSize.height
      ) {
        setIsHoveringResizeHandle(true);
        canvas.style.cursor = 'nwse-resize';
      } else {
        setIsHoveringResizeHandle(false);
        canvas.style.cursor = 'default';
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleAddObject = async () => {
    const { canvas } = canvasData;
    if (canvas) {
      const snapshotCanvas = document.createElement('canvas');
      const snapshotCtx = snapshotCanvas.getContext('2d');

      if (snapshotCtx) {
        snapshotCanvas.width = canvas.width;
        snapshotCanvas.height = canvas.height;

        snapshotCtx.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);

        if (cardImage) {
          snapshotCtx.drawImage(cardImage, cardPosition.x, cardPosition.y, cardSize.width, cardSize.height);
        }

        snapshotCanvas.toBlob(async (blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append('src_image', blob, 'snapshot.png');

            try {
              setLoading(true); // Start loading
              const response = await fetch('http://0.0.0.0:8000/blend/upload', {
                method: 'POST',
                body: formData,
              });

              if (response.ok) {
                const result = await response.json();
                if (result.success) {
                  console.log('Snapshot uploaded successfully');
                  await blendBackgroundImage();
                } else {
                  console.error('Failed to upload snapshot');
                }
              } else {
                console.error('Failed to upload snapshot');
              }
            } catch (error) {
              console.error('Error uploading snapshot:', error);
            } finally {
              setLoading(false); // End loading
            }
          }
        }, 'image/png');
      }
    }
  };

  const blendBackgroundImage = async () => {
    const { backgroundCanvas } = canvasData;
    if (backgroundCanvas) {
      backgroundCanvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append('target_image', blob, 'background.png');

          try {
            setLoading(true); // Start loading
            const response = await fetch('http://0.0.0.0:8000/blend', {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              const imageBlob = await response.blob();
              const imageUrl = URL.createObjectURL(imageBlob);
              setOutputImage(imageUrl);
            } else {
              console.error('Failed to blend image');
            }
          } catch (error) {
            console.error('Error blending image:', error);
          } finally {
            setLoading(false); // End loading
          }
        }
      }, 'image/png');
    }
  };

  useEffect(() => {
    if (canvasData.image) {
      drawImageOnCanvas(canvasData.image);
    }
  }, [canvasData.image]);

  useEffect(() => {
    if (selectedCard) {
      const img = new Image();
      img.onload = () => {
        setCardImage(img);
        setCardSize({ width: img.width / 2, height: img.height / 2 });
      };
      img.src = selectedCard.processedImage || '';
    }
  }, [selectedCard]);

  useEffect(() => {
    drawCardOnCanvas();
  }, [cardImage, cardPosition, cardSize, isSelected]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex max-md:flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col w-1/2 max-md:w-full h-[calc(100vh-140px)] p-4 bg-white rounded-lg border border-neutral-200">
          <div className="text-base font-medium leading-6 text-neutral-700 mb-4">Input</div>
          <div className="flex flex-col justify-center items-center h-full bg-neutral-100 rounded-lg border border-neutral-200">
            {!canvasData.image && (
              <label className="flex flex-col items-center gap-2 text-gray-700 cursor-pointer">
                <FaUpload size={48} />
                <span className="text-lg">Upload an image</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
            {canvasData.image && (
              <>
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className="border border-neutral-200 max-w-full max-h-full"
                ></canvas>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col w-1/2 max-md:w-full h-[calc(100vh-140px)] p-4 bg-white rounded-lg border border-neutral-200">
          <div className="text-base font-medium leading-6 text-neutral-700 mb-4">Output</div>
          <div className="flex flex-col justify-center items-center h-full bg-neutral-100 rounded-lg border border-neutral-200">
            {loading ? (
              <div className="spinner"></div>
            ) : (
              outputImage ? (
                <img src={outputImage} alt="Output" className="max-w-full max-h-full" />
              ) : (
                <div className="text-gray-500">No output image generated yet</div>
              )
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between py-4 bg-white">
        <button onClick={handleAddObject} className="px-4 py-2 text-white rounded-lg bg-neutral-700">
          Add Object
        </button>
      </div>
    </div>
  );
};

export { PoissonCanvas };
