// MyGymItem.jsx
import { useState, useEffect } from "react";
import useMyGymStore from "../../stores/useMyGymStore";
import axiosInstance from "../../utils/axiosInstance";
import BeatLoader from "../../components/common/LoadingSpinner";
import useUserStore from "../../stores/useUserStore";
import emitter from "../../utils/emitter";

const MyGymItem = ({ forceOpen = false }) => {
  const { myGym, setMyGym } = useMyGymStore();
  const { user } = useUserStore();

  const [isOpen, setIsOpen] = useState(false);
  const [ownedItems, setOwnedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const fetchOwnedItems = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/items");
      const userItems = response.data.filter((item) => item.owned === true);
      setOwnedItems(userItems);
    } catch (error) {
      console.error("아이템 불러오기 실패:", error);
      setOwnedItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchOwnedItems();
    }
  }, [user?.userId]);

  useEffect(() => {
    const handleItemPurchased = () => {
      fetchOwnedItems();
    };
    emitter.on("itemPurchased", handleItemPurchased);
    return () => {
      emitter.off("itemPurchased", handleItemPurchased);
    };
  }, []);

  const addItem = (item) => {
    // 중복 체크
    if (
      myGym.places.some((prev) => prev.itemId === item.itemId && !prev.deleted)
    ) {
      alert(`이미 '${item.itemName}'가(이) 배치되었습니다!`);
      return;
    }

    const newItem = {
      placeId: null,
      itemId: item.itemId,
      image: { url: item.imageUrl },
      name: item.itemName,
      x: 160,
      y: 160,
      rotated: false,
      deleted: false,
    };
    setMyGym({ ...myGym, places: [...myGym.places, newItem] });
    emitter.emit("itemAdded", newItem.itemId);
    setIsOpen(false);
  };

  const toggleBox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`
        fixed bottom-12 w-full 
        bg-white rounded-t-3xl shadow-lg 
        transition-transform duration-500 z-10 
        ${isOpen ? "translate-y-0" : "translate-y-[70%]"}
      `}
      style={{
        // 아래 높이/스크롤 설정으로, 화면을 넘어갈 경우 세로 스크롤
        maxHeight: "50vh",
        overflowY: "auto",
        maxWidth: "600px",
        // “가로”가 튀어나가지 않게 hidden 처리
        overflowX: "hidden",
      }}
    >
      <button
        onClick={toggleBox}
        className="w-full py-3 bg-white text-gray-800 font-bold rounded-t-3xl"
      >
        ㅡ
      </button>

      <div className="p-4">
        {loading ? (
          <div className="w-full flex justify-center">
            <BeatLoader />
          </div>
        ) : ownedItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {ownedItems.map((it, idx) => (
              <div
                key={idx}
                onClick={() => addItem(it)}
                className="flex flex-col items-center cursor-pointer"
              >
                <img
                  src={it.imageUrl}
                  alt={it.itemName}
                  className="w-16 h-16 object-contain mb-2"
                />
                <span className="text-sm font-medium">{it.itemName}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 w-full">
            보유 중인 아이템이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyGymItem;
