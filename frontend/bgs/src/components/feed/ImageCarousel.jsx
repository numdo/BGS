import { useState } from "react";

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="relative w-full mt-3">
      <img src={images[currentIndex].url} alt="Feed Image" className="w-full h-60 object-cover rounded-lg" />
      
      <button className="absolute left-2 top-1/2 bg-gray-800 text-white p-2 rounded-full" onClick={prevImage}>
        ◀
      </button>
      <button className="absolute right-2 top-1/2 bg-gray-800 text-white p-2 rounded-full" onClick={nextImage}>
        ▶
      </button>
    </div>
  );
};

export default ImageCarousel;
