import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import emitter from "../../utils/emitter"; // 전역 emitter 임포트
import BeatLoader from "../../components/common/LoadingSpinner";
import { showErrorAlert, showSuccessAlert, showInformAlert } from "../../utils/toastrAlert";

const ItemShopPage = () => {
  const [items, setItems] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, userRes] = await Promise.all([
          axiosInstance.get("/items"),
          axiosInstance.get("/users/me"),
        ]);

        // 보유하지 않은 아이템만 필터링
        setItems(itemsRes.data.filter((item) => !item.owned));
        setUserInfo(userRes.data);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      // 사용자 코인 업데이트
      setUserInfo((prev) => ({ ...prev, coin: prev.coin - price }));
      // 구매 후 전역 이벤트 발생
      emitter.emit("itemPurchased");
    } catch (error) {
      showErrorAlert("구매 실패: " + (error.response?.data?.message || error.message));
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <BeatLoader size={20} color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">아이템 상점</h1>
      <p className="mb-4">보유 코인: {userInfo?.coin}</p>
      <div className="grid gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.itemId}
              className="border p-4 rounded-lg flex items-center justify-between"
            >
              <div>
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  className="w-16 h-16 object-cover rounded"
                />
                <p className="font-semibold">{item.itemName}</p>
                <p>{item.price} 코인</p>
              </div>
              <button
                onClick={() => handlePurchase(item.itemId, item.price)}
                disabled={userInfo.coin < item.price}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
              >
                구매
              </button>
            </div>
          ))
        ) : (
          <p>구매 가능한 아이템이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default ItemShopPage;
