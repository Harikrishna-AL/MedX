import { useState, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';

type ImageCardProps = {
  id: string;
  filename: string;
  content: string;
  type: string;
};

const ImageCard = ({ content }: Pick<ImageCardProps, 'content'>) => {
  return (
    <div className="image-card rounded-lg shadow-md overflow-hidden bg-white p-4 flex justify-center items-center">
      <img src={`data:image/png;base64,${content}`} alt="Generated Image" className="max-w-full max-h-full" />
    </div>
  );
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

  return (
    <div className="history-container p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">History</h1>
      <div className="filter-dropdown relative flex items-center justify-end mb-4">
        <button
          className="filter-button flex items-center px-4 py-2 rounded-md bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition duration-300"
          onClick={() => setDropdownVisible(!dropdownVisible)}
        >
          <FaFilter className="text-lg mr-2" />
          Filter <IoIosArrowDown className="ml-1" />
        </button>
        {dropdownVisible && (
          <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <button
              className={`dropdown-item w-full px-4 py-2 text-left text-neutral-700 hover:bg-neutral-200 transition duration-300 ${
                filterOption === 'remove' ? 'bg-neutral-300' : ''
              }`}
              onClick={() => {
                setFilterOption('remove');
                setDropdownVisible(false);
              }}
            >
              Remove Object
            </button>
            <button
              className={`dropdown-item w-full px-4 py-2 text-left text-neutral-700 hover:bg-neutral-200 transition duration-300 ${
                filterOption === 'add' ? 'bg-neutral-300' : ''
              }`}
              onClick={() => {
                setFilterOption('add');
                setDropdownVisible(false);
              }}
            >
              Add Object
            </button>
          </div>
        )}
      </div>
      <div className="images-grid grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredImages.map(image => (
          <ImageCard key={image.id} content={image.content} />
        ))}
      </div>
    </div>
  );
};

export default History;
