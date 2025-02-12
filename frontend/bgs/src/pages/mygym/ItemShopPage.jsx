import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

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

        setItems(itemsRes.data.filter(item => !item.owned)); // 보유하지 않은 아이템만
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
      alert("코인이 부족합니다.");
      return;
    }

    try {
      await axiosInstance.post(`/items/${itemId}/buy`);
      alert("구매 성공!");
      setItems(prevItems => prevItems.filter(item => item.itemId !== itemId));
      setUserInfo(prev => ({ ...prev, coin: prev.coin - price }));
    } catch (error) {
      alert("구매 실패: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">아이템 상점</h1>
      <p className="mb-4">보유 코인: {userInfo?.coin}</p>
      <div className="grid gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.itemId} className="border p-4 rounded-lg flex items-center justify-between">
              <div>
                <img src={item.imageUrl} alt={item.itemName} className="w-16 h-16 object-cover rounded" />
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
