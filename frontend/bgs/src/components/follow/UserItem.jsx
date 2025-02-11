import { useNavigate } from "react-router-dom";
import DefaultProfileImage from "../../assets/icons/MyInfo.png";

export default function UserItem({ user }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-100 w-full max-w-md"
      onClick={() => navigate(`/profile/${user.userId}`)}
    >
      <img
        src={user.profileImageUrl || DefaultProfileImage}
        alt="프로필"
        className="w-12 h-12 rounded-full"
      />
      <div className="ml-4 w-full overflow-hidden">
        <p className="text-lg font-semibold truncate">{user.nickname}</p>
        <p className="text-gray-500 text-sm truncate">
          {user.introduce || "소개 없음"}
        </p>
      </div>
    </div>
  );
}
