import UserItem from "./UserItem";

export default function UserList({ users, emptyMessage, emptyClass }) {
  return (
    <div className="w-full flex-shrink-0 flex flex-col items-start px-4 mt-4 relative h-full">
      {users.length > 0 ? (
        users.map((user) => <UserItem key={user.userId} user={user} />)
      ) : (
        // ✅ 리스트가 없을 경우 중앙에 메시지 표시 + 추가 여백
        <div
          className={`absolute inset-0 flex justify-center items-center ${emptyClass}`}
        >
          <p className="text-gray-500 text-lg text-center">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
