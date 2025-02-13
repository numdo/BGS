// src/pages/admin/AdminMainPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopBar from "../../components/admin/AdminTopBar";
import AdminUserManagement from "../../components/admin/AdminUserManagement";
import AdminItemManagement from "../../components/admin/AdminItemManagement";

export default function AdminMainPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    // localStorage에 저장된 탭값이 있으면 사용, 없으면 "user"를 기본값으로 사용
    return localStorage.getItem("adminActiveTab") || "user";
  });

  // activeTab 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  return (
    <div className="admin-page min-h-screen">
      <AdminTopBar />
      <div className="flex">
        <div className="admin-content flex-1 p-4 overflow-x-auto">
          <div className="mb-4 border-b pb-2">
            <button
              onClick={() => setActiveTab("user")}
              className={`px-4 py-2 ${
                activeTab === "user"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-600"
              }`}
            >
              회원 관리
            </button>
            <button
              onClick={() => setActiveTab("item")}
              className={`ml-4 px-4 py-2 ${
                activeTab === "item"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-600"
              }`}
            >
              아이템 관리
            </button>
          </div>
          {activeTab === "user" ? (
            <AdminUserManagement />
          ) : (
            <AdminItemManagement />
          )}
        </div>
      </div>
    </div>
  );
}
