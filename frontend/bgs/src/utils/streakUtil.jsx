// src/utils/streakUtil.js
// 예: attendanceDates = ["2025-02-01","2025-02-03","2025-02-04","2025-02-08", ...]

export function buildStreakSegments(attendanceDates) {
    if (!attendanceDates || attendanceDates.length === 0) return [];
  
    // 날짜 오름차순 정렬
    const sorted = [...attendanceDates].sort();
  
    function dateDiffInDays(ymd1, ymd2) {
      const [y1, m1, d1] = ymd1.split("-").map(Number);
      const [y2, m2, d2] = ymd2.split("-").map(Number);
      const dateA = new Date(y1, m1 - 1, d1);
      const dateB = new Date(y2, m2 - 1, d2);
      return Math.floor((dateB - dateA) / (1000 * 60 * 60 * 24));
    }
  
    const segments = [];
    let currentSegment = {
      start: sorted[0],
      end: sorted[0],
      attended: new Set([sorted[0]]),
    };
  
    for (let i = 1; i < sorted.length; i++) {
      const prevDay = sorted[i - 1];
      const currDay = sorted[i];
      const gap = dateDiffInDays(prevDay, currDay);
  
      if (gap <= 2) {
        // 같은 구간으로 이어짐
        currentSegment.end = currDay;
        currentSegment.attended.add(currDay);
      } else {
        // 끊김 => 새 구간
        segments.push(currentSegment);
        currentSegment = {
          start: currDay,
          end: currDay,
          attended: new Set([currDay]),
        };
      }
    }
    segments.push(currentSegment);
  
    return segments;
  }
  