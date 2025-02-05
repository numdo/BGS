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

export async function logout() {

}


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