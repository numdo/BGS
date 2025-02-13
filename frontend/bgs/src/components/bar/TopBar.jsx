import { useNavigate } from "react-router-dom";
import favicon from "../../assets/images/favicon.png";

export default function TopBar() {
  const navigate = useNavigate();
  const handleNavigation = (url) => {
    navigate(url);
  };

  return (
    <div className="w-full z-30">
      {/* flex 컨테이너에서 justify-center로 가운데 정렬 */}
      <div className="flex justify-center items-center px-4 py-3">
        <button
          onClick={() => handleNavigation("/")}
          className="text-gray-600 hover:text-blue-500"
        >
          <img src={favicon} alt="Home" className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
