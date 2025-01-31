import React from 'react';
import BottomBar from '../components/BottomBar';
import TopBar from '../components/TopBar';
export default function FeedPage() {
  return (
    <>
      <TopBar />
      <div className='m-4'>
        <h1>피드 페이지</h1>
      </div>
      <BottomBar />
    </>
  );
};

