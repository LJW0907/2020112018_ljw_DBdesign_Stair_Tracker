import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div
          className="text-2xl font-bold text-indigo-600 cursor-pointer hover:text-indigo-700"
          onClick={() => navigate("/dashboard")}
        >
          Stair Tracker
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-gray-700">
            포인트: <span className="font-bold text-indigo-600">1000</span>
            포인트
          </span>
          <span className="text-gray-700">{user?.username || "사용자"}</span>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
