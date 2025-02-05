import axios from "axios";
const BASE_URL = "https://i12c209.p.ssafy.io/";

export async function login(object) {
  try {
    axios.post(BASE_URL + "/api/users/login",
      object
    )
  } catch (error) {
    throw error
  }
}

export const handleLogout = async (navigate) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.warn("이미 로그아웃됨");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
      return;
    }

    await axios.post(BASE_URL+`/api/users/logout`, null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    alert("로그아웃 되었습니다.");
  } catch (error) {
    console.error("로그아웃 실패:", error);
    alert("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  }
};

export async function signup(object) {
  axios.post(BASE_URL + "/users/signup",
    object
  ).then(res => {

  }).catch(err => {
    console.log(err)
  })
}

export async function signout() {

}

export async function kakaoSignup() {

}

export async function receiveEmailVerify() {

}

export async function sendEmailVerify() {

}

export async function resetPassword() {

}

export async function changePassword() {

}