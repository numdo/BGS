import { useNavigate } from "react-router-dom";
import DefaultProfileImage from "../../assets/icons/myinfo.png"; // ✅ 기본 프로필 이미지 추가

export default function UserList({ users, emptyMessage }) {
  const navigate = useNavigate(); // ✅ 네비게이션 기능 추가

  if (!users || users.length === 0) {
    return <p className="text-center text-gray-500 mt-16">{emptyMessage}</p>;
  }

  return (
    <div className="w-full">
      {users.map((user) => (
        <div
          key={user.userId}
          className="flex items-center gap-4 p-3 border-b last:border-none hover:bg-gray-100"
        >
          {/* ✅ 프로필 이미지 클릭 시 이동 */}
          <img
            src={user.profileImageUrl || DefaultProfileImage}
            alt={user.nickname}
            className="w-12 h-12 rounded-full border border-gray-300 cursor-pointer"
            onClick={() => navigate(`/profile/${user.userId}`)}
          />

          {/* ✅ 닉네임 클릭 시 이동 */}
          <div className="flex flex-col">
            <span
              className="text-sm font-semibold text-gray-800 cursor-pointer"
              onClick={() => navigate(`/profile/${user.userId}`)}
            >
              {user.nickname}
            </span>
            <span className="text-xs text-gray-600">
              {user.introduction?.trim() || "소개 없음"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
