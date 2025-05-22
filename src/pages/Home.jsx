import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'];
const periods = [1, 2, 3, 4, 5, 6];

const termOptions = [
  { label: 'ภาคเรียนที่ 1/2568', value: '1-2568' },
  { label: 'ภาคเรียนที่ 2/2568', value: '2-2568' },
];

export default function Home() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState({});
  const [term, setTerm] = useState('1-2568');

  const getTodayThai = () => {
    const now = new Date();
    const dayIndex = now.getDay();
    if (dayIndex >= 1 && dayIndex <= 5) {
      return days[dayIndex - 1];
    }
    return null;
  };

  const todayThai = getTodayThai();

  useEffect(() => {
    const scheduleRef = ref(db, `schedules/${term}`);
    onValue(scheduleRef, (snapshot) => {
      setSchedule(snapshot.val() || {});
    });
  }, [term]);



  const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setIsVisible(true), 100); // รอ 100ms ก่อนโชว์
  return () => clearTimeout(timer);
}, []);

  return (
  <div
  className={`p-4 transition-all duration-700 ease-out transform ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
  }`}
>
      <h1 className="text-3xl font-bold text-center text-blue-600">ระบบเช็คชื่อนักเรียน</h1>
      <h2 className="text-xl text-center text-gray-600">โรงเรียนบ้านท่าหนามแก้วสวนกล้วย</h2>

     <div className="mt-4 flex justify-end pr-4">
  <div className="relative">
    <select
      value={term}
      onChange={(e) => setTerm(e.target.value)}
      className="appearance-none px-5 py-2 rounded-full shadow-md border border-gray-300 bg-white hover:bg-blue-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
    >
      {termOptions.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
      ▼
    </div>
  </div>
</div>



<div className="overflow-auto mt-6 border rounded-3xl shadow-md">
  <table className="min-w-full text-center table-fixed border-collapse overflow-hidden rounded-2xl">
    <thead>
      <tr className="bg-blue-200 text-blue-900">
  <th className="border p-3 w-24 rounded-tl-2xl">
    <div className="flex flex-col leading-tight">
      <span className="font-medium">วัน / คาบ</span>
    </div>
  </th>
  <th className="border p-3 w-28">
    <div className="flex flex-col leading-tight">
      <span className="font-medium">คาบ 1</span>
      <span className="text-xs text-gray-700">08:30-09:30</span>
    </div>
  </th>
  <th className="border p-3 w-28">
    <div className="flex flex-col leading-tight">
      <span className="font-medium">คาบ 2</span>
      <span className="text-xs text-gray-700">09:30-10:30</span>
    </div>
  </th>
  <th className="border p-3 w-28">
    <div className="flex flex-col leading-tight">
      <span className="font-medium">คาบ 3</span>
      <span className="text-xs text-gray-700">10:30-11:30</span>
    </div>
  </th>
  <th className="border p-3 w-28 bg-yellow-100 text-yellow-800">
    <div className="flex flex-col leading-tight">
      <span className="font-semibold">พักกลางวัน</span>
    </div>
  </th>
  <th className="border p-3 w-28">
    <div className="flex flex-col leading-tight">
      <span className="font-medium">คาบ 4</span>
      <span className="text-xs text-gray-700">12:30-13:30</span>
    </div>
  </th>
  <th className="border p-3 w-28">
    <div className="flex flex-col leading-tight">
      <span className="font-medium">คาบ 5</span>
      <span className="text-xs text-gray-700">13:30-14:30</span>
    </div>
  </th>
  <th className="border p-3 w-28 rounded-tr-2xl">
    <div className="flex flex-col leading-tight">
      <span className="font-medium">คาบ 6</span>
      <span className="text-xs text-gray-700">14:30-15:30</span>
    </div>
  </th>
</tr>

    </thead>
    <tbody>
      {days.map((day, rowIndex) => (
        <tr key={day} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
          <td className={`border font-medium p-2 ${rowIndex === days.length - 1 ? 'rounded-bl-lg' : ''}`}>
            {day}
          </td>

          {/* คาบ 1-3 */}
          {[0, 1, 2].map((i) => {
            const item = schedule?.[day]?.[i];
            let subject = 'ว่าง', className = '';
            if (typeof item === 'string') subject = item;
            else if (item) {
              subject = item.subject || 'ว่าง';
              className = item.class || '';
            }

            const canClick = subject !== 'ว่าง' && day === todayThai;
            const displayText = subject === 'ว่าง' ? 'ว่าง' : `${subject} ${className}`.trim();

            return (
              <td
                key={i}
                className={`border p-2 ${
                  canClick ? 'cursor-pointer hover:bg-blue-100' : 'text-gray-400'
                }`}
                onClick={() => {
                  if (canClick) {
                    navigate(`/checkin/${day}/${i + 1}`, { state: { subject, className } });
                  }
                }}
              >
                {displayText}
              </td>
            );
          })}

          {/* พักกลางวัน */}
          <td className="border p-2 bg-yellow-50 text-yellow-700 font-semibold"></td>

          {/* คาบ 4-6 */}
          {[3, 4, 5].map((i, iIndex) => {
            const item = schedule?.[day]?.[i];
            let subject = 'ว่าง', className = '';
            if (typeof item === 'string') subject = item;
            else if (item) {
              subject = item.subject || 'ว่าง';
              className = item.class || '';
            }

            const canClick = subject !== 'ว่าง' && day === todayThai;
            const displayText = subject === 'ว่าง' ? 'ว่าง' : `${subject} ${className}`.trim();
            const isLastCell = rowIndex === days.length - 1 && iIndex === 2;

            return (
              <td
                key={i}
                className={`border p-2 ${
                  isLastCell ? 'rounded-br-lg' : ''
                } ${canClick ? 'cursor-pointer hover:bg-blue-100' : 'text-gray-400'}`}
                onClick={() => {
                  if (canClick) {
                    navigate(`/checkin/${day}/${i + 1}`, { state: { subject, className } });
                  }
                }}
              >
                {displayText}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}
