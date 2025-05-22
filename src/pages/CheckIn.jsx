import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';

const CheckIn = () => {
  const { day, period } = useParams();
  const location = useLocation();

  // รับข้อมูล subject กับ className จาก location.state
  const subject = location.state?.subject || '-';
  const className = location.state?.className || '-';

  const [students, setStudents] = useState({});
  const [statuses, setStatuses] = useState({});
  const [saved, setSaved] = useState(false);

const extractGrade = (subject) => {
  const match = subject.match(/ป\.\d/);
  return match ? match[0] : null;
};
  useEffect(() => {
  const studentsRef = ref(db, 'students');
  onValue(studentsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const grade = extractGrade(subject);
    const filtered = Object.fromEntries(
      Object.entries(data).filter(
        ([_, student]) => student.grade === grade
      )
    );
    setStudents(filtered);
  });
}, [subject]);

  const handleChange = (id, status) => {
    setStatuses({ ...statuses, [id]: status });
  };

  const handleSave = () => {
    const date = new Date().toISOString().split('T')[0];
    const refPath = `checkins/${date}/${day}/period${period}`;
    set(ref(db, refPath), statuses).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const statusOptions = ['มา', 'สาย', 'ลา', 'ขาด'];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-600">
        เช็คชื่อ: {day} คาบที่ {period} - วิชา: {subject} 
      </h1>

      <div className="mt-4 space-y-4">
        {Object.entries(students).map(([id, student]) => (
          <div key={id} className="flex items-center justify-between border p-2 rounded">
            <span>{student.name} ({student.grade || '-'})</span>
            <div className="flex space-x-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleChange(id, status)}
                  className={`px-2 py-1 rounded text-sm ${
                    statuses[id] === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-blue-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={handleSave}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          บันทึก
        </button>
        {saved && <div className="text-green-600 mt-2">บันทึกเรียบร้อย</div>}
      </div>
    </div>
  );
};

export default CheckIn;
