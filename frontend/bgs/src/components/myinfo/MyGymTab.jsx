// MyGymTab.jsx
import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import { useEffect } from "react";
import { getMygym } from "../../api/Mygym";
import useMyGymStore from "../../stores/useMyGymStore";
import VisitorMemo from "../mygym/VisitorMemo";
import useUserStore from "../../stores/useUserStore";
export default function MyGymTab({ friendId }) {
  const { myGym, setMyGym } = useMyGymStore();
  const {user} = useUserStore();
  useEffect(() => {
    if (!friendId) return;
    getMygym(friendId).then((fetched) => {
      setMyGym(fetched);
    });
  }, [friendId]);

  return (
    <>
    <div>

    <div className="relative">
      <div className="relative z-10">
        <MyGymRoomView />
      </div>
    </div>
      <div className="w-full py-6 z-20">
        <VisitorMemo userId={user.userId}/>
      </div>
    </div>
    </>
  );
}
