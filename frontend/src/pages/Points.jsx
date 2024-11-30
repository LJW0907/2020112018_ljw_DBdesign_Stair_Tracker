import { useState, useEffect } from "react";
import axios from "axios";

function Points() {
  // 사용자의 포인트 정보와 보상 목록을 관리하는 상태
  const [userPoints, setUserPoints] = useState({
    total: 0,
    history: [],
  });
  const [rewards, setRewards] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 포인트 총액과 이력을 가져옵니다
        const [pointsTotal, pointsHistory, rewardsData] = await Promise.all([
          axios.get(`http://localhost:3000/api/points/total/${user.user_id}`),
          axios.get(`http://localhost:3000/api/points/history/${user.user_id}`),
          axios.get("http://localhost:3000/api/rewards/available"),
        ]);

        setUserPoints({
          total: pointsTotal.data.total_points,
          history: pointsHistory.data,
        });
        setRewards(rewardsData.data);
      } catch (error) {
        console.error("Error fetching points data:", error);
      }
    };

    fetchData();
  }, [user.user_id]);

  // 보상 교환 처리 함수
  const handleClaimReward = async (rewardId, pointsRequired) => {
    if (userPoints.total < pointsRequired) {
      alert("포인트가 부족합니다!");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/rewards/claim", {
        user_id: user.user_id,
        reward_id: rewardId,
      });

      // 성공적으로 교환 후 데이터 새로고침
      const [pointsTotal, pointsHistory] = await Promise.all([
        axios.get(`http://localhost:3000/api/points/total/${user.user_id}`),
        axios.get(`http://localhost:3000/api/points/history/${user.user_id}`),
      ]);

      setUserPoints({
        total: pointsTotal.data.total_points,
        history: pointsHistory.data,
      });

      alert("보상이 성공적으로 교환되었습니다!");
    } catch (error) {
      alert("보상 교환 중 오류가 발생했습니다.");
      console.error("Error claiming reward:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 포인트 요약 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">나의 포인트</h2>
        <div className="text-3xl font-bold text-indigo-600">
          {userPoints.total.toLocaleString()}P
        </div>
      </div>

      {/* 보상 목록 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">사용 가능한 보상</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div key={reward.reward_id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{reward.reward_name}</h3>
              <p className="text-gray-600 text-sm mb-2">{reward.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-indigo-600 font-semibold">
                  {reward.points_required}P
                </span>
                <button
                  onClick={() =>
                    handleClaimReward(reward.reward_id, reward.points_required)
                  }
                  className={`px-4 py-2 rounded-md ${
                    userPoints.total >= reward.points_required
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={userPoints.total < reward.points_required}
                >
                  교환하기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 포인트 이력 섹션 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 pb-0">포인트 이력</h2>
        <div className="mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  내용
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  포인트
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userPoints.history.map((record) => (
                <tr key={record.point_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{record.reason}</td>
                  <td
                    className={`px-6 py-4 ${
                      record.points >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {record.points >= 0 ? "+" : ""}
                    {record.points}P
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Points;
