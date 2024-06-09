import React, { useState, ChangeEvent } from 'react';
import { UploadIcon } from '@heroicons/react/outline';

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
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    // Replace this with your image generation logic
    setOutputImage(inputImage);
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
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex max-md:flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col w-1/2 max-md:w-full h-[calc(100vh-140px)] p-4 bg-white rounded-lg border border-neutral-200">
          <div className="text-base font-medium leading-6 text-neutral-700 mb-4">
            Input
          </div>
          <div className="flex flex-col justify-center items-center h-full bg-neutral-100 rounded-lg border border-neutral-200">
            {!inputImage && (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <UploadIcon className="w-12 h-12 text-gray-400" />
                <span className="mt-2 text-sm leading-normal text-gray-600">
                  Upload an image
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
            )}
            {inputImage && (
              <img
                src={inputImage}
                alt="Uploaded"
                className="max-h-full max-w-full object-contain"
              />
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
    </div>
  );
}
