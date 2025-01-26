// src/pages/MyGymPage.jsx
import { useState } from "react";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import MyGymItem from "../components/mygym/MyGymItem";
import MyGymRoom from "../components/mygym/MyGymRoom";

const MyGymPage = () => {
  const [items, setItems] = useState([]);
  const [roomColor, setRoomColor] = useState("#F5F1D9");

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
