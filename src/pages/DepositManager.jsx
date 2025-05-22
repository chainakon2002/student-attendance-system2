import React, { useEffect, useState } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { db } from '../firebase';
import { jsPDF } from 'jspdf';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 float-right font-bold"
        >
          ✕
        </button>
        <div className="clear-both">{children}</div>
      </div>
    </div>
  );
}

export default function DepositPage() {
  const [students, setStudents] = useState({});
  const [deposits, setDeposits] = useState({});
  const [studentTotals, setStudentTotals] = useState({});
  const [selectedStudentKey, setSelectedStudentKey] = useState(null);
  const [modalType, setModalType] = useState(null); // 'deposit' หรือ 'history'
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [historyList, setHistoryList] = useState([]);

  // โหลดนักเรียน
  useEffect(() => {
    const studentsRef = ref(db, 'students');
    onValue(studentsRef, (snapshot) => {
      setStudents(snapshot.val() || {});
    });
  }, []);

  // โหลดยอดฝากของนักเรียนทั้งหมด (ทุกคน)
  useEffect(() => {
    // สำหรับแต่ละนักเรียน โหลด deposits
    const depositsRef = ref(db, 'deposits');
    onValue(depositsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setDeposits(data);

      // คำนวณยอดรวมแต่ละคน
      const totals = {};
      Object.entries(data).forEach(([stuKey, records]) => {
        totals[stuKey] = Object.values(records).reduce(
          (sum, r) => sum + Number(r.amount || 0),
          0
        );
      });
      setStudentTotals(totals);
    });
  }, []);

  // โหลดประวัติฝากเงินเฉพาะนักเรียนที่เลือก
  useEffect(() => {
    if (!selectedStudentKey) {
      setHistoryList([]);
      return;
    }
    const studentDeposits = deposits[selectedStudentKey] || {};
    const list = Object.entries(studentDeposits)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setHistoryList(list);
  }, [selectedStudentKey, deposits]);

  const handleDeposit = () => {
    if (!selectedStudentKey) return alert('กรุณาเลือกนักเรียน');
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');

    const newDeposit = {
      amount: Number(amount),
      note: note.trim() || '-',
      date: new Date().toISOString().slice(0, 10),
    };

    push(ref(db, `deposits/${selectedStudentKey}`), newDeposit);
    setAmount('');
    setNote('');
    setModalType(null);
  };

  const handlePrintReceipt = (deposit) => {
    if (!deposit) return;
    const doc = new jsPDF();
    const student = students[selectedStudentKey] || {};

    doc.setFontSize(18);
    doc.text('ใบเสร็จรับเงิน', 105, 20, null, null, 'center');

    doc.setFontSize(12);
    doc.text(`ชื่อนักเรียน: ${student.name || '-'}`, 20, 40);
    doc.text(`ชั้น: ${student.grade || '-'}`, 20, 50);
    doc.text(`วันที่: ${deposit.date}`, 20, 60);
    doc.text(`จำนวนเงิน: ${deposit.amount} บาท`, 20, 70);
    doc.text(`หมายเหตุ: ${deposit.note}`, 20, 80);

    doc.text('ขอบคุณที่ใช้บริการ', 105, 100, null, null, 'center');
    doc.save(`receipt_${selectedStudentKey}_${deposit.date}.pdf`);
  };

  // แบ่งนักเรียนตามชั้นเรียน
  const studentsByGrade = Object.entries(students).reduce((acc, [key, s]) => {
    if (!acc[s.grade]) acc[s.grade] = [];
    acc[s.grade].push({ key, ...s });
    return acc;
  }, {});


  const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setIsVisible(true), 100); // รอ 100ms ก่อนโชว์
  return () => clearTimeout(timer);
}, []);

  return (
    <div
  className={`p-4 max-w-6xl mx-auto transition-opacity transition-transform duration-700 ease-out ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
  }`}
>

      <h1 className="text-3xl font-bold text-blue-600 mb-6">ฝากเงินนักเรียน</h1>

      {Object.keys(studentsByGrade).length === 0 && <p>ไม่มีข้อมูลนักเรียน</p>}

      {Object.entries(studentsByGrade).map(([grade, stuList]) => (
        <div key={grade} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">ชั้นเรียน {grade}</h2>
          <table className="w-full table-auto border-collapse border">
            <thead>
              <tr className="bg-blue-100">
                <th className="border px-3 py-2">ชื่อนักเรียน</th>
                <th className="border px-3 py-2">ชั้น</th>
                <th className="border px-3 py-2">ยอดสะสม (บาท)</th>
                <th className="border px-3 py-2">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {stuList.map(({ key, name, grade }) => (
                <tr key={key} className="hover:bg-blue-50">
                  <td className="border px-3 py-2">{name}</td>
                  <td className="border px-3 py-2 text-center">{grade}</td>
                  <td className="border px-3 py-2 text-center">
                    {studentTotals[key] || 0}
                  </td>
                  <td className="border px-3 py-2 text-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedStudentKey(key);
                        setModalType('deposit');
                        setAmount('');
                        setNote('');
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      ฝากเงิน
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudentKey(key);
                        setModalType('history');
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Modal ฝากเงิน */}
      <Modal
        isOpen={modalType === 'deposit' && selectedStudentKey}
        onClose={() => setModalType(null)}
      >
        <h3 className="text-xl font-semibold mb-4">
          ฝากเงิน: {students[selectedStudentKey]?.name} ({students[selectedStudentKey]?.grade})
        </h3>
        <input
          type="number"
          placeholder="จำนวนเงิน (บาท)"
          className="border p-2 rounded w-full mb-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="หมายเหตุ (ถ้ามี)"
          className="border p-2 rounded w-full mb-4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setModalType(null)}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleDeposit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ฝากเงิน
          </button>
        </div>
      </Modal>

      {/* Modal ดูประวัติฝากเงิน */}
      <Modal
        isOpen={modalType === 'history' && selectedStudentKey}
        onClose={() => setModalType(null)}
      >
        <h3 className="text-xl font-semibold mb-4">
          ประวัติฝากเงิน: {students[selectedStudentKey]?.name} ({students[selectedStudentKey]?.grade})
        </h3>
        {historyList.length === 0 ? (
          <p>ไม่มีประวัติการฝากเงิน</p>
        ) : (
          <table className="w-full table-auto border-collapse border">
            <thead>
              <tr className="bg-blue-100">
                <th className="border px-2 py-1">วันที่</th>
                <th className="border px-2 py-1">จำนวนเงิน (บาท)</th>
                <th className="border px-2 py-1">หมายเหตุ</th>
                <th className="border px-2 py-1">พิมพ์ใบเสร็จ</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((dep) => (
                <tr
                  key={dep.id}
                  className="hover:bg-blue-50 cursor-pointer"
                >
                  <td className="border px-2 py-1">{dep.date}</td>
                  <td className="border px-2 py-1">{dep.amount}</td>
                  <td className="border px-2 py-1">{dep.note}</td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => handlePrintReceipt(dep)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      พิมพ์
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
}
