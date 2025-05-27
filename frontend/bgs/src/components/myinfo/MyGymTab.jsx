import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);
  const backgroundImages = {
    bgimg: backimg,
    bgimg1: bgimg1,
    bgimg2: bgimg2,
    bgimg3: bgimg3,
    bgimg4: bgimg4,
    bgimg5: bgimg5,
    bgimg6: bgimg6,
  };

  // ✅ MyGym 데이터 새로고침 함수 추가
  const refreshMyGym = useCallback(async () => {
    if (!friendId) return;
    setLoading(true);
    try {
      const fetched = await getMygym(friendId);
      setMyGym(fetched);
    } catch (error) {
      console.error("MyGym 데이터를 불러오는데 실패했습니다:", error);
    }
    setLoading(false);
  }, [friendId, setMyGym]);

  useEffect(() => {
    refreshMyGym(); // ✅ 컴포넌트 마운트 시에도 MyGym 데이터 불러오기
  }, [refreshMyGym]);

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
        backgroundImage: `url(${
          backgroundImages[myGym.backgroundColor] || backimg
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat-x",
        animation: myGym.flowed ? "moveBg 60s linear infinite" : "none",
        position: "relative",
      }}
    >
      <div className="flex flex-col items-center w-full mb-16">
        {/* 🔹 MyGymRoomView 크기 조정 및 세로 길이 축소 */}
        <div className="w-full flex justify-center min-h-[250px] max-h-[300px]">
          <div className="transform scale-90">
            <MyGymRoomView />
          </div>
        </div>

        {/* 🔹 VisitorMemo 크기 조정 */}
        <div className="w-full max-w-[80%] mt-10 py-2 mx-auto">
          <VisitorMemo userId={friendId} refreshMyGym={refreshMyGym} />
        </div>
      </div>
    </div>
  );
}
