import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackLogo from "../../assets/icons/ArrowBack.png";
import Favicon from "../../assets/images/Favicon.png";
import MoreIcon from "../../assets/icons/More.svg";
import SignoutIcon from "../../assets/icons/Signout.svg";
import { handleLogout } from "../../api/Auth";
export default function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();
  const handleNavigation = (url) => {
    navigate(url); // url로 이동
  };
  return (
    <div className="w-full border-b z-10">
      <div className="flex justify-between items-center px-4 py-3">
        <button
          className="text-gray-600 hover:text-blue-500"
          onClick={() => {
            navigate(-1);
          }}
        >
          <img src={ArrowBackLogo} alt="Home" className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleNavigation("/")}
          className="text-gray-600 hover:text-blue-500"
        >
          <img src={Favicon} alt="Home" className="w-6 h-6" />
        </button>

        <button
          className="text-gray-600 hover:text-blue-500"
          onClick={toggleDropdown}
        >
          <img src={MoreIcon} alt="Home" className="w-6 h-6" />
        </button>
      </div>
      {isOpen && (
        <div className="absolute right-0 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="" role="menu">
            <div
              onClick={() => handleLogout(navigate)} // ✅ handleLogout 함수 실행
              className="hover:bg-gray-100 m-1 p-1"
            >
              <img
                src={SignoutIcon}
                alt="signout"
                className="inline-block align-middle mr-2"
              />
              <p className="inline-block align-middle">로그아웃</p>
            </div>
            <div
              onClick={() => navigate("/login")} // ✅ handleLogout 함수 실행
              className="hover:bg-gray-100 m-1 p-1"
            >
              <img
                src={SignoutIcon}
                alt="signout"
                className="inline-block align-middle mr-2"
              />
              <p className="inline-block align-middle">로그인</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
