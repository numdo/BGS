import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import { useEffect } from "react";
import { getMygym } from "../../api/Mygym";
import useMyGymStore from "../../stores/useMyGymStore";
import VisitorMemo from "../mygym/VisitorMemo";
import useUserStore from "../../stores/useUserStore";

export default function MyGymTab({ friendId }) {
  const { myGym, setMyGym } = useMyGymStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (!friendId) return;
    getMygym(friendId).then((fetched) => {
      setMyGym(fetched);
    });
  }, [friendId]);

  return (
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
        <VisitorMemo userId={user.userId} />
      </div>
    </div>
  );
}
