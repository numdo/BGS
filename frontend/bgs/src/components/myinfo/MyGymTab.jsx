import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import { useEffect } from "react";
import { getMygym } from "../../api/Mygym";
import useMyGymStore from "../../stores/useMyGymStore";
import VisitorMemo from "../mygym/VisitorMemo";
import useUserStore from "../../stores/useUserStore";
import backimg from "../../assets/images/backimg.png";
import bgimg1 from "../../assets/images/backimg1.jpg";
import bgimg2 from "../../assets/images/backimg2.jpg";
import bgimg3 from "../../assets/images/backimg3.jpg";
import bgimg4 from "../../assets/images/backimg4.jpg";
import bgimg5 from "../../assets/images/backimg5.jpg";
import bgimg6 from "../../assets/images/backimg6.jpg";

export default function MyGymTab({ friendId }) {
  const { myGym, setMyGym } = useMyGymStore();
  const { user } = useUserStore();
  const backgroundImages = {
    bgimg: backimg,
    bgimg1: bgimg1,
    bgimg2: bgimg2,
    bgimg3: bgimg3,
    bgimg4: bgimg4,
    bgimg5: bgimg5,
    bgimg6: bgimg6,
  };
  useEffect(() => {
    if (!friendId) return;
    getMygym(friendId).then((fetched) => {
      setMyGym(fetched);
    });
  }, [friendId]);

  return (
    <div
      style={{
        minHeight: "80vh",
        backgroundImage: `url(${backgroundImages[myGym.backgroundColor] || backimg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat-x",
        animation: myGym.flowed ? "moveBg 60s linear infinite" : "none",
        position: "relative",
    }}
    >
      <div className="flex flex-col items-center w-full">
        {/* 🔹 MyGymRoomView 크기 조정 (scale 적용) */}
        <div className="w-full flex justify-center">
          <div className="transform scale-90">
            {" "}
            {/* 90% 크기로 축소 */}
            <MyGymRoomView />
          </div>
        </div>

        {/* 🔹 VisitorMemo 크기 조정 */}
        <div className="w-full max-w-[80%] py-6 mx-auto">
          <VisitorMemo userId={friendId} />
        </div>
      </div>
    </div>
  );
}
