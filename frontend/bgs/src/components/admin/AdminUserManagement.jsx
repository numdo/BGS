// src/components/admin/AdminUserManagement.jsx
import React, { useState, useEffect } from "react";
import adminUserApi from "../../api/Admin";
import AdminUserList from "./AdminUserList";
import { useNavigate } from "react-router-dom";
import { Paginator } from "primereact/paginator";
import "primereact/resources/themes/saga-blue/theme.css"; // 테마 CSS (필요에 따라)
import "primereact/resources/primereact.min.css"; // PrimeReact 기본 CSS
import "primeicons/primeicons.css"; // 아이콘 CSS
import BeatLoader from "../common/LoadingSpinner";

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1); // 1-based page number
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  // fetchUsers 함수를 컴포넌트 스코프에 분리
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminUserApi.getAllUsers(
        page,
        pageSize,
        searchKeyword
      );
      // 백엔드에서 Page 객체의 content 배열과 totalElements를 반환한다고 가정
      setUsers(data.content);
      setTotalRecords(data.totalElements);
    } catch (error) {
      console.error("회원 목록 조회 실패", error);
      if (error.response && error.response.status === 403) {
        navigate("/403");
      }
    } finally {
      setLoading(false);
    }
  };

  // page, pageSize, searchKeyword 변경 시 목록 재조회
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchKeyword]);

  // 검색 처리: 엔터 제출 또는 검색 버튼 클릭 시 실행
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = e.target.searchKeyword.value.trim();
    setSearchKeyword(keyword);
    setPage(1); // 검색 시 첫 페이지부터 조회
  };

  const handleDelete = async (userId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await adminUserApi.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error("회원 삭제 실패", error);
        if (error.response && error.response.status === 403) {
          navigate("/403");
        }
      }
    }
  };

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

  const handleUpdate = async (userId, updatedData) => {
    try {
      await adminUserApi.updateUser(userId, updatedData);
      fetchUsers();
    } catch (error) {
      console.error("회원 정보 수정 실패", error);
      if (error.response && error.response.status === 403) {
        navigate("/403");
      }
    }
  };

  const onPageChange = (e) => {
    // e.page는 0-based index, 따라서 1-based page number로 업데이트
    setPage(e.page + 1);
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

      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <BeatLoader />
        </div>
      ) : (
        <>
          <AdminUserList
            users={users}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
          />
          <div className="mt-4">
            <Paginator
              first={(page - 1) * pageSize}
              rows={pageSize}
              totalRecords={totalRecords}
              onPageChange={onPageChange}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            />
          </div>
        </>
      )}
    </div>
  );
}
