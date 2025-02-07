import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import MainPage from "./pages/home/MainPage";
import MyGymPage from "./pages/mygym/MyGymPage";
import MyInfoPage from "./pages/myinfo/MyInfoPage";
import WorkoutPage from "./pages/workout/WorkoutPage";
import WorkoutDiaryPage from "./pages/workout/WorkoutDiaryPage";
import WorkoutCreatePage from "./pages/workout/WorkoutCreatePage";
import WorkoutUpdatePage from "./pages/workout/WorkoutUpdatePage";
import FeedPage from "./pages/feed/FeedPage";
import FeedDetailPage from "./pages/feed/FeedDetailPage"
import BullLoginPage from "./pages/auth/BulLoginPage";
import SignupPage from "./pages/auth/SignupPage";
import UserDetailsPage from "./pages/auth/UserDetailsPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import SocialSignupPage from "./pages/auth/SocialSignupPage";
import SocialRedirectPage from "./pages/auth/SocialRedirectPage"; // ✅ 통합된 페이지
import AdminItemPage from "./pages/admin/AdminItemPage";

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
          <Route path="/login/oauth2/success" element={<KakaoRedirectPage />} />
          <Route
            path="/login/oauth2/code/google"
            element={<GoogleRedirectPage />}
          />
          <Route path="/social-signup" element={<SocialSignupPage />} />
          <Route path="/mygym" element={<MyGymPage />} />
          <Route path="/admin-item" element={<AdminItemPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/feed/:diaryId" element={<FeedDetailPage />} />
          <Route path="/myinfo" element={<MyInfoPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/workoutdiary" element={<WorkoutDiaryPage />} />
          <Route path="/workoutcreate" element={<WorkoutCreatePage />} />
          <Route path="/workoutupdate" element={<WorkoutUpdatePage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
