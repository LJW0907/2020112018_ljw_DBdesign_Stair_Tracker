import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/points/total/${user.user_id}`
        );
        setTotalPoints(response.data.total_points);
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    };

    fetchPoints();
  }, [user.user_id]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div
          className="text-2xl font-bold text-indigo-600 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Stair Tracker
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-gray-700">
            포인트:{" "}
            <span className="font-bold text-indigo-600">{totalPoints}</span>
          </span>
          <span className="text-gray-700">{user?.username}</span>
          <button
            onClick={handleLogout}
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
