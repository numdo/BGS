import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import MyGymPage from "./pages/MyGymPage";
import MyInfoPage from "./pages/MyInfoPage";
import WorkoutPage from "./pages/WorkoutPage";
import WorkoutCreatePage from "./pages/WorkoutCreatePage";
import FeedPage from "./pages/FeedPage";
import BullLoginPage from "./pages/BulLoginPage";
import SignupPage from "./pages/SignupPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import KakaoSignupPage from "./pages/KakaoSignupPage";
import KakaoRedirectPage from "./pages/KakaoRedirectPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/bullogin" element={<BullLoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/user-details" element={<UserDetailsPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/auth/kakao/callback" element={<KakaoRedirectPage />} />
          <Route path="/kakao-signup" element={<KakaoSignupPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/mygym" element={<MyGymPage />} />
          <Route path="/Feed" element={<FeedPage />} />
          <Route path="/myinfo" element={<MyInfoPage />} />
          <Route path="/workoutcreate" element={<WorkoutCreatePage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
