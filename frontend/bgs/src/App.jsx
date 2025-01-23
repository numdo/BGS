import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import MyGymPage from "./pages/MyGymPage";
import MyInfoPage from "./pages/MyInfoPage";
import WorkoutPage from "./pages/WorkoutPage"
import WorkoutCreatePage from "./pages/WorkoutCreatePage";
import FeedPage from "./pages/FeedPage"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/mygym" element={<MyGymPage />} />
          <Route path="/Feed" element={<FeedPage />} />
          <Route path="/myinfo" element={<MyInfoPage />} />
          <Route path="/workoutcreate" element={<WorkoutCreatePage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App