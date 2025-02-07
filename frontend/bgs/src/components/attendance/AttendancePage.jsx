import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendancePage = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 출석 데이터를 가져옵니다.
  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        // 백엔드 API 호출 (필요에 따라 URL을 수정하세요)
        const response = await axios.get('http://localhost:8080/attendance/current-month', {
          // 인증 헤더가 필요할 경우 headers 옵션 추가
          // headers: { Authorization: 'Bearer <your-token>' }
        });
        setAttendances(response.data);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendances();
  }, []);

  if (loading) {
    return <div>출석 데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div>출석 데이터를 불러오는데 오류가 발생했습니다.</div>;
  }

  return (
    <div>
      <h1>이번 달 출석 목록</h1>
      {attendances.length === 0 ? (
        <p>현재 달에 등록된 출석 기록이 없습니다.</p>
      ) : (
        <ul>
          {attendances.map((record) => (
            <li key={record.attendanceId}>
              <p>
                <strong>출석 ID:</strong> {record.attendanceId}
              </p>
              <p>
                <strong>출석 일자:</strong> {record.attendanceDate}
              </p>
              <p>
                <strong>헬스장 이름:</strong> {record.gymName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttendancePage;