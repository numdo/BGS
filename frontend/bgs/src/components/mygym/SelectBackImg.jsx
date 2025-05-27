// src/components/mygym/SelectBackImg.jsx
import React from "react";
import useMyGymStore from "../../stores/useMyGymStore";
import bgimg from "../../assets/images/backimg.png";
import bgimg1 from "../../assets/images/backimg1.jpg";
import bgimg2 from "../../assets/images/backimg2.jpg";
import bgimg3 from "../../assets/images/backimg3.jpg";
import bgimg4 from "../../assets/images/backimg4.jpg";
import bgimg5 from "../../assets/images/backimg5.jpg";
import bgimg6 from "../../assets/images/backimg6.jpg";

const backgroundImages = {
  bgimg: bgimg,
  bgimg1: bgimg1,
  bgimg2: bgimg2,
  bgimg3: bgimg3,
  bgimg4: bgimg4,
  bgimg5: bgimg5,
  bgimg6: bgimg6,
};

const imageKeys = Object.keys(backgroundImages);

const SelectBackImg = () => {
  const { myGym, setMyGym } = useMyGymStore();

  const handleSelect = (key) => {
    setMyGym({ ...myGym, backgroundColor: key });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">테마</h2>
      <div className="grid grid-cols-2 gap-4">
        {imageKeys.map((key) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className="border border-gray-300 rounded overflow-hidden focus:outline-none"
          >
            <div
              className="w-40 h-24 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImages[key]})` }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectBackImg;
