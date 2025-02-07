import { useNavigate } from 'react-router-dom';
import Home from '../../assets/icons/Home.svg'
import HomeColored from '../../assets/icons/home_colored.svg'
import FeedLogo from '../../assets/icons/Feed.png'
import MyGymLogo from '../../assets/icons/MyGym.png'
import WorkoutLogo from '../../assets/icons/Workout.png'
import MyInfo from '../../assets/icons/MyInfo.png'
import Person from '../../assets/icons/Person.svg'
import PersonColored from '../../assets/icons/PersonColored.svg'
import FitnessCenter from '../../assets/icons/fitness_center.svg'
import FitnessCenterColored from '../../assets/icons/fitness_center_colored.svg'
import Apps from '../../assets/icons/apps.svg'
import AppsColored from '../../assets/icons/apps_colored.svg'
import Hexagon from '../../assets/icons/hexagon.svg'
import HexagonColored from '../../assets/icons/hexagon_colored.svg'
import { useLocation } from 'react-router-dom';
export default function BottomBar() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <>
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center text-gray-600 hover:text-blue-500">
            <img src={location.pathname ==="/"?HomeColored:Home} alt="Home"/>
            <span className={`text-sm font-bold ${location.pathname==="/"?"text-[#775A0B]":""}`}>홈</span>
          </button>

          <button
            onClick={() => navigate('/workout')}
            className="flex flex-col items-center text-gray-600 hover:text-blue-500">
            <img src={location.pathname.startsWith("/workout")?FitnessCenterColored:FitnessCenter} alt="Workout" className="w-6 h-6" />
            <span className={`text-sm font-bold ${location.pathname.startsWith("/workout")?"text-[#775A0B]":""}`}>운동일지</span>
          </button>
          <button
            onClick={() => navigate('/mygym')}
            className="flex flex-col items-center text-gray-600 hover:text-blue-500">
            <img src={location.pathname.startsWith("/mygym")?HexagonColored:Hexagon} alt="MyGym" className="w-5 h-6" />
            <span className={`text-sm font-bold ${location.pathname.startsWith("/mygym")?"text-[#775A0B]":""}`}>마이짐</span>
          </button>
          <button
            onClick={() => navigate('/feed')}
            className="flex flex-col items-center text-gray-600 hover:text-blue-500">
            <img src={location.pathname.startsWith("/feed")?AppsColored:Apps} alt="Feed" className="" />
            <span className={`text-sm font-bold ${location.pathname.startsWith("/feed")?"text-[#775A0B]":""}`}>피드</span>
          </button>
          <button
            onClick={() => navigate('/myinfo')}
            className="flex flex-col items-center text-gray-600 hover:text-blue-500">
            <img src={location.pathname.startsWith("/myinfo")?PersonColored:Person} alt="MyInfo" className="w-6 h-6" />
            <span className={`text-sm font-bold ${location.pathname.startsWith("/myinfo")?"text-[#775A0B]":""}`}>내정보</span>
          </button>
        </div>
      </div>
    </>
  );
};