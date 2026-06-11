import React, { useEffect, useState } from "react";
import axios from "axios";
// Import các thành phần vẽ biểu đồ
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "../../Setting/style.scss";
import "./style.scss";

const API_URL = "http://localhost:3000";

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="stat-card">
    <div className="card-title">{title}</div>
    <div className="card-value">{value}</div>
  </div>
);

const StatsPage = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalFavorites: 0,
    score: 0,
    chartData: [],
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_URL}/setting/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => console.error("Failed to load stats:", err));
  }, [token]);

  return (
    <>
      <div className="spgHeader">Stats</div>
      <div className="spgHint">Total stats across your profile</div>

      <div className="metrics-grid">
        {/* Truyền prop value chuẩn */}
        <StatCard title="Total Posts" value={stats.totalPosts} />
        <StatCard title="Total Favorites" value={stats.totalFavorites} />
        <StatCard title="Score" value={stats.score} />
      </div>

      <div className="chart-section-card">
        <div className="chart-header">
          <div className="chart-title">Favorites Over Time</div>
          <div className="chart-subtitle">
            Total favorites over last 30 days
          </div>
        </div>

        <div
          className="chart-container"
          style={{ width: "100%", height: "300px" }}
        >
          {stats.chartData && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#888" }}
                  interval={3}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  // Mẹo: Bạn có thể thêm formatter nếu muốn chỉnh kỹ hơn nữa
                  // formatter={(value) => [`${value} lượt thích`, "Favorites"]}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  name="Favorites"
                  stroke="#8884d8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "#999",
              }}
            >
              Loading chart data...
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StatsPage;
