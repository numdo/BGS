// src/components/admin/AdminSidebar.jsx
import React from "react";

export default function AdminSidebar({ navigate }) {
  return (
    <aside className="admin-sidebar w-64 bg-gray-100 p-4">
      <ul>
        <li className="mb-2">
          <button
            onClick={() => navigate("/admin/main")}
            className="w-full text-left text-lg"
          >
            회원 목록 관리
          </button>
        </li>
        {/* 회원 등록 버튼 제거 */}
        {/* 추가 메뉴 구성 필요 시 여기에 추가 */}
      </ul>
    </aside>
  );
}
