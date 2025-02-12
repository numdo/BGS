// src/pages/admin/AdminMainPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopBar from "../../components/admin/AdminTopBar";
import AdminUserManagement from "../../components/admin/AdminUserManagement";
import AdminItemManagement from "../../components/admin/AdminItemManagement";

export default function AdminMainPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user"); // "user" 또는 "item"

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
