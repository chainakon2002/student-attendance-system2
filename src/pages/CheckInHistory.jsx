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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">ประวัติการเช็คชื่อ</h1>
{Object.entries(history)
  .sort((a, b) => new Date(b[0]) - new Date(a[0])) // เรียงวันที่ล่าสุดก่อน
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

    </div>
  );
}
