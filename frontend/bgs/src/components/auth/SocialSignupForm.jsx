// src/components/auth/SocialSignupForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socialSignup } from "../../api/Auth";
import { checkNickname } from "../../api/User";
import { getUser } from "../../api/User"; // 가입 후 프로필 재확인
import {
  TextField,
  InputAdornment,
  Typography,
  Box,
  Button,
} from "@mui/material";
import LogoSection from "../common/LogoSection";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

const SocialSignupForm = ({ userProfile }) => {
  const navigate = useNavigate();

  // formData: 소셜 가입 시 추가정보 (비밀번호 제외)
  const [formData, setFormData] = useState({
    nickname: "",
    name: "",
    sex: "",
    height: "",
    weight: "",
  });
  // 생년월일은 별도 상태 (기본값: 2000년 1월 1일)
  const [birthYear, setBirthYear] = useState(2000);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);

  // 각 필드별 에러 메시지
  const [errors, setErrors] = useState({
    nickname: "",
    name: "",
    sex: "",
    height: "",
    weight: "",
  });
  // 각 필드가 blur 되었는지 추적
  const [touched, setTouched] = useState({
    nickname: false,
    name: false,
    sex: false,
    height: false,
    weight: false,
  });
  // 닉네임 중복 체크 상태: "available" | "unavailable" | "checking" | null
  const [nicknameStatus, setNicknameStatus] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // userProfile이 있을 경우, 초기값 세팅
  useEffect(() => {
    if (userProfile) {
      setFormData({
        nickname: userProfile.nickname || "",
        name: userProfile.name || "",
        sex: userProfile.sex || "",
        height: userProfile.height || "",
        weight: userProfile.weight || "",
      });
      if (userProfile.birthDate) {
        const [y, m, d] = userProfile.birthDate.split("-").map(Number);
        setBirthYear(y);
        setBirthMonth(m);
        setBirthDay(d);
      }
    }
  }, [userProfile]);

  // 개별 필드 유효성 검사 함수
  const validateField = (name, value) => {
    let msg = "";
    if (name === "nickname") {
      if (!value.trim()) {
        msg = "닉네임을 입력해주세요.";
      } else if (value.trim().length < 3) {
        msg = "닉네임은 최소 3글자 이상이어야 합니다.";
      } else if (value.trim().length > 12) {
        msg = "닉네임은 최대 12자까지 입력 가능합니다.";
      }
      if (nicknameStatus === "unavailable") {
        msg = "이미 사용 중인 닉네임입니다.";
      }
    } else if (name === "name") {
      if (!value.trim()) msg = "이름을 입력해주세요.";
    } else if (name === "sex") {
      if (!value) msg = "성별을 선택해주세요.";
    } else if (name === "height") {
      if (!value) {
        msg = "키를 입력해주세요.";
      } else {
        const h = Number(value);
        if (h < 50 || h > 1000) msg = "키는 50 이상 1000 이하여야 합니다.";
      }
    } else if (name === "weight") {
      if (!value) {
        msg = "몸무게를 입력해주세요.";
      } else {
        const w = Number(value);
        if (w < 1 || w > 1000) msg = "몸무게는 1 이상 1000 이하여야 합니다.";
      }
    }
    return msg;
  };

  // 전체 필드 유효성 검사
  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);
    return newErrors;
  };

  // blur 시 해당 필드의 에러 업데이트
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // change 시 formData 업데이트 및 실시간 유효성 검사
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 닉네임 변경 시 중복 체크 초기화
    if (name === "nickname") {
      setNicknameStatus(null);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  // 닉네임 중복 체크
  const handleNicknameCheck = async () => {
    const nickname = formData.nickname.trim();
    if (!nickname) {
      alert("닉네임을 입력해 주세요.");
      return;
    }
    setNicknameStatus("checking");
    try {
      const result = await checkNickname(nickname);
      if (result?.available === true) {
        setNicknameStatus("available");
        setErrors((prev) => ({ ...prev, nickname: "" }));
        alert("사용 가능한 닉네임입니다.");
      } else {
        setNicknameStatus("unavailable");
        setErrors((prev) => ({
          ...prev,
          nickname: "이미 사용 중인 닉네임입니다.",
        }));
        alert("이미 사용 중인 닉네임입니다.");
      }
    } catch (err) {
      setNicknameStatus("unavailable");
      setErrors((prev) => ({
        ...prev,
        nickname: err.message || "닉네임 중복 체크 중 오류가 발생했습니다.",
      }));
      alert(err.message || "닉네임 중복 체크 중 오류가 발생했습니다.");
    }
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateAll();
    const hasError = Object.values(newErrors).some((msg) => msg !== "");
    if (hasError || nicknameStatus !== "available") {
      setError("필수 항목을 모두 올바르게 입력해주세요.");
      return;
    }
    // 생년월일 합치기 (YYYY-MM-DD)
    const monthStr = String(birthMonth).padStart(2, "0");
    const dayStr = String(birthDay).padStart(2, "0");
    const birthDate = `${birthYear}-${monthStr}-${dayStr}`;

    const signupData = { ...formData, birthDate };
    try {
      setLoading(true);
      await socialSignup(signupData);
      const updatedUser = await getUser();
      if (
        updatedUser.nickname &&
        updatedUser.name &&
        updatedUser.birthDate &&
        updatedUser.sex &&
        updatedUser.weight
      ) {
        alert("추가 회원가입이 완료되었습니다.");
        navigate("/");
      } else {
        alert(
          "회원정보가 제대로 저장되지 않았습니다. 다시 시도해 주세요.\n" +
            JSON.stringify(updatedUser)
        );
      }
    } catch (err) {
      console.error("[SocialSignupForm] 회원가입 오류:", err);
      setError(
        err.response?.data?.message || "회원가입 처리 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 연도, 월, 일 옵션 생성
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 1900; y <= currentYear; y++) {
    years.push(y);
  }
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Box className="bg-white rounded-lg p-8 w-full max-w-md relative">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-3 text-black font-medium p-2 rounded hover:bg-gray-100 flex items-center space-x-2"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      {/* 로고 영역 */}
      <div className="flex items-center justify-center mb-8">
        <LogoSection />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* 닉네임 + 중복 체크 */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <TextField
            type="text"
            name="nickname"
            label="닉네임"
            placeholder="닉네임"
            value={formData.nickname}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            variant="outlined"
            error={Boolean(errors.nickname)}
            helperText={
              errors.nickname ||
              (nicknameStatus === "available"
                ? "사용 가능한 닉네임입니다."
                : "")
            }
            sx={{ "& .MuiFormHelperText-root": { minHeight: "12px" } }}
          />
          <button
            type="button"
            onClick={handleNicknameCheck}
            disabled={loading || !formData.nickname.trim()}
            className={`min-w-[80px] h-[56px] p-3 rounded-lg text-base font-semibold transition whitespace-nowrap ${
              loading || !formData.nickname.trim()
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-primary-light text-white hover:bg-primary"
            }`}
          >
            중복 체크
          </button>
        </Box>

        {/* 이름 */}
        <TextField
          type="text"
          name="name"
          label="이름"
          placeholder="이름"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          variant="outlined"
          error={Boolean(errors.name)}
          helperText={errors.name}
        />

        {/* 생년월일 (연, 월, 일) */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            label="연"
            value={birthYear}
            onChange={(e) => setBirthYear(parseInt(e.target.value))}
            variant="outlined"
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="">연</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </TextField>
          <TextField
            select
            label="월"
            value={birthMonth}
            onChange={(e) => setBirthMonth(parseInt(e.target.value))}
            variant="outlined"
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="">월</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </TextField>
          <TextField
            select
            label="일"
            value={birthDay}
            onChange={(e) => setBirthDay(parseInt(e.target.value))}
            variant="outlined"
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="">일</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </TextField>
        </Box>

        {/* 성별 */}
        <TextField
          select
          name="sex"
          label="성별"
          value={formData.sex}
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          variant="outlined"
          SelectProps={{ native: true }}
          error={Boolean(errors.sex)}
          helperText={errors.sex}
        >
          <option value=""></option>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </TextField>

        {/* 키 */}
        <TextField
          type="number"
          name="height"
          label="키"
          placeholder="키"
          value={formData.height}
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: <InputAdornment position="end">cm</InputAdornment>,
            inputProps: { step: 0.1 },
          }}
          error={Boolean(errors.height)}
          helperText={errors.height}
        />

        {/* 몸무게 */}
        <TextField
          type="number"
          name="weight"
          label="몸무게"
          placeholder="몸무게"
          value={formData.weight}
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            inputProps: { step: 0.1 },
          }}
          error={Boolean(errors.weight)}
          helperText={errors.weight}
        />

        {/* 서버 사이드 에러 메시지 */}
        {error && (
          <Typography variant="body2" color="error" align="center">
            {typeof error === "string"
              ? error
              : error?.message || JSON.stringify(error)}
          </Typography>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-lg text-base font-semibold transition ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-light"
          }`}
        >
          회원가입
        </button>
      </form>
    </Box>
  );
};

export default SocialSignupForm;
