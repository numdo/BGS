import { useState } from "react";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import MyGymItem from "../components/mygym/MyGymItem";
import MyGymRoom from "../components/mygym/MyGymRoom";
import { useEffect } from "react";
// import { useMyGymStore } from "../stores/useMyGymStore";
const MyGymPage = () => {
  const [items, setItems] = useState([]);
  const [roomColor, setRoomColor] = useState("#F5F1D9");
  // const {loaditems,loadGymRoom,saveGymRoom} = useMyGymStore()
  // useEffect(()=>{
  //   loadGymRoom()
  // },[])
  return (
    <>
      <TopBar />
      <div className="flex-col justify-between">
        <h1 className="text-4xl font-bold text-center">국건이의 마이짐</h1>
        <header className="text-center">
          <MyGymRoom
            items={items}
            setItems={setItems}
            roomColor={roomColor}
            setRoomColor={setRoomColor}
          />
        </header>
        <MyGymItem setItems={setItems} />
      </div>
      <BottomBar />
    </>
  );
};

export default MyGymPage;
