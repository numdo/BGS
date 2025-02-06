import axios from "axios";
const BASE_URL = "https://i12c209.p.ssafy.io/";

export async function getUser() {
  try {
    const token = localStorage.getItem("accessToken")
    const response = await axios.get(BASE_URL + "api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    throw error;
  }
}
export async function updateUser() {
  try {
    const response = await axios.patch(BASE_URL + "api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export async function updateProfileImage() {

}