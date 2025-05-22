import React, { useEffect, useState } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { Dialog } from '@headlessui/react';
import { Edit3, Trash2 } from "lucide-react";

export default function StudentManager() {
  const [students, setStudents] = useState({});
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [editKey, setEditKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const studentsRef = ref(db, 'students');
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setStudents(data);
    });
  }, []);

  const openModal = (student = null, key = null) => {
    if (student) {
      setStudentId(student.studentId);
      setName(student.name);
      setGrade(student.grade);
      setEditKey(key);
    } else {
      setStudentId('');
      setName('');
      setGrade('');
      setEditKey(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStudentId('');
    setName('');
    setGrade('');
    setEditKey(null);
  };

  const handleAddOrUpdate = () => {
    if (!studentId.trim() || !name.trim() || !grade.trim()) return alert('กรุณากรอกข้อมูลให้ครบ');

    const studentData = {
      studentId: studentId.trim(),
      name: name.trim(),
      grade: grade.trim(),
    };

    if (editKey) {
      update(ref(db, `students/${editKey}`), studentData);
    } else {
      push(ref(db, 'students'), studentData);
    }

    closeModal();
  };

  const handleDelete = (key) => {
    if (window.confirm('ต้องการลบชื่อนักเรียนนี้ใช่หรือไม่?')) {
      remove(ref(db, `students/${key}`));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-600">จัดการนักเรียน</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 "
        >
          เพิ่มนักเรียน
        </button>
      </div>

      <div className="space-y-6 mt-4">
        {Object.entries(
          Object.groupBy(Object.entries(students), ([_, s]) => s.grade || 'ไม่ระบุ')
        ).map(([grade, studentList]) => (
          <div key={grade}>
            <h2 className="text-lg font-semibold text-blue-500 mb-2">ชั้น {grade}</h2>
            <div className="space-y-2">
              {studentList.map(([key, student]) => (
                <div key={key} className="flex justify-between items-center border p-2 rounded-2xl">
                  <span>{student.studentId} - {student.name} ({student.grade})</span>
                <div className="space-x-2">
                        <button
                          onClick={() => openModal(student, key)}
                          className="p-2 bg-yellow-400 text-white rounded-2xl hover:bg-yellow-500"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(key)}
                          className="p-2 bg-red-500 text-white rounded-2xl hover:bg-red-600"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl">
            <Dialog.Title className="text-xl font-bold mb-4">{editKey ? 'แก้ไขนักเรียน' : 'เพิ่มนักเรียน'}</Dialog.Title>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="รหัสนักเรียน"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="ชื่อนักเรียน"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    <option value="">-- เลือกชั้นเรียน --</option>
                    <option value="ป.1">ป.1</option>
                    <option value="ป.2">ป.2</option>
                    <option value="ป.3">ป.3</option>
                    <option value="ป.4">ป.4</option>
                    <option value="ป.5">ป.5</option>
                    <option value="ป.6">ป.6</option>
                </select>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={closeModal}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleAddOrUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editKey ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
