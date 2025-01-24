import React, {useState} from 'react';
import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';
import MyGymItem from "../components/mygym/MyGymItem";
import MyGymRoom from '../components/mygym/MyGymRoom';


const MyGymPage = () => {
  return (
    <>
    <TopBar />
    <div className=' flex-col justify-between'>
      <header className='text-center py-4'>
        <h1 className='text-2xl font-bold'>국건이의 마이짐</h1>
        <MyGymRoom />
        {/* 박스 제어 버튼 */}
        <button>
          
        </button>
      </header>
      <MyGymItem />
    </div>
    
    <BottomBar />
    </>
  );
};

export default MyGymPage;