import useMyGymStore from "../../stores/useMyGymStore";
import mygymbackimg from "../../assets/images/mygymbackimg.png";
import backimg1 from "../../assets/images/backimg1.png";
import backimg2 from "../../assets/images/backimg2.png";


const colors = [
  "#FFFFFF",
  "#484547",
  "#FFEB00",
  "#79B465",
  "#005AFF",
  "#9E3AC3",
];

const BackGroundColorButton = ({ setBgColor }) => {
  const { myGym, setMyGym } = useMyGymStore();
  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => setMyGym({ ...myGym, backgroundColor: color })}
          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

export default BackGroundColorButton;
