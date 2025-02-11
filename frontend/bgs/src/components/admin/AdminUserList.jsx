// src/components/admin/AdminUserList.jsx
import React, { useState } from "react";

export default function AdminUserList({ users, onUpdate, onDelete, onResetPassword }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingData, setEditingData] = useState({
    nickname: "",
    email: "",
    role: "",
  });

  // 편집 모드 전환 시 초기값 설정
  const handleEditClick = (user) => {
    setEditingUserId(user.userId);
    setEditingData({
      nickname: user.nickname,
      email: user.email,
      role: user.role,
    });
  };

  // 입력 변경 핸들러
  const handleChange = (e) => {
    setEditingData({
      ...editingData,
      [e.target.name]: e.target.value,
    });
  };

  // 수정 저장: onUpdate 호출 후 편집 모드 해제 및 성공 alert 표시
  const handleSave = async (userId) => {
    try {
      await onUpdate(userId, editingData);
      setEditingUserId(null);
      window.alert("회원 정보가 수정되었습니다.");
    } catch (error) {
      console.error("회원 정보 수정 실패", error);
      window.alert("회원 정보 수정에 실패하였습니다.");
    }
  };

  // 편집 취소
  const handleCancel = () => {
    setEditingUserId(null);
  };

  return (
    <div className="admin-user-list px-4 py-2">
      <h2 className="text-xl font-bold mb-4">회원 목록</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">닉네임</th>
              <th className="px-4 py-2 border">이메일</th>
              <th className="px-4 py-2 border">이름</th>
              <th className="px-4 py-2 border">역할</th>
              <th className="px-4 py-2 border">작업</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.userId} className="divide-x divide-gray-200">
                  <td className="px-4 py-2 border">{user.userId}</td>
                  <td className="px-4 py-2 border">
                    {editingUserId === user.userId ? (
                      <input
                        type="text"
                        name="nickname"
                        value={editingData.nickname}
                        onChange={handleChange}
                        className="border rounded p-1"
                      />
                    ) : (
                      user.nickname
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingUserId === user.userId ? (
                      <input
                        type="email"
                        name="email"
                        value={editingData.email}
                        onChange={handleChange}
                        className="border rounded p-1"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-4 py-2 border">{user.name}</td>
                  <td className="px-4 py-2 border">
                    {editingUserId === user.userId ? (
                      <select
                        name="role"
                        value={editingData.role}
                        onChange={handleChange}
                        className="border rounded p-1"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    {editingUserId === user.userId ? (
                      <>
                        <button
                          onClick={() => handleSave(user.userId)}
                          className="p-1 bg-blue-500 text-white rounded"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 bg-gray-500 text-white rounded"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-1 bg-green-500 text-white rounded"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => onDelete(user.userId)}
                          className="p-1 bg-red-500 text-white rounded"
                        >
                          삭제
                        </button>
                        <button
                          onClick={() => onResetPassword(user.userId)}
                          className="p-1 bg-yellow-500 text-white rounded"
                        >
                          비밀번호 초기화
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  조회된 회원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
