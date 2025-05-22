import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import StudentManager from './pages/StudentManager';
import CheckInHistory from './pages/CheckInHistory';
import Dashboard from './pages/Dashboard';
import EditSchedule from './pages/EditSchedule';
import DepositPage from './pages/DepositManager';
import {
  ClipboardList,
  Users,
  Clock,
  BarChart2,
  CalendarCheck,
  Wallet,
} from "lucide-react";
import React, { useState, useEffect } from 'react';

function App() {



  const [loading, setLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 2600); // 1.5 วินาที

  return () => clearTimeout(timer);
}, []);
if (loading) {
  return (
  <div className="flex items-center justify-center h-screen bg-blue-50">
    <div className="relative">
      <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
      <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
      <div className="absolute top-0 left-0 h-24 w-24 rounded-full flex items-center justify-center">
        <img src="/student.ico" className="w-10 h-10" alt="logo" />
      </div>
    </div>
  </div>
);

}

  const navItems = [
    { to: "/", label: "เช็คชื่อ", icon: ClipboardList },
    { to: "/students", label: "นักเรียน", icon: Users },
    { to: "/history", label: "ประวัติ", icon: Clock },
    { to: "/dashboard", label: "สถิติ", icon: BarChart2 },
    { to: "/edit-schedule", label: "แก้ไขตาราง", icon: CalendarCheck },
    { to: "/deposit", label: "ฝากเงิน", icon: Wallet },
  ];
  return (
    <Router>
      <div className="min-h-screen bg-blue-50 font-sans">
     <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-4 shadow-lg">
  <div className="container mx-auto flex flex-wrap items-center justify-between px-2">

    <div className="flex items-center gap-3">
     
      <img
        src="/student.ico" 
        alt="Logo"
        className="w-10 h-10 object-contain"
      />
      <h1 className="text-2xl font-bold tracking-wide">ระบบเช็คชื่อนักเรียน</h1>
    </div>
    <div className="flex flex-wrap gap-4 text-sm md:text-base items-center">
      {navItems.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="relative group font-medium transition-all duration-300 flex items-center gap-1"
        >
          <Icon className="w-5 h-5" />
          <span className="group-hover:text-blue-100 transition">{label}</span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
        </Link>
      ))}
    </div>
  </div>
</nav>



        {/* Routes */}
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkin/:day/:period" element={<CheckIn />} />
            <Route path="/students" element={<StudentManager />} />
            <Route path="/history" element={<CheckInHistory />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/edit-schedule" element={<EditSchedule />} />
            <Route path="/deposit" element={<DepositPage />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-600 py-4">
          โรงเรียนบ้านท่าหนามแก้วสวนกล้วย | ปีการศึกษา 2568-2569
        </footer>
      </div>
    </Router>
  );
}

export default App;
