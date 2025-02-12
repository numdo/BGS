// src/pages/admin/AdminMainPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopBar from "../../components/admin/AdminTopBar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminUserList from "../../components/admin/AdminUserList";
import BottomBar from "../../components/bar/BottomBar";
import adminUserApi from "../../api/Admin";

export default function AdminMainPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 관리자 API 호출하여 회원 목록 불러오기
  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await adminUserApi.getAllUsers(page, pageSize, searchKeyword);
        // 백엔드에서 Page 객체의 content 배열로 반환한다고 가정
        setUsers(data.content);
      } catch (error) {
        console.error("회원 목록 조회 실패", error);
        if (error.response && error.response.status === 403) {
          navigate("/403");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [page, pageSize, searchKeyword, navigate]);

  // 검색 핸들러: 검색어 입력 시 상태 갱신 및 첫 페이지로 이동
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = e.target.searchKeyword.value;
    setSearchKeyword(keyword);
    setPage(1);
  };

  // 회원 삭제 핸들러
  const handleDelete = async (userId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await adminUserApi.deleteUser(userId);
        const data = await adminUserApi.getAllUsers(page, pageSize, searchKeyword);
        setUsers(data.content);
      } catch (error) {
        console.error("회원 삭제 실패", error);
        if (error.response && error.response.status === 403) {
          navigate("/403");
        }
      }
    }
  };

  // 비밀번호 초기화 핸들러
  const handleResetPassword = async (userId) => {
    const newPassword = prompt("새 비밀번호를 입력하세요:");
    if (newPassword) {
      try {
        await adminUserApi.resetPassword(userId, newPassword);
        alert("비밀번호가 재설정되었습니다.");
      } catch (error) {
        console.error("비밀번호 재설정 실패", error);
        if (error.response && error.response.status === 403) {
          navigate("/403");
        }
      }
    }
  };

  // 인라인 수정 후 저장 시 호출될 onUpdate 콜백
  const handleUpdate = async (userId, updatedData) => {
    try {
      await adminUserApi.updateUser(userId, updatedData);
      const data = await adminUserApi.getAllUsers(page, pageSize, searchKeyword);
      setUsers(data.content);
    } catch (error) {
      console.error("회원 정보 수정 실패", error);
      if (error.response && error.response.status === 403) {
        navigate("/403");
      }
    }
  };

  return (
    // 최상위 컨테이너에 min-h-screen 추가해서 화면 높이를 꽉 채우도록 함
    <div className="admin-page min-h-screen">
      <AdminTopBar />
      <div className="flex">
        <AdminSidebar navigate={navigate} />
        {/* admin-content 영역에 overflow-x-auto 클래스를 추가하여 가로 스크롤 지원 */}
        <div className="admin-content flex-1 p-4 overflow-x-auto">
          <div className="mb-4">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                name="searchKeyword"
                placeholder="검색어 입력"
                className="border p-2 rounded"
              />
              <button
                type="submit"
                className="ml-2 p-2 bg-blue-500 text-white rounded"
              >
                검색
              </button>
            </form>
          </div>
          {loading ? (
            <p>로딩중...</p>
          ) : (
            <AdminUserList
              users={users}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onResetPassword={handleResetPassword}
            />
          )}
          <div className="mt-4 flex justify-center items-center space-x-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 border rounded"
            >
              이전
            </button>
            <span>{page} 페이지</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="p-2 border rounded"
            >
              다음
            </button>
          </div>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}
