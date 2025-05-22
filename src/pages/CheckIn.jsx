import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';

const CheckIn = () => {
  const { day, period } = useParams();
  const location = useLocation();
  const subject = location.state?.subject || '-';
  const className = location.state?.className || '-';

  const [students, setStudents] = useState({});
  const [statuses, setStatuses] = useState({});
  const [saved, setSaved] = useState(false);

  const statusOptions = ['มา', 'สาย', 'ลา', 'ขาด'];
  const statusColors = {
    'มา': 'bg-green-500',
    'สาย': 'bg-yellow-500',
    'ลา': 'bg-blue-500',
    'ขาด': 'bg-red-500',
  };

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

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const handleSave = () => {
    const date = getLocalDateString();
    const refPath = `checkins/${date}/${day}/period${period}`;
    set(ref(db, refPath), statuses).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow mb-6 border">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">
          เช็คชื่อ: {day} | คาบที่ {period} | วิชา: {subject}
        </h1>
        <p className="text-gray-600">ชั้นเรียน: {className}</p>
      </div>

      <div className="space-y-4">
        {Object.entries(students).map(([id, student]) => (
          <div
            key={id}
            className="bg-white border shadow-sm rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-gray-800">
                {student.name} <span className="text-sm text-gray-500">(ชั้น {student.grade})</span>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleChange(id, status)}
                  className={`px-3 py-1 text-sm rounded-full text-white shadow-sm transition ${
                    statuses[id] === status
                      ? `${statusColors[status]}`
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow"
        >
          ✅ บันทึกการเช็คชื่อ
        </button>
        {saved && (
          <div className="text-green-600 mt-2 text-sm">
            ✅ บันทึกเรียบร้อยแล้ว!
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
