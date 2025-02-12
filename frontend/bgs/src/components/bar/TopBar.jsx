import { useNavigate } from "react-router-dom";
import arrow_back from "../../assets/icons/arrow_back.png";
import favicon from "../../assets/images/favicon.png";
export default function TopBar() {
  const navigate = useNavigate();
  const handleNavigation = (url) => {
    navigate(url); // url로 이동
  };
  return (
    <div className="w-full border-b z-30">
      <div className="flex justify-between items-center px-4 py-3">
        <button
          className="text-gray-600 hover:text-blue-500"
          onClick={() => {
            navigate(-1);
          }}
        >
          <img src={arrow_back} alt="Home" className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleNavigation("/")}
          className="text-gray-600 hover:text-blue-500"
        >
          <img src={favicon} alt="Home" className="w-6 h-6" />
        </button>
        <div></div>
      </div>
    </div>
  );
}
