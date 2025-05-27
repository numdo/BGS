import arrow_forward from "../../assets/icons/arrow_forward_ios.svg";

export default function Shortcut({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center p-4 bg-white border rounded-lg hover:bg-gray-100 transition-all duration-200"
    >
      <div className="text-left">{children}</div>
      <img className="ml-auto" src={arrow_forward} alt="" />
    </button>
  );
}
