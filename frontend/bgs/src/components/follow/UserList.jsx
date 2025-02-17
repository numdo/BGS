import DefaultProfileImage from "../../assets/icons/myinfo.png"; // ✅ 기본 프로필 이미지 추가

export default function UserList({ users, emptyMessage }) {
  if (!users || users.length === 0) {
    return <p className="text-center text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="w-full">
      {users.map((user) => (
        <div
          key={user.userId}
          className="flex items-center gap-4 p-3 border-b last:border-none"
        >
          {/* ✅ 프로필 이미지 추가 (없으면 기본 이미지 사용) */}
          <img
            src={user.profileImageUrl || DefaultProfileImage}
            alt={user.nickname}
            className="w-12 h-12 rounded-full border border-gray-300"
          />

          {/* ✅ 닉네임 & 소개 추가 */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">
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
