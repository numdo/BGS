import React, { useState } from "react";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import MyGymItem from "../components/mygym/MyGymItem";
import MyGymRoom from "../components/mygym/MyGymRoom";

const MyGymPage = () => {
  const [items, setItems] = useState([]); // 아이템 상태 관리
  const [roomColor, setRoomColor] = useState("#F5F1D9"); // 방 색상 상태 관리

  return (
    <>
      <TopBar />
      <div className="flex-col justify-between">
        <h1 className="text-4xl font-bold text-center">국건이의 마이짐</h1>
        <header className="text-center py-40">
          {/* MyGymRoom에 items, setItems, roomColor, setRoomColor 전달 */}
          <MyGymRoom
            items={items}
            setItems={setItems}
            roomColor={roomColor}
            setRoomColor={setRoomColor}
          />
        </header>
        {/* MyGymItem에 setItems 전달 */}
        <MyGymItem setItems={setItems} />
      </div>
      <BottomBar />
    </>
  );
};

export default MyGymPage;
