import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const API_URL = "/mygyms/items";

const AdminItemPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    itemName: "",
    width: "",
    height: "",
    price: "",
    usable: true,
  });
  const [image, setImage] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);

  // 아이템 목록 조회
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get(API_URL);
      setItems(response.data);
    } catch (error) {
      console.error("아이템 목록 조회 실패:", error);
    }
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // 첫 번째 파일 저장
  };

  // FormData 생성 함수 (생성 & 수정 요청)
  const createFormData = () => {
    const formData = new FormData();
    formData.append(
      "item",
      new Blob([JSON.stringify(form)], { type: "application/json" })
    );
    if (image) formData.append("file", image);
    return formData;
  };

  // 아이템 생성
  const handleCreateItem = async () => {
    try {
      await axiosInstance.post(API_URL, createFormData(), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("아이템이 생성되었습니다.");
      fetchItems();
      setForm({ itemName: "", width: "", height: "", price: "" });
      setImage(null);
    } catch (error) {
      console.error("아이템 생성 실패:", error);
    }
  };

  // 아이템 수정
  const handleUpdateItem = async () => {
    if (!editingItemId) return;

    try {
      await axiosInstance.patch(
        `${API_URL}/${editingItemId}`,
        createFormData(),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("아이템이 수정되었습니다.");
      fetchItems();
      setEditingItemId(null);
      setForm({ itemName: "", width: "", height: "", price: "" });
      setImage(null);
    } catch (error) {
      console.error("아이템 수정 실패:", error);
    }
  };

  // 아이템 활성화/비활성화 (토글 기능)
  const handleToggleItemStatus = async (itemId, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      await axiosInstance.patch(
        `${API_URL}/${itemId}/${newStatus ? "enable" : "disable"}`
      );
      alert(`아이템이 ${newStatus ? "활성화" : "비활성화"}되었습니다.`);
      fetchItems();
    } catch (error) {
      console.error(`아이템 ${newStatus ? "활성화" : "비활성화"} 실패:`, error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">아이템 관리</h2>

      {/* 아이템 생성/수정 폼 */}
      <div className="mb-6 p-4 border rounded-md">
        <h3 className="text-lg font-semibold">
          {editingItemId ? "아이템 수정" : "아이템 생성"}
        </h3>
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            name="itemName"
            placeholder="아이템 이름"
            value={form.itemName}
            onChange={handleChange}
            className="p-2 border rounded w-1/4"
          />
          <input
            type="number"
            name="width"
            placeholder="너비"
            value={form.width}
            onChange={handleChange}
            className="p-2 border rounded w-1/6"
          />
          <input
            type="number"
            name="height"
            placeholder="높이"
            value={form.height}
            onChange={handleChange}
            className="p-2 border rounded w-1/6"
          />
          <input
            type="number"
            name="price"
            placeholder="가격"
            value={form.price}
            onChange={handleChange}
            className="p-2 border rounded w-1/6"
          />
          <input
            type="file"
            onChange={handleImageChange}
            className="p-2 border rounded w-1/4"
          />
        </div>
        <div className="mt-4">
          {editingItemId ? (
            <button
              onClick={handleUpdateItem}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md mr-2"
            >
              수정 완료
            </button>
          ) : (
            <button
              onClick={handleCreateItem}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              아이템 추가
            </button>
          )}
        </div>
      </div>

      {/* 아이템 목록 */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">이름</th>
            <th className="border p-2">너비</th>
            <th className="border p-2">높이</th>
            <th className="border p-2">가격</th>
            <th className="border p-2">사용 가능</th>
            <th className="border p-2">이미지</th>
            <th className="border p-2">관리</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.itemId} className="text-center">
              <td className="border p-2">{item.itemId}</td>
              <td className="border p-2">{item.itemName}</td>
              <td className="border p-2">{item.width}</td>
              <td className="border p-2">{item.height}</td>
              <td className="border p-2">{item.price}</td>
              <td className="border p-2">{item.usable ? "✅" : "❌"}</td>
              <td className="border p-2">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt="아이템 이미지"
                    className="w-12 h-12 object-cover"
                  />
                ) : (
                  "없음"
                )}
              </td>
              <td className="border p-2">
                {/* 수정 버튼 */}
                <button
                  onClick={() => {
                    setEditingItemId(item.itemId);
                    setForm({
                      itemName: item.itemName,
                      width: item.width,
                      height: item.height,
                      price: item.price,
                      usable: item.usable,
                    });
                  }}
                  className="px-2 py-1 bg-yellow-500 text-white rounded-md mr-2"
                >
                  수정
                </button>

                {/* 활성화/비활성화 버튼 */}
                <button
                  onClick={() =>
                    handleToggleItemStatus(item.itemId, item.usable)
                  }
                  className={`px-2 py-1 rounded-md text-white ${
                    item.usable ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {item.usable ? "비활성화" : "활성화"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminItemPage;
