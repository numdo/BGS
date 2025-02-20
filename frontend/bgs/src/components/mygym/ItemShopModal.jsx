import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import emitter from "../../utils/emitter";
import BeatLoader from "../common/LoadingSpinner";
import {
  showErrorAlert,
  showSuccessAlert,
  showInformAlert,
} from "../../utils/toastrAlert";

export default function ItemShopModal({ onClose }) {
  const [items, setItems] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1) 아이템 목록과 유저 정보 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, userRes] = await Promise.all([
          axiosInstance.get("/items"),
          axiosInstance.get("/users/me"),
        ]);
        // 'owned'가 false 인 아이템만 표시
        const unownedItems = itemsRes.data.filter((item) => !item.owned);
        setItems(unownedItems);
        setUserInfo(userRes.data);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2) 아이템 구매 처리
  const handlePurchase = async (itemId, price) => {
    if (!userInfo || userInfo.coin < price) {
      showInformAlert("코인이 부족합니다.");
      return;
    }
    try {
      await axiosInstance.post(`/items/${itemId}/buy`);
      showSuccessAlert("아이템이 구매 되었습니다.");

      // 구매한 아이템은 상점 목록에서 제거
      setItems((prevItems) =>
        prevItems.filter((item) => item.itemId !== itemId)
      );

      // 사용자 코인 차감
      setUserInfo((prev) => ({ ...prev, coin: prev.coin - price }));

      // 전역 이벤트 발생 (예: 마이짐 재로딩)
      emitter.emit("itemPurchased");
    } catch (error) {
      showErrorAlert(
        "구매 실패: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // 3) 로딩 스피너 모달
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
          {/* 스피너 */}
          <div className="flex items-center justify-center h-40">
            <BeatLoader size={20} color="#2563eb" />
          </div>
        </div>
      </div>
    );
  }

  // 4) 실제 상점 모달
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {/* 전체 모달 영역 (세로 최대 80% 높이 등 필요하면 조절) */}
      <div className="relative bg-white w-full max-w-lg h-[80vh] rounded-xl shadow-xl overflow-hidden">
        {/* 상단 영역 (sticky) - 닫기 버튼, 코인 표시 */}
        <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center justify-between">
          {/* 타이틀 */}
          <h2 className="text-xl font-bold text-gray-800">아이템 상점</h2>

          {/* 오른쪽: 코인 정보 + 닫기 버튼 */}
          <div className="flex items-center space-x-4">
            <p className="font-semibold text-gray-700">
              🪙  {userInfo?.coin ?? 0}
            </p>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
          </div>
        </div>

        {/* 아이템 목록 영역 (스크롤) */}
        <div className="p-4 overflow-auto h-full">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between border p-4 mb-4 rounded-lg"
              >
                <div className="flex items-center">
                  {/* 아이템 이미지 */}
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    className="w-16 h-16 object-cover rounded mr-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.itemName}
                    </p>
                    <p className="text-gray-600">{item.price} 코인</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(item.itemId, item.price)}
                  disabled={userInfo?.coin < item.price}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                  구매
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">구매 가능한 아이템이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
