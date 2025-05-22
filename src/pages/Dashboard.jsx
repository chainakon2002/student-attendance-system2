import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const COLORS = {
  มา: "#4CAF50",
  สาย: "#FF9800",
  ลา: "#03A9F4",
  ขาด: "#F44336",
};

const terms = [
  { value: "1_2568", label: "ภาคเรียน 1/2568" },
  { value: "2_2568", label: "ภาคเรียน 2/2568" },
  { value: "1_2569", label: "ภาคเรียน 1/2569" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [termChartData, setTermChartData] = useState([]);
  const [latestTerm, setLatestTerm] = useState({ value: "1_2569", label: "ภาคเรียน 1/2569" });

  useEffect(() => {
    const checkinsRef = ref(db, "checkins");
    onValue(checkinsRef, (snapshot) => {
      const data = snapshot.val() || {};

      // นับรวมสถิติรวมทั้งหมด (ไม่จำเป็นแต่เก็บไว้)
      const counts = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
      Object.values(data).forEach((dayObj) => {
        Object.values(dayObj).forEach((periods) => {
          Object.values(periods).forEach((students) => {
            Object.values(students).forEach((status) => {
              if (counts[status] !== undefined) {
                counts[status]++;
              }
            });
          });
        });
      });
      setStats(counts);

      // ========== สร้างข้อมูลกราฟรายสัปดาห์ ==========
      // สมมติว่า key วันที่เก็บแบบ '2023-05-21' และเราเอา 7 วันล่าสุด
      const daysSorted = Object.keys(data).sort((a, b) => (a < b ? 1 : -1)); // ล่าสุดก่อน
      const last7Days = daysSorted.slice(0, 7).reverse(); // กลับด้านให้เรียงจากเก่าถึงใหม่

      const weeklyData = last7Days.map((date) => {
        const dayData = data[date];
        // รวมสถานะทั้งหมดในวันนั้น
        const countsPerDay = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
        Object.values(dayData).forEach((periods) => {
          Object.values(periods).forEach((students) => {
            Object.values(students).forEach((status) => {
              if (countsPerDay[status] !== undefined) countsPerDay[status]++;
            });
          });
        });
        return {
          date,
          ...countsPerDay,
        };
      });
      setWeeklyChartData(weeklyData);

      // ========== สร้างข้อมูลกราฟรายเดือน ==========
      // รวมข้อมูลเป็นเดือน เช่น '2023-05'
      const monthlyCounts = {};
      Object.entries(data).forEach(([date, dayData]) => {
        const month = date.slice(0, 7);
        if (!monthlyCounts[month]) {
          monthlyCounts[month] = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
        }
        Object.values(dayData).forEach((periods) => {
          Object.values(periods).forEach((students) => {
            Object.values(students).forEach((status) => {
              if (monthlyCounts[month][status] !== undefined) {
                monthlyCounts[month][status]++;
              }
            });
          });
        });
      });

      const monthlyData = Object.entries(monthlyCounts)
        .sort((a, b) => (a[0] > b[0] ? 1 : -1))
        .map(([month, counts]) => ({
          month,
          ...counts,
        }));
      setMonthlyChartData(monthlyData);

      // ========== สร้างข้อมูลกราฟรายภาคเรียน ==========
      // สมมติ term format: '1_2568' '2_2568' โดยเอา term ที่ล่าสุด
      // เราจะรวมข้อมูลตาม term (แค่เก็บรวมสถานะ)
      const termCounts = {};
      Object.entries(data).forEach(([date, dayData]) => {
        // หา term จากเดือน ปี จากวันที่ (สมมติเดือน 5-10 ภาคเรียน 1, 11-4 ภาคเรียน 2)
        const year = +date.slice(0, 4);
        const month = +date.slice(5, 7);
        let termNum = month >= 5 && month <= 10 ? 1 : 2;
        const termKey = `${termNum}_${year}`;
        if (!termCounts[termKey]) {
          termCounts[termKey] = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
        }
        Object.values(dayData).forEach((periods) => {
          Object.values(periods).forEach((students) => {
            Object.values(students).forEach((status) => {
              if (termCounts[termKey][status] !== undefined) {
                termCounts[termKey][status]++;
              }
            });
          });
        });
      });

      // เอาภาคเรียนล่าสุด (มากสุดตามปี+เทอม)
      const termKeys = Object.keys(termCounts).sort((a, b) => {
        const [termA, yearA] = a.split("_").map(Number);
        const [termB, yearB] = b.split("_").map(Number);
        if (yearA !== yearB) return yearB - yearA;
        return termB - termA;
      });
      const latest = termKeys[0] || "1_2569";
      setLatestTerm(
        terms.find((t) => t.value === latest) || { value: latest, label: `ภาคเรียน ${latest.replace("_", "/")}` }
      );

      // แปลงข้อมูล termCounts เป็น array สำหรับ pie chart
      const termData = Object.entries(termCounts).map(([term, counts]) => ({
        term,
        ...counts,
      }));
      setTermChartData(termData);
    });
  }, []);

  return (
    <div className="p-4 max-w-[1100px] mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">แดชบอร์ดสถิติ</h1>
      <div className="flex gap-6">
        {/* ซ้าย */}
        <div className="flex flex-col gap-6 flex-1">
          {/* รายสัปดาห์ */}
          <div className="border rounded-lg p-4 bg-white shadow" style={{ minHeight: 280 }}>
            <h2 className="text-xl font-semibold mb-3">รายสัปดาห์ (7 วันล่าสุด)</h2>
            {weeklyChartData.length === 0 ? (
              <p>ยังไม่มีข้อมูลรายสัปดาห์</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={weeklyChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="มา" stackId="a" fill={COLORS["มา"]} />
                  <Bar dataKey="สาย" stackId="a" fill={COLORS["สาย"]} />
                  <Bar dataKey="ลา" stackId="a" fill={COLORS["ลา"]} />
                  <Bar dataKey="ขาด" stackId="a" fill={COLORS["ขาด"]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ภาคเรียน */}
          <div className="border rounded-lg p-4 bg-white shadow" style={{ minHeight: 280 }}>
            <h2 className="text-xl font-semibold mb-3">รายภาคเรียน ({latestTerm.label})</h2>
            {termChartData.length === 0 ? (
              <p>ยังไม่มีข้อมูลภาคเรียน</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={termChartData}
                    dataKey={latestTerm.value}
                    nameKey="term"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {termChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry[latestTerm.value]] || "#8884d8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ขวา */}
        <div className="border rounded-lg p-4 bg-white shadow flex-1" style={{ minHeight: 560 }}>
          <h2 className="text-xl font-semibold mb-3">รายเดือน (ย้อนหลัง)</h2>
          {monthlyChartData.length === 0 ? (
            <p>ยังไม่มีข้อมูลรายเดือน</p>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={monthlyChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="มา" stroke={COLORS["มา"]} />
                <Line type="monotone" dataKey="สาย" stroke={COLORS["สาย"]} />
                <Line type="monotone" dataKey="ลา" stroke={COLORS["ลา"]} />
                <Line type="monotone" dataKey="ขาด" stroke={COLORS["ขาด"]} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
