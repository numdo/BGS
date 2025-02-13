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
      <MyGymRoomView />
        <div className="mt-4 flex-1 bg-white rounded-3xl">
          <VisitorMemo userId={user.userId}/>
        </div>
    </>
  );
}
