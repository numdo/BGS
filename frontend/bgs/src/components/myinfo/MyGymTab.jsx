// MyGymTab.jsx
import MyGymRoomView from "../../components/mygym/MyGymRoomView";
import { useEffect } from "react";
import { getMygym } from "../../api/Mygym";
import useMyGymStore from "../../stores/useMyGymStore";

export default function MyGymTab({ friendId }) {
  const { myGym, setMyGym } = useMyGymStore();

  useEffect(() => {
    if (!friendId) return;
    getMygym(friendId).then((fetched) => {
      setMyGym(fetched);
    });
  }, [friendId]);

  return (
    <>
      <MyGymRoomView />
    </>
  );
}
