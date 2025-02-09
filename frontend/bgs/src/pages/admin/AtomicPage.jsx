import TopBar from "../../components/bar/TopBar";
import BottomBar from "../../components/bar/BottomBar";
import MoreIcon from "../../assets/icons/More.svg";

export default function WorkoutRealtimePage() {
  return (
    <>
      <TopBar />
      <h1>삭제 버튼</h1>
      <div>
        <button
          className="px-auto py-2 border border-danger text-danger rounded-md h-10 w-10"
          onClick={() => {}}
        >
          삭제
        </button>
        <button
          className="px-auto py-2 border border-red-300 rounded-md h-10 w-10"
          onClick={() => {}}
        >
          삭제
        </button>
        <button
          className="border border-danger text-danger rounded-md h-7 w-7"
          onClick={() => {}}
        >
          ✘
        </button>
      </div>
      <h1>수정 버튼</h1>
      <button
        className="px-auto py-2 border border-blue-300 rounded-md h-10 w-10"
        onClick={() => {}}
      >
        수정
      </button>
      <h1>더보기 버튼</h1>
      <div>
        <button className="bg-gray-100 rounded-md w-6 h-6" onClick={() => {}}>
          <img src={MoreIcon} alt="" />
        </button>
      </div>
      <h1>추가 버튼</h1>
      <div>
        <button
          onClick={() => {}}
          className="bg-primary-light text-white font-bold py-3 px-6 rounded-full transition-all duration-300"
        >
          운동 기록하기
        </button>
      </div>
      <BottomBar />
    </>
  );
}
