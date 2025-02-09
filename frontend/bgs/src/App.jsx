import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import KakaoRedirectPage from "./pages/auth/KakaoRedirectPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import SocialSignupPage from "./pages/auth/SocialSignupPage";
import MainPage from "./pages/home/MainPage";
import MyGymPage from "./pages/mygym/MyGymPage";
import MyInfoPage from "./pages/info/MyInfoPage";
import FeedPage from "./pages/feed/FeedPage";
import FeedDetailPage from "./pages/feed/FeedDetailPage";
import WorkoutPage from "./pages/workout/WorkoutPage";
import WorkoutDiaryPage from "./pages/workout/WorkoutDiaryPage";
import WorkoutCreatePage from "./pages/workout/WorkoutCreatePage";
import WorkoutUpdatePage from "./pages/workout/WorkoutUpdatePage";
import WorkoutRealtimePage from "./pages/workout/WorkoutRealtimePage";
import UserDetailsPage from "./pages/auth/UserDetailsPage";
import AdminItemPage from "./pages/admin/AdminItemPage";
import UserInfoPage from "./pages/info/UserInfoPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import BgsLoginPage from "./pages/auth/BgsLoginPage";
import ProtectedLayout from "./components/auth/ProtectedLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes: 로그인/회원가입 등 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/bgslogin" element={<BgsLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/kakao/callback" element={<KakaoRedirectPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/social-signup" element={<SocialSignupPage />} />

        {/* Protected Routes: 로그인이 되어 있어야 함 */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/user-details" element={<UserDetailsPage />} />
            <Route path="/mygym" element={<MyGymPage />} />
            <Route path="/admin-item" element={<AdminItemPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/feed/:diaryId" element={<FeedDetailPage />} />
            <Route path="/myinfo" element={<MyInfoPage />} />
            <Route path="/profile/:userId" element={<UserInfoPage />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/workoutdiary" element={<WorkoutDiaryPage />} />
            <Route path="/workoutcreate" element={<WorkoutCreatePage />} />
            <Route
              path="/workoutupdate/:diaryId"
              element={<WorkoutUpdatePage />}
            />
            <Route path="/workoutrealtime" element={<WorkoutRealtimePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
