import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

export default function CheckInHistory() {
  const [history, setHistory] = useState({});
  const [students, setStudents] = useState({});

  // โหลดประวัติการเช็คชื่อ
  useEffect(() => {
    const refPath = ref(db, 'checkins');
    onValue(refPath, (snapshot) => {
      const data = snapshot.val() || {};
      setHistory(data);
    });
  }, []);

  // โหลดข้อมูลนักเรียน
  useEffect(() => {
    const studentsRef = ref(db, 'students');
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setStudents(data);
    });
  }, []);
const [selectedMonth, setSelectedMonth] = useState('');

const extractMonth = (dateStr) => dateStr.slice(0, 7); // "2025-05"

const monthOptions = Array.from(
  new Set(Object.keys(history).map(extractMonth))
).sort((a, b) => new Date(b) - new Date(a)); 

 const formatThaiMonth = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiYear = year + 543;
  return `${thaiMonths[month - 1]} ${thaiYear}`;
};
const [isVisible, setIsVisible] = useState(false);

const [showStudentModal, setShowStudentModal] = useState(false);


useEffect(() => {
  const timer = setTimeout(() => setIsVisible(true), 100); // รอ 100ms ก่อนโชว์
  return () => clearTimeout(timer);
}, []);

const getStudentHistory = () => {
  const data = {};

  Object.entries(history).forEach(([date, days]) => {
    if (selectedMonth && extractMonth(date) !== selectedMonth) return;

    Object.entries(days).forEach(([day, periods]) => {
      Object.entries(periods).forEach(([period, studentsInPeriod]) => {
        Object.entries(studentsInPeriod).forEach(([studentId, status]) => {
          if (!data[studentId]) data[studentId] = [];
          data[studentId].push({ date, day, period, status });
        });
      });
    });
  });

  return data;
};


  return (
 <div
  className={`p-4 transition-opacity transition-transform duration-700 ease-out ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
  }`}
>

      <h1 className="text-2xl font-bold text-blue-600 mb-4">ประวัติการเช็คชื่อ</h1>
      <div className="mb-4">
  <div className="flex justify-end items-center gap-4 mb-4">
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">-- แสดงทั้งหมด --</option>
    {monthOptions.map((month) => (
      <option key={month} value={month}>
        {formatThaiMonth(month)}
      </option>
    ))}
  </select>

  <button
    onClick={() => setShowStudentModal(true)}
    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-blue-700 transition"
  >
    แสดงประวัตินักเรียน
  </button>
</div>


</div>

{Object.entries(history)
  .filter(([date]) => !selectedMonth || extractMonth(date) === selectedMonth)
  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
  .map(([date, days]) => (

    <div key={date} className="mb-6 border rounded-2xl p-4 bg-white shadow">
      <h2 className="text-lg font-semibold text-blue-500 mb-2">วันที่: {date}</h2>
      {Object.entries(days).map(([day, periods]) => (
        <div key={day} className="mb-4">
          <h3 className="font-medium text-gray-700">{day}</h3>
          {Object.entries(periods).map(([period, records]) => (
            <div key={period} className="ml-4 mb-2">
              <p className="text-sm font-semibold text-gray-600">คาบที่ {period.replace('period', '')}</p>
              <ul className="ml-4 list-disc text-sm">
                {Object.entries(records).map(([studentId, status]) => {
                  const student = students[studentId];
                  const name = student ? student.name : studentId;
                  const grade = student?.grade || '';

                  return (
                    <li key={studentId}>
                      {name} {grade && `(ชั้น ${grade})`} - สถานะ:{" "}
                      <span className="font-medium">{status}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
))}




{showStudentModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-xl relative">
      <button
        onClick={() => setShowStudentModal(false)}
        className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
      >
        &times;
      </button>
      <h2 className="text-xl font-bold text-blue-600 mb-4">ประวัตินักเรียน</h2>

      {/* ✅ แยกชั้นก่อน */}
      {Object.entries(
        Object.entries(getStudentHistory()).reduce((acc, [studentId, records]) => {
          const student = students[studentId];
          const grade = student?.grade || 'ไม่ระบุชั้น';
          if (!acc[grade]) acc[grade] = [];
          acc[grade].push({ studentId, records });
          return acc;
        }, {})
      )
        .sort((a, b) => a[0].localeCompare(b[0])) // เรียงตามชื่อชั้น
        .map(([grade, studentList]) => (
          <div key={grade} className="mb-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">ชั้น {grade}</h3>
            {studentList.map(({ studentId, records }) => {
              const student = students[studentId];
              const name = student?.name || studentId;

              return (
                <div key={studentId} className="mb-3 ml-4 border-b pb-2">
                  <h4 className="font-semibold text-blue-500">{name}</h4>
                  <ul className="list-disc ml-5 text-sm">
                    {records
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((r, idx) => (
                        <li key={idx}>
                          {r.date} ({r.day}) - คาบ {r.period.replace('period', '')} - สถานะ:{" "}
                          <span className="font-medium">{r.status}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ))}
    </div>
  </div>
)}

    </div>
    

    
  );
}
