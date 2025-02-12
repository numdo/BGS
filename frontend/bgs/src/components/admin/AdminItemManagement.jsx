// src/components/admin/AdminItemManagement.jsx
import React, { useState, useEffect } from "react";
import itemApi from "../../api/Item";
import { Paginator } from "primereact/paginator";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function AdminItemManagement() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1); // 1-based page number
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 인라인 편집 상태
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingData, setEditingData] = useState({
    itemName: "",
    width: "",
    height: "",
    price: "",
    usable: true,
  });
  const [image, setImage] = useState(null);

  // fetchItems 함수를 매개변수를 받을 수 있도록 수정 (기본값은 현재 상태)
  const fetchItems = async (
    pageParam = page,
    pageSizeParam = pageSize,
    keywordParam = searchKeyword
  ) => {
    setLoading(true);
    try {
      const data = await itemApi.getAllItems(pageParam, pageSizeParam, keywordParam);
      // 백엔드가 Page 객체라면 data.content와 data.totalElements 사용,
      // 아니라면 data 배열로 처리
      setItems(data.content ? data.content : data);
      setTotalRecords(data.totalElements ? data.totalElements : data.length || 0);
    } catch (error) {
      console.error("아이템 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 목록 조회 (직접 호출)
  useEffect(() => {
    fetchItems();
  }, []); // 최초 한 번만 호출

  // 인라인 편집 폼 입력 변경 핸들러
  const handleChange = (e) => {
    setEditingData({ ...editingData, [e.target.name]: e.target.value });
  };

  // 검색 처리: 엔터키 또는 검색 버튼 클릭 시 실행
  const handleSearch = async (e) => {
    e.preventDefault();
    const keyword = e.target.searchKeyword.value.trim();
    const newPage = 1; // 검색 시 첫 페이지부터 조회
    setSearchKeyword(keyword);
    setPage(newPage);
    await fetchItems(newPage, pageSize, keyword);
  };

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // 수정 요청 시 사용할 FormData 생성
  const createFormData = () => {
    const formData = new FormData();
    formData.append(
      "item",
      new Blob([JSON.stringify(editingData)], { type: "application/json" })
    );
    if (image) formData.append("file", image);
    return formData;
  };

  // 인라인 수정: 수정 폼 저장
  const handleUpdateItem = async () => {
    if (!editingItemId) return;
    try {
      await itemApi.updateItem(editingItemId, createFormData());
      window.alert("아이템이 수정되었습니다.");
      await fetchItems(); // 최신 상태로 목록 갱신
      // 편집 상태 초기화
      setEditingItemId(null);
      setEditingData({
        itemName: "",
        width: "",
        height: "",
        price: "",
        usable: true,
      });
      setImage(null);
    } catch (error) {
      console.error("아이템 수정 실패:", error);
      window.alert("아이템 수정에 실패하였습니다.");
    }
  };

  // 아이템 활성화/비활성화 토글 핸들러
  const handleToggleItemStatus = async (itemId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await itemApi.toggleItemStatus(itemId, newStatus ? "enable" : "disable");
      window.alert(`아이템이 ${newStatus ? "활성화" : "비활성화"}되었습니다.`);
      await fetchItems(); // 변경 후 목록 갱신
    } catch (error) {
      console.error(`아이템 ${newStatus ? "활성화" : "비활성화"} 실패:`, error);
    }
  };

  // 인라인 편집 모드 전환: 해당 아이템 데이터를 편집 상태로 설정
  const handleEditClick = (item) => {
    setEditingItemId(item.itemId);
    setEditingData({
      itemName: item.itemName,
      width: item.width,
      height: item.height,
      price: item.price,
      usable: item.usable,
    });
    setImage(null);
  };

  // 페이지네이션 핸들러: e.page는 0-based index이므로 1-based로 변환 후 직접 호출
  const onPageChange = async (e) => {
    const newPage = e.page + 1;
    setPage(newPage);
    await fetchItems(newPage, pageSize, searchKeyword);
  };

  return (
    <div className="p-4">
      {/* 검색 폼: 엔터키 제출 시 handleSearch가 호출됩니다. */}
      <div className="mb-4">
        <form onSubmit={handleSearch} className="ml-4">
          <input
            type="text"
            name="searchKeyword"
            placeholder="검색어 입력"
            className="border p-2 rounded w-80"
          />
          <button
            type="submit"
            className="ml-2 p-2 bg-primary-light text-white rounded"
          >
            검색
          </button>
        </form>
      </div>

      {/* 인라인 편집 폼 */}
      {editingItemId && (
        <div className="mb-6 p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">아이템 수정</h3>
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              name="itemName"
              placeholder="아이템 이름"
              value={editingData.itemName}
              onChange={handleChange}
              className="p-2 border rounded w-1/4"
            />
            <input
              type="number"
              name="width"
              placeholder="너비"
              value={editingData.width}
              onChange={handleChange}
              className="p-2 border rounded w-1/6"
            />
            <input
              type="number"
              name="height"
              placeholder="높이"
              value={editingData.height}
              onChange={handleChange}
              className="p-2 border rounded w-1/6"
            />
            <input
              type="number"
              name="price"
              placeholder="가격"
              value={editingData.price}
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
            <button
              onClick={handleUpdateItem}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md mr-2"
            >
              수정 완료
            </button>
            <button
              onClick={() => setEditingItemId(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 아이템 목록 테이블 (plain HTML table) */}
      {loading ? (
        <p>로딩중...</p>
      ) : (
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
            {items && items.length > 0 ? (
              items.map((item) => (
                <tr key={item.itemId} className="text-center">
                  <td className="border p-2">{item.itemId}</td>
                  <td className="border p-2">{item.itemName}</td>
                  <td className="border p-2">{item.width}</td>
                  <td className="border p-2">{item.height}</td>
                  <td className="border p-2">{item.price}</td>
                  <td className="border p-2">{item.usable ? "✅" : "❌"}</td>
                  <td className="border p-2 text-center align-middle">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt="아이템 이미지"
                        className="w-12 h-12 object-cover mx-auto"
                      />
                    ) : (
                      "없음"
                    )}
                  </td>
                  <td className="border p-2">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                      >
                        수정
                      </button>
                      <button
                        onClick={() =>
                          handleToggleItemStatus(item.itemId, item.usable)
                        }
                        className={`px-3 py-1 rounded text-white ${
                          item.usable ? "bg-red-500" : "bg-green-500"
                        }`}
                      >
                        {item.usable ? "비활성화" : "활성화"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  조회된 아이템이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* 페이지네이션 컨트롤: PrimeReact Paginator 사용 */}
      <div className="mt-4">
        <Paginator
          first={(page - 1) * pageSize}
          rows={pageSize}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        />
      </div>
    </div>
  );
}
