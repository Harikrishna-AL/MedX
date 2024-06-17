import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';

type CustomUploadProps = {
  title: string;
  onUpload: (file: File) => Promise<void>;
  onCardClick?: (card: any) => void;
};

interface CardListProps {
  onCardClick: (card: any) => void;
};

const CustomUpload: React.FC<CustomUploadProps> = ({ title, onUpload, onCardClick}: CustomUploadProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<File[]>([]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      await onUpload(file);
      setFileList(prevFiles => [...prevFiles, file]);
      setLoading(false);
    }
  };

  const handleClick = (card: any) => {
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
      {loading && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <span>Loading...</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 20 }}>
        {fileList.map((file, index) => (
          <div key={index} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 10, textAlign: 'center' }} onClick={
            () => handleClick(file)
          }>
            <img src={URL.createObjectURL(file)} alt={file.name} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
            <p style={{ marginTop: 10, fontSize: 12 }}>{file.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export function InteractiveAdd({onCardClick}: CardListProps): JSX.Element {
  const uploadObject = async (file: File): Promise<void> => {
    // Replace with actual upload logic
    console.log('Uploading object', file);
  };

  return (
    <div className="flex flex-col p-4 bg-zinc-100 rounded-lg shadow-md">
      <h3>Assets</h3>
      <div>
        <CustomUpload title="Upload Object" onUpload={uploadObject} onCardClick={onCardClick}/>
      </div>
    </div>
  );
}
