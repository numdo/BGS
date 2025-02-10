import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function StatsTab({
  weightData,
  totalWeightData,
  workoutFrequency,
}) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">📊 내 운동 통계</h3>

      {/* 체중 변화 그래프 */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-2">체중 변화</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3대 운동 합 그래프 */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-2">3대 운동 합</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={totalWeightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="totalWeight"
              stroke="#82ca9d"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 운동 빈도 막대 그래프 */}
      <div>
        <h4 className="text-lg font-semibold mb-2">운동 빈도</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={workoutFrequency}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
