import React from "react";
import logo from "../../assets/images/logo_image.png";
import name from "../../assets/images/name.png";

const LogoSection = () => {
  return (
    <div className="text-center mb-8">
      <img src={logo} alt="App Logo" className="w-48 h-48 mx-auto mb-2" />
      <img src={name} alt="App Name" className="w-48" />
      <p className="text-xl text-gray-500 tracking-wider mt-4">
        <span className="text-2xl font-bold text-red-500 tracking-wider">불</span>타는
        <span className="text-2xl font-bold text-red-500 tracking-wider"> 근</span>육
        <span className="text-2xl font-bold text-red-500 tracking-wider"> 성</span>장
      </p>
    </div>
  );
};

export default LogoSection;
