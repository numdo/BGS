import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/Auth";
import {
  Container,
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LogoSection from "../../components/common/LogoSection";

const BgsLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customError, setCustomError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  // 상태 추가: 비밀번호 표시 여부
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // 새로고침/재접속 시 자동 로그인
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    // 초기화
    setCustomError(null);
    setServerError(null);

    // 입력값 검증
    if (!email.trim()) {
      setCustomError("이메일을 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      setCustomError("비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await login({ email, password });
      // 임시 비밀번호인 경우
      if (response) {
        alert("임시 비밀번호로 로그인했습니다. 비밀번호를 변경해주세요.");
        navigate("/change-password");
      } else {
        navigate("/");
      }
      // 로그인 성공 시 페이지 새로고침 (navigate 후 재로딩)
      window.location.reload();
    } catch (err) {
      setPassword("");
      setServerError(
        err.response?.data?.message ||
          "로그인에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        position: "relative",
        bgcolor: "white",
        p: 2,
      }}
    >
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-3 text-black font-medium p-2 rounded hover:bg-gray-100 flex items-center space-x-2"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      <LogoSection />

      {/* 로그인 폼 */}
      <Box
        component="form"
        onSubmit={handleLogin}
        noValidate
        sx={{ width: "100%" }}
      >
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="이메일"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!customError && !email.trim()}
          helperText={!!customError && !email.trim() ? customError : ""}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="비밀번호"
          // showPassword 상태에 따라 입력 타입 변경
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (serverError) setServerError(null);
          }}
          error={(!password.trim() && !!customError) || !!serverError}
          helperText={(!password.trim() && customError) || serverError || ""}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            mb: 2,
          }}
        >
          <Link to="/forgot-password" style={{ textDecoration: "none" }}>
            <Typography variant="body2" color="primary">
              비밀번호를 잊으셨나요?
            </Typography>
          </Link>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <Typography variant="body2" color="textPrimary">
              회원가입
            </Typography>
          </Link>
        </Box>

        {/* 로그인 버튼: Tailwind CSS 스타일 그대로 사용 */}
        <button
          type="submit"
          className={`w-full p-3 rounded-lg text-base font-semibold transition ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-light"
          }`}
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </Box>
    </Container>
  );
};

export default BgsLoginPage;
