import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';

const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'];
const periods = [1, 2, 3, 4, 5, 6];
const termOptions = [
  { label: 'ภาคเรียนที่ 1/2568', value: '1-2568' },
  { label: 'ภาคเรียนที่ 2/2568', value: '2-2568' },
];

export default function EditSchedule() {
  const [term, setTerm] = useState('1-2568');
  const [schedule, setSchedule] = useState({});

  useEffect(() => {
    const scheduleRef = ref(db, `schedules/${term}`);
    onValue(scheduleRef, (snapshot) => {
      setSchedule(snapshot.val() || {});
    });
  }, [term]);

const handleChange = (day, periodIndex, value) => {
  const updated = { ...schedule };
  if (!updated[day]) updated[day] = [];
  updated[day][periodIndex] = value;
  setSchedule(updated);
};



  const handleSave = () => {
    set(ref(db, `schedules/${term}`), schedule);
    alert('บันทึกตารางเรียนแล้ว');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">จัดตารางเรียน</h1>

      <select
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="border px-4 py-2 rounded mb-4"
      >
        {termOptions.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full text-center table-fixed border-collapse">
          <thead>
            <tr className="bg-blue-100">
              <th className="border p-2 w-20">วัน/คาบ</th>
              {periods.map((p) => (
                <th key={p} className="border p-2 w-28">คาบ {p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="border font-medium p-2 bg-blue-50">{day}</td>
                {periods.map((_, i) => (
                  <td key={i} className="border p-2">
                    <input
  type="text"
  value={schedule?.[day]?.[i] || ''}
  onChange={(e) => handleChange(day, i, e.target.value)}
  className="w-full px-2 py-1 border rounded"
  placeholder="เช่น คณิตศาสตร์ ป.6"
/>


                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        บันทึกตารางเรียน
      </button>
    </div>
  );
}
