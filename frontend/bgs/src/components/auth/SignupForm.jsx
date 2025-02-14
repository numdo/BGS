import { useState } from "react";
import { checkNickname } from "../../api/Auth"; // 닉네임 체크 API 임포트
import { TextField, InputAdornment, Typography, Box } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";

const SignupForm = ({ email, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: email, // 이미 인증된 이메일
    password: "",
    confirmPassword: "",
    nickname: "",
    name: "",
    sex: "",
    height: "",
    weight: "",
  });

  // 생년월일 상태 (기본값: 2000년 1월 1일)
  const [birthYear, setBirthYear] = useState(2000);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);

  // 비밀번호 표시 토글
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 각 필드별 에러 메시지를 저장할 상태
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    name: "",
    sex: "",
    height: "",
    weight: "",
  });

  // 닉네임 중복 체크 결과
  const [nicknameStatus, setNicknameStatus] = useState(null);

  // 각 필드를 blur한 적이 있는지 추적 (초기 false)
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    nickname: false,
    name: false,
    sex: false,
    height: false,
    weight: false,
  });

  // 비밀번호 유효성 검사: 8글자 이상
  const isPasswordValid = (pw) => pw.length >= 8;

  // 개별 필드 유효성 검사 함수
  const validateField = (name, value) => {
    let msg = "";

    switch (name) {
      case "email":
        if (!value.trim()) msg = "이메일을 입력해주세요.";
        break;
      case "password":
        if (!value.trim()) {
          msg = "비밀번호를 입력해주세요.";
        } else if (!isPasswordValid(value)) {
          msg = "비밀번호는 8글자 이상이어야 합니다.";
        }
        break;
      case "confirmPassword":
        if (!value.trim()) {
          msg = "비밀번호 확인을 입력해주세요.";
        } else if (value !== formData.password) {
          msg = "비밀번호가 일치하지 않습니다.";
        }
        break;
      case "nickname":
        if (!value.trim()) {
          msg = "닉네임을 입력해주세요.";
        } else if (value.trim().length > 12) {
          // 닉네임 최대 12자
          msg = "닉네임은 최대 12자까지 입력 가능합니다.";
        }
        // 닉네임이 이미 'unavailable' 상태로 판정된 경우
        if (nicknameStatus === "unavailable") {
          msg = "이미 사용 중인 닉네임입니다.";
        }
        break;
      case "name":
        if (!value.trim()) {
          msg = "이름을 입력해주세요.";
        }
        break;
      case "sex":
        if (!value) {
          msg = "성별을 선택해주세요.";
        }
        break;
      case "height":
        if (!value) {
          msg = "키를 입력해주세요.";
        }
        break;
      case "weight":
        if (!value) {
          msg = "몸무게를 입력해주세요.";
        }
        break;
      default:
        break;
    }

    return msg;
  };

  // 전체 폼의 모든 필드를 검사하는 함수
  const validateAll = () => {
    const newErrors = {};
    for (const key in formData) {
      newErrors[key] = validateField(key, formData[key]);
    }
    setErrors(newErrors);
    return newErrors;
  };

  // blur 시점에서 errors 업데이트
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // change 시점에서 formData 업데이트 및 실시간 검증
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 닉네임 변경 시 중복 체크 초기화
    if (name === "nickname") {
      setNicknameStatus(null);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // 이미 blur된 상태인 경우 실시간 검증
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  // 닉네임 중복 체크
  const handleNicknameCheck = async () => {
    if (!formData.nickname.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }

    try {
      // 서버 응답 예: { available: true } 또는 { available: false }
      const result = await checkNickname(formData.nickname);

      if (result?.available === true) {
        setNicknameStatus("available");
        setErrors((prev) => ({ ...prev, nickname: "" }));
        alert("닉네임 사용 가능합니다.");
      } else {
        // 서버가 available: false라면 이미 존재
        setNicknameStatus("unavailable");
        setErrors((prev) => ({
          ...prev,
          nickname: "이미 사용 중인 닉네임입니다.",
        }));
        alert("이미 사용 중인 닉네임입니다.");
      }
    } catch (err) {
      // HTTP 에러 등
      setNicknameStatus("unavailable");
      setErrors((prev) => ({
        ...prev,
        nickname: err.message || "닉네임 중복 체크 중 오류가 발생했습니다.",
      }));
      alert(err.message || "닉네임 중복 체크 중 오류가 발생했습니다.");
    }
  };

  // 회원가입 버튼 클릭
  const handleSubmit = (e) => {
    e.preventDefault();
    // 폼 전체 검사
    const newErrors = validateAll();
    // 에러 여부 확인
    const hasError = Object.values(newErrors).some((msg) => msg !== "");

    // 폼 유효성 에러나 닉네임 중복 상태일 경우 진행X
    if (hasError || nicknameStatus === "unavailable") {
      return;
    }

    // 검증 통과 후 생년월일 합쳐서 onSubmit
    const { confirmPassword, ...signupData } = formData;
    const monthStr = String(birthMonth).padStart(2, "0");
    const dayStr = String(birthDay).padStart(2, "0");
    signupData.birthDate = `${birthYear}-${monthStr}-${dayStr}`;

    onSubmit(signupData);
  };

  // 연도, 월, 일 SelectBox 옵션
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 1900; y <= currentYear; y++) {
    years.push(y);
  }
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
      {/* 이메일 (readOnly) */}
      <TextField
        type="email"
        name="email"
        label="이메일"
        value={formData.email}
        InputProps={{ readOnly: true }}
        fullWidth
        variant="outlined"
        className="bg-gray-100"
        error={Boolean(errors.email)}
        helperText={errors.email}
        onBlur={handleBlur}
      />

      {/* 비밀번호 */}
      <TextField
        name="password"
        label="비밀번호"
        placeholder="비밀번호"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        variant="outlined"
        error={Boolean(errors.password)}
        helperText={errors.password}
        type={showPassword ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* 비밀번호 확인 */}
      <TextField
        name="confirmPassword"
        label="비밀번호 확인"
        placeholder="비밀번호 확인"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        variant="outlined"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword}
        type={showConfirmPassword ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

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
            errors.nickname
              ? errors.nickname
              : nicknameStatus === "available"
              ? "사용 가능한 닉네임입니다."
              : ""
          }
          sx={{
            "& .MuiFormHelperText-root": { minHeight: "24px" }, // helperText 높이 고정
          }}
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
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
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

      {/* 서버 사이드 에러 (예: 이메일 중복, 닉네임 중복 등) */}
      {error && (
        <Typography variant="body2" color="error" align="center">
          {typeof error === "string"
            ? error
            : // 객체면 message 속성 우선, 없으면 JSON으로 표시
              error?.message || JSON.stringify(error)}
        </Typography>
      )}

      {/* 회원가입 버튼 */}
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
  );
};

export default SignupForm;
