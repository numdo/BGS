// src/recoil/profileState.js
import { atom } from "recoil";

export const profileState = atom({
  key: "profileState",
  default: null,
});

export const profileLoadingState = atom({
  key: "profileLoadingState",
  default: true,
});

export const profileIncompleteState = atom({
  key: "profileIncompleteState",
  default: null, // true: 미완성, false: 완성
});
