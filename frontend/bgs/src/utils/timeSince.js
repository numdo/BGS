export function timeSince(dateString) {
    if (!dateString) return ""; // 혹시 createdAt이 없을 때 예외처리
  
    const now = new Date();
    const past = new Date(dateString);
    const diffSec = (now - past) / 1000; // 초 단위 차이
  
    if (diffSec < 60) {
      return "방금 전";
    } else if (diffSec < 3600) {
      const minutes = Math.floor(diffSec / 60);
      return `${minutes}분 전`;
    } else if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${hours}시간 전`;
    } else if (diffSec < 2592000) {
      // 30일 기준
      const days = Math.floor(diffSec / 86400);
      return `${days}일 전`;
    } else {
      // 30일 이상은 "n달 전"으로 계산 (간단 처리)
      const months = Math.floor(diffSec / 2592000);
      return `${months}달 전`;
    }
  }
  