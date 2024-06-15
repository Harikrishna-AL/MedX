import React, { useState } from 'react';

type CustomUploadProps = {
  title: string;
  onUpload: (file: File) => Promise<void>;
};

const CustomUpload = ({ title, onUpload }: CustomUploadProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<File[]>([]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      await onUpload(file);
      setFileList([file]);
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 20, width: '100%' }}>
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <span>Loading...</span>
        </div>
      ) : fileList.length >= 1 ? null : (
        <label style={{ cursor: 'pointer', display: 'block', textAlign: 'center', padding: 20, border: '1px dashed #ccc' }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
          <p>{title}</p>
        </label>
      )}
    </div>
  );
};

export function InteractiveAdd() {
  const uploadLogo = async (file: File): Promise<void> => {
    // Replace with actual upload logic
    console.log('Uploading logo', file);
  };

  const uploadProductImage = async (file: File): Promise<void> => {
    // Replace with actual upload logic
    console.log('Uploading product image', file);
  };

  return (
    <div className="flex flex-col p-4 bg-zinc-100 rounded-lg shadow-md">
      <h3>Assets</h3>
      <div style={{ display: 'flex'}}>
        <CustomUpload title="Upload X-ray" onUpload={uploadLogo} />
        <CustomUpload title="Upload Object" onUpload={uploadProductImage} />
      </div>
    </div>
  );
}
