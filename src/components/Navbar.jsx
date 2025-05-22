import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-white text-2xl font-bold tracking-wide hover:scale-105 transform transition duration-300"
        >
          ระบบการศึกษา
        </Link>

        <div className="space-x-6 flex items-center">
          <NavLinkItem to="/" label="หน้าหลัก" />
          <NavLinkItem to="/students" label="จัดการนักเรียน" />
          <NavLinkItem to="/history" label="ประวัติการเรียน" />
        </div>
      </div>
    </nav>
  );
};

// ✅ แยกเป็นคอมโพเนนต์ย่อยเพื่อให้ใส่อนิเมชันเหมือนกันหมด
const NavLinkItem = ({ to, label }) => (
  <Link
    to={to}
    className="text-white relative group font-medium transition duration-300"
  >
    <span className="group-hover:text-blue-100 transition duration-300">{label}</span>
    <span
      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"
    ></span>
  </Link>
);

export default Navbar;
