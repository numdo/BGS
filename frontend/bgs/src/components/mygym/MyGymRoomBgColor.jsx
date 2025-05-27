// src/components/mygym/MyGymRoomBgColor.jsx
import React from "react";
import useMyGymStore from "../../stores/useMyGymStore";
import bgimg from "../../assets/images/backimg.png";
import bgimg1 from "../../assets/images/backimg1.jpg";
import bgimg2 from "../../assets/images/backimg2.jpg";
import bgimg3 from "../../assets/images/backimg3.jpg";
import bgimg4 from "../../assets/images/backimg4.jpg";
import bgimg5 from "../../assets/images/backimg5.jpg";

const backgroundImages = {
  bgimg: bgimg,
  bgimg1: bgimg1,
  bgimg2: bgimg2,
  bgimg3: bgimg3,
  bgimg4: bgimg4,
  bgimg5: bgimg5,
};

const MyGymRoomBgColor = ({ children, className = "", style = {}, ...props }) => {
  const { myGym } = useMyGymStore();

  const bgKey = myGym.backgroundColor;
  const bgImage = backgroundImages[bgKey] || bgimg;

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default MyGymRoomBgColor;
