import { useState } from "react";
import VisitorMemoModal from "./VisitorMemoModal";

const VisitorMemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const visitorMemos = [
    {
      id: 1,
      profileImage: "https://via.placeholder.com/40",
      content: "오늘 운동 최고였다!",
    },
    {
      id: 2,
      profileImage: "https://via.placeholder.com/40",
      content: "다음에 또 오고 싶다!",
    },
  ]; // 목업

  const lastMemo = visitorMemos[visitorMemos.length - 1]; //최신
  const userProfile = "https://via.placeholder.com/40";

  return (
    <>
      <div 
        className="w-full bg-gray-100 p-3 rounded-3xl flex items-center justify-between cursor-pointer" 
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center">
          <img src={lastMemo.profileImage} alt="프로필" className="w-8 h-8 rounded-full mr-3" />
          <p className="text-gray-700 text-sm">{lastMemo.content}</p>
        </div>
        <p className="text-blue-500 font-bold">방명록 {visitorMemos.length}</p>
      </div>

      {/* 방명록 모달 */}
      <VisitorMemoModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        visitorMemos={visitorMemos} 
        userProfile={userProfile} 
      />
    </>
  );
};

export default VisitorMemo;
