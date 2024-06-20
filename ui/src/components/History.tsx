import { useState, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type ImageCardProps = {
  id: string;
  filename: string;
  content: string;
  type: string;
};

const History = () => {
  const [filterOption, setFilterOption] = useState<'remove' | 'add' | ''>('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [images, setImages] = useState<ImageCardProps[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch('http://0.0.0.0:8000/images', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setImages(data);
    };

    fetchImages();
  }, []);

  const filteredImages = images.filter(image =>
    filterOption === '' || image.type === filterOption
  );

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const addFolder = zip.folder("add");
    const removeFolder = zip.folder("remove");

    images.forEach(image => {
      const folder = image.type === 'add' ? addFolder : removeFolder;
      folder?.file(image.filename, image.content.trim(), { base64: true });
    });

    const zipContent = await zip.generateAsync({ type: "blob" });
    saveAs(zipContent, "images.zip");
  };

  return (
    <div className="history-container">
      <div className="flex justify-between py-1">
        <h1 style={{ color: '#2D3F50' }} className="text-3xl font-medium leading-10 text-ellipsis max-md:max-w-full">History</h1>
        <div className="flex items-center">
          <button
            style={{ backgroundColor: '#EEEEEE' }} 
            className="filter-button text-lg flex items-center px-2 py-1 rounded-md bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition duration-300 mr-2"
            onClick={() => setDropdownVisible(!dropdownVisible)}
          >
            <FaFilter className="text-lg mr-1" />
            Filter <IoIosArrowDown className="ml-1" />
          </button>
          {dropdownVisible && (
            <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg p-2">
              <select
                className="w-full p-2 border rounded-md bg-white text-neutral-700"
                value={filterOption}
                onChange={(e) => {
                  setFilterOption(e.target.value as 'remove' | 'add' | '');
                  setDropdownVisible(false);
                }}
              >
                <option value="">Select Filter</option>
                <option value="remove">Remove Object</option>
                <option value="add">Add Object</option>
              </select>
            </div>
          )}
          <button
            onClick={handleDownloadAll}
            className="download-all-button bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Download All
          </button>
        </div>
      </div>
      <div className="images-grid grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-100 p-8 rounded-lg">
        {filteredImages.map(image => (
          <div key={image.id} className="image-card rounded-lg shadow-md overflow-hidden bg-white p-4 flex justify-center items-center">
            <img src={`data:image/png;base64,${image.content.trim()}`} alt="Generated Image" className="max-w-full max-h-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
