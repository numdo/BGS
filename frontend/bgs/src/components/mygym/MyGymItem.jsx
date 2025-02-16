import { useState, useEffect } from "react";
import useMyGymStore from "../../stores/useMyGymStore";
import axiosInstance from "../../utils/axiosInstance";
import BeatLoader from "../../components/common/LoadingSpinner"; // ✅ 로딩 표시 추가
import useUserStore from "../../stores/useUserStore"; // ✅ 현재 로그인한 사용자 정보 가져오기

const MyGymItem = ({ forceOpen = false, triggerUpdate }) => {
  const { myGym, setMyGym } = useMyGymStore();
  const { user } = useUserStore(); // ✅ 현재 로그인한 사용자 정보 가져오기
  const [isOpen, setIsOpen] = useState(false);
  const [ownedItems, setOwnedItems] = useState([]); // ✅ 보유한 아이템만 저장
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  // ✅ 보유한 아이템을 가져오는 함수
  const fetchOwnedItems = async () => {
    setLoading(true); // ✅ 새 요청이 있을 때 로딩 시작
    try {
      console.log("🔄 아이템 목록 업데이트 요청 (유저 ID:", user.userId, ")");

      const response = await axiosInstance.get("/items");
      const userItems = response.data.filter((item) => item.owned === true); // ✅ `owned: true` 필터링
      console.log("✅ 보유 아이템 불러오기 완료:", userItems);

      setOwnedItems(userItems);
    } catch (error) {
      console.error("❌ 보유 아이템 불러오기 실패:", error);
      setOwnedItems([]); // 실패 시 빈 배열 설정
    } finally {
      setLoading(false); // ✅ 로딩 종료
    }
  };

  // ✅ 계정이 변경될 때마다 아이템 목록을 다시 불러오기
  useEffect(() => {
    if (user?.userId) {
      fetchOwnedItems();
    }
  }, [user?.userId]); // ✅ 유저 계정이 변경될 때마다 실행

  // ✅ 아이템이 변경될 때 즉시 다시 불러오기
  useEffect(() => {
    if (triggerUpdate) {
      fetchOwnedItems();
    }
  }, [triggerUpdate]);

  const addItem = (item) => {
    console.log(`${item.itemName} 추가`);

    // 중복 체크 (이미 배치된 아이템인지 확인)
    if (
      myGym.places.some((prev) => prev.itemId === item.itemId && !prev.deleted)
    ) {
      alert(`이미 '${item.itemName}'가(이) 배치되었습니다!`);
      return;
    }

    // 새 아이템 추가
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
    setIsOpen(false);
  };

  const toggleBox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`fixed bottom-12 left-0 w-full bg-white rounded-t-3xl shadow-lg transition-transform duration-500 ${
        isOpen ? "translate-y-0" : "translate-y-[70%]"
      }`}
    >
      <button
        onClick={toggleBox}
        className="w-full py-3 bg-white text-gray-800 font-bold rounded-t-3xl"
      >
        ㅡ
      </button>

      <div className="p-4 overflow-x-auto flex space-x-4 scroll-snap-x-mandatory">
        {loading ? (
          <div className="w-full flex justify-center">
            <BeatLoader /> {/* ✅ 로딩 중일 때 표시 */}
          </div>
        ) : ownedItems.length > 0 ? (
          ownedItems
            .reduce((result, item, index) => {
              const groupIndex = Math.floor(index / 3);
              if (!result[groupIndex]) result[groupIndex] = [];
              result[groupIndex].push(item);
              return result;
            }, [])
            .map((group, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full max-w-[calc(100%-1rem)] grid grid-cols-3 gap-4"
                style={{ scrollSnapAlign: "center" }}
              >
                {group.map((it, idx) => (
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
            ))
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
