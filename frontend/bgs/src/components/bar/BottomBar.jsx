import { useNavigate } from "react-router-dom";
import home from "../../assets/icons/home.svg";
import home_colored from "../../assets/icons/home_colored.svg";
import person from "../../assets/icons/person.svg";
import person_colored from "../../assets/icons/person_colored.svg";
import fitness_center from "../../assets/icons/fitness_center.svg";
import fitness_center_colored from "../../assets/icons/fitness_center_colored.svg";
import apps from "../../assets/icons/apps.svg";
import apps_colored from "../../assets/icons/apps_colored.svg";
import hexagon from "../../assets/icons/hexagon.svg";
import hexagon_colored from "../../assets/icons/hexagon_colored.svg";
import { useLocation } from "react-router-dom";
export default function BottomBar() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-evenly items-center py-2">
          <button
            onClick={() => navigate("/")}
            className="flex flex-col items-center text-gray-800 active:bg-gray-100 w-16 h-12"
          >
            <img
              src={location.pathname === "/" ? home_colored : home}
              alt="Home"
            />
            <span
              className={`text-sm font-bold ${
                location.pathname === "/" ? "text-[#775A0B]" : ""
              }`}
            >
              홈
            </span>
          </button>
          <button
            onClick={() => navigate("/workout")}
            className="flex flex-col items-center text-gray-800 w-16 h-12"
          >
            <img
              src={
                location.pathname.startsWith("/workout")
                  ? fitness_center_colored
                  : fitness_center
              }
              alt="Workout"
              className=""
            />
            <span
              className={`text-sm font-bold ${
                location.pathname.startsWith("/workout") ? "text-[#775A0B]" : ""
              }`}
            >
              운동일지
            </span>
          </button>
          <button
            onClick={() => navigate("/mygym")}
            className="flex flex-col items-center text-gray-800 w-16 h-12"
          >
            <img
              src={
                location.pathname.startsWith("/mygym")
                  ? hexagon_colored
                  : hexagon
              }
              alt="MyGym"
              className="w-6 h-6"
            />
            <span
              className={`text-sm font-bold ${
                location.pathname.startsWith("/mygym") ? "text-[#775A0B]" : ""
              }`}
            >
              마이짐
            </span>
          </button>
          <button
            onClick={() => navigate("/feeds")}
            className="flex flex-col items-center text-gray-800 w-16 h-12"
          >
            <img
              src={location.pathname.startsWith("/feed") ? apps_colored : apps}
              alt="Feed"
              className=""
            />
            <span
              className={`text-sm font-bold ${
                location.pathname.startsWith("/feed") ? "text-[#775A0B]" : ""
              }`}
            >
              피드
            </span>
          </button>
          <button
            onClick={() => navigate("/myinfo")}
            className="flex flex-col items-center text-gray-800 w-16 h-12"
          >
            <img
              src={
                location.pathname.startsWith("/myinfo")
                  ? person_colored
                  : person
              }
              alt="MyInfo"
              className=""
            />
            <span
              className={`text-sm font-bold ${
                location.pathname.startsWith("/myinfo") ? "text-[#775A0B]" : ""
              }`}
            >
              내정보
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
