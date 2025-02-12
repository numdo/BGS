// src/components/mygym/MyGymRoomView.jsx
import { useNavigate } from "react-router-dom";
import useMyGymStore from "../../stores/useMyGymStore";
import useUserStore from "../../stores/useUserStore";

const MyGymRoomView = ({ userId }) => {
  const navigate = useNavigate();
  const { myGym } = useMyGymStore();
  const { user } = useUserStore();

  // deleted가 false인 아이템만 표시
  const visibleItems = myGym.places.filter((it) => !it.deleted);

  // 아이템 id  workoutId 매핑
  const workoutMapping = {
    3: 1, // workoutId 1
    4: 125, // workoutId 125
    5: 85, // workoutId 85
    6: 358, // workoutId 358
    7: 383, // workoutId 383
    8: 425, // workoutId 425
  };

  // 아이템 id 운동명 매핑
  const searchMapping = {
    3: "벤치프레스",
    4: "랫풀다운",
    5: "데드리프트",
    6: "싸이클",
    7: "러닝",
    8: "덤벨",
  };

  const handleItemClick = (item) => {
    if(user.userId !== userId) {
      return ;
    }
    if (workoutMapping[item.itemId]) {
      navigate("/workoutcreate", {
        state: {
          openExerciseModal: true,
          preSelectedWorkoutId: workoutMapping[item.itemId],
          searchQuery: searchMapping[item.itemId],
        },
      });
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 실제 방 컨테이너 */}
      <div className="relative w-96 h-96">
      <div
        className="relative w-96 h-96"
        style={{
          filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))",
        }}
      >
        {/* 윗부분: 마이짐 벽 색 */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            clipPath:
              "polygon(50% 12%, 100% 30%, 100% 65%, 50% 45%, 0% 65%, 0% 30%)",
            backgroundColor: myGym.wallColor,
            zIndex: 1,
            boxShadow: "inset 0 4px 8px rgba(0, 0, 0, 0.3)",
            backgroundImage: `linear-gradient(${myGym.wallColor}, ${myGym.wallColor}),
                              radial-gradient(circle at center, rgba(0, 0, 0, 0.3) 0%, transparent 20%)`,
            backgroundBlendMode: "multiply",
          }}
        />
        {/* 아랫부분 */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            clipPath: "polygon(50% 45%, 100% 65%, 50% 85%, 0% 65%)",
            backgroundColor: "#999999",
            zIndex: 0,
          }}
        />
        {/* 아이템 렌더링 */}
        {visibleItems.map((item) => {
          const isRotated = item.rotated || false;
          return (
            <div
              key={item.itemId}
              className="absolute"
              style={{ top: item.y, left: item.x, zIndex: 2 }}
              onClick={() => handleItemClick(item)}
            >
              <div className="relative w-16 h-16">
                <div
                  className="absolute inset-0"
                  style={{ transform: isRotated ? "scaleX(-1)" : "scaleX(1)" }}
                >
                  <img
                    src={item.image.url}
                    alt={item.name}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

export default MyGymRoomView;
