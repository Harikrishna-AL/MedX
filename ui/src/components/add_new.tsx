// React code
import axios from 'axios';
import React, { useState, useRef } from 'react';
import { FaUpload } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

interface CustomUploadProps {
  title: string;
  onUpload: (file: File) => Promise<void>;
  onCardClick?: (card: { file: File; processedImage: string | null }) => void;
}

const CustomUpload: React.FC<CustomUploadProps> = ({ title, onUpload, onCardClick }) => {
  const [fileList, setFileList] = useState<{ file: File; processedImage: string | null; loading: boolean }[]>([]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileList(prevFiles => [...prevFiles, { file, processedImage: null, loading: true }]);
      
      try {
        const formData = new FormData();
        formData.append('seg_image', file);
  
        const response = await axios.post('http://0.0.0.0:8000/removebackground', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
        });

        const processedImage = URL.createObjectURL(response.data);
        setFileList(prevFiles =>
          prevFiles.map(f => f.file === file ? { ...f, processedImage, loading: false } : f)
        );
      } catch (error) {
        console.error('Error removing background:', error);
        setFileList(prevFiles =>
          prevFiles.map(f => f.file === file ? { ...f, loading: false } : f)
        );
      }
    }
  };

  const handleClick = (card: { file: File; processedImage: string | null }) => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  return (
    <div style={{ marginTop: 20, width: '100%' }}>
      <label style={{ cursor: 'pointer', display: 'block', textAlign: 'center', padding: 20, border: '1px dashed #ccc' }}>
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        <p>
          <FaUpload style={{ marginRight: 8 }} />
          {title}
        </p>
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 20 }}>
        {fileList.map(({ file, processedImage, loading }, index) => (
          <div
            key={index}
            style={{ border: '1px solid #ccc', borderRadius: 8, padding: 10, textAlign: 'center' }}
            onClick={() => handleClick({ file, processedImage })}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              processedImage && (
                <img src={processedImage} alt={file.name} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
              )
            )}
            <p style={{ marginTop: 10, fontSize: 12 }}>{file.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};




interface CardListProps {
  onCardClick: (card: { file: File; processedImage: string | null }) => void;
}

export function InteractiveAdd({ onCardClick }: CardListProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const uploadObject = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('seg_image', file);

    const response = await fetch('http://0.0.0.0:8000/removebackground', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvasRef.current!.width = img.width;
          canvasRef.current!.height = img.height;
          ctx?.drawImage(img, 0, 0);
        };
        img.src = imageUrl;
      }
    } else {
      console.error('Error uploading image');
    }
  };

  return (
    <div className="flex flex-col p-4 bg-zinc-100 rounded-lg shadow-md">
      <h3>Assets</h3>
      <div>
        <CustomUpload
          title="Upload Object"
          onUpload={uploadObject}
          onCardClick={(card) => {
            if (card.processedImage) {
              onCardClick(card);
            }
          }}
        />
      </div>
      <canvas ref={canvasRef} style={{ marginTop: 20, border: '1px solid #ccc' }}></canvas>
    </div>
  );
}