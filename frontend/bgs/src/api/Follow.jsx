import axios from "axios";
const BASE_URL = "https://i12c209.p.ssafy.io/";

export async function getUser() {
  axios.get(BASE_URL + "api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}