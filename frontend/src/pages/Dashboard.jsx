import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  // 대시보드의 주요 통계 데이터를 관리하는 상태
  const [stats, setStats] = useState({
    todayStairs: 0,
    totalPoints: 0,
    weeklyStats: [],
    groupRank: null,
  });

  // 계단 사용 기록을 위한 폼 데이터 상태
  const [formData, setFormData] = useState({
    building_id: "",
    floors_climbed: "",
  });

  // 건물 목록을 관리하는 상태
  const [buildings, setBuildings] = useState([]);

  // 사용자 피드백을 위한 상태
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  // localStorage에서 사용자 정보 가져오기
  const user = JSON.parse(localStorage.getItem("user"));

  // 건물 목록을 가져오는 useEffect
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/buildings");
        setBuildings(response.data);
      } catch (error) {
        console.error("Error fetching buildings:", error);
        setSubmitStatus({
          type: "error",
          message: "건물 목록을 불러오는데 실패했습니다.",
        });
      }
    };

    fetchBuildings();
  }, []);

  // 대시보드 데이터를 가져오는 useEffect
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stairsResponse = await axios.get(
          `http://localhost:3000/api/stair-usage/user/${user.user_id}`
        );
        const pointsResponse = await axios.get(
          `http://localhost:3000/api/points/total/${user.user_id}`
        );

        console.log("Stairs Response:", stairsResponse.data); // 디버깅용

        setStats({
          todayStairs: stairsResponse.data.today || 0,
          totalPoints: pointsResponse.data.total_points || 0,
          weeklyStats: stairsResponse.data.records || [],
          groupRank: null,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [user.user_id]);

  // 폼 입력 값 변경 핸들러
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 계단 사용 기록 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "" });

    if (!formData.building_id || !formData.floors_climbed) {
      setSubmitStatus({ type: "error", message: "모든 필드를 입력해주세요." });
      return;
    }

    try {
      // 계단 사용 기록 저장
      await axios.post("http://localhost:3000/api/stair-usage", {
        user_id: user.user_id,
        building_id: parseInt(formData.building_id),
        floors_climbed: parseInt(formData.floors_climbed),
      });

      // 폼 초기화
      setFormData({
        building_id: "",
        floors_climbed: "",
      });

      // 대시보드 데이터 새로고침
      const stairsResponse = await axios.get(
        `http://localhost:3000/api/stair-usage/user/${user.user_id}`
      );
      const pointsResponse = await axios.get(
        `http://localhost:3000/api/points/total/${user.user_id}`
      );

      setStats({
        todayStairs: stairsResponse.data.today || 0,
        totalPoints: pointsResponse.data.total_points || 0,
        weeklyStats: stairsResponse.data.weekly || [],
        groupRank: null,
      });

      setSubmitStatus({
        type: "success",
        message: "기록이 성공적으로 저장되었습니다!",
      });
    } catch (error) {
      console.error("Error submitting stair usage:", error);
      setSubmitStatus({ type: "error", message: "기록 저장에 실패했습니다." });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">안녕하세요, {user.username}님!</h1>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-semibold text-gray-600">오늘의 계단</h2>
          <p className="text-3xl font-bold">{stats.todayStairs}층</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-semibold text-gray-600">보유 포인트</h2>
          <p className="text-3xl font-bold">{stats.totalPoints}P</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-semibold text-gray-600">
            주간 목표 달성률
          </h2>
          <p className="text-3xl font-bold">75%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-semibold text-gray-600">그룹 순위</h2>
          <p className="text-3xl font-bold">{stats.groupRank || "-"}</p>
        </div>
      </div>

      {/* 빠른 기록 입력 섹션 */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">빠른 기록</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <select
              name="building_id"
              value={formData.building_id}
              onChange={handleInputChange}
              className="flex-1 rounded-md border border-gray-300 p-2"
              required
            >
              <option value="">건물 선택</option>
              {buildings.map((building) => (
                <option key={building.building_id} value={building.building_id}>
                  {building.building_name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="floors_climbed"
              value={formData.floors_climbed}
              onChange={handleInputChange}
              placeholder="층수 입력"
              className="flex-1 rounded-md border border-gray-300 p-2"
              min="1"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              기록하기
            </button>
          </div>
          {submitStatus.message && (
            <div
              className={`mt-2 p-2 rounded ${
                submitStatus.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {submitStatus.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
