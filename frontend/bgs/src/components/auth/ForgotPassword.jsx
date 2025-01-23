import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("임시 비밀번호 발급 요청:", email);
  };

  return (
    <div className="forgot-password-container">
      <form onSubmit={handleSubmit}>
        <h2>비밀번호 찾기</h2>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">임시 비밀번호 발급</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
