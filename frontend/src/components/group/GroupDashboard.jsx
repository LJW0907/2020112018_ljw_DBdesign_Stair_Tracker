// frontend/src/components/group/GroupDashboard.jsx

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function GroupDashboard() {
  // URL에서 groupId를 가져옵니다
  const { groupId } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // 그룹의 기본 정보와 랭킹 데이터를 동시에 가져옵니다
        const [groupResponse, rankingsResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/groups/${groupId}`),
          axios.get(`http://localhost:3000/api/groups/${groupId}/rankings`),
        ]);

        setGroupData(groupResponse.data);
        setRankings(rankingsResponse.data.rankings);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching group data:", err);
        setError("그룹 데이터를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 그룹 헤더 섹션 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          {groupData.group_name}
        </h1>
        <div className="mt-2 text-sm text-gray-600">
          멤버 {groupData.member_count}명 · 이번 주 활동 멤버{" "}
          {rankings.group_stats?.active_users_this_week || 0}명
        </div>
      </div>

      {/* 이번 주 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-600">
            이번 주 총 층수
          </h3>
          <p className="text-3xl font-bold text-indigo-600">
            {rankings.group_stats?.total_stairs_this_week || 0}층
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-600">
            이번 주 총 포인트
          </h3>
          <p className="text-3xl font-bold text-indigo-600">
            {rankings.group_stats?.total_points_this_week || 0}P
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-600">활동률</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {Math.round(
              ((rankings.group_stats?.active_users_this_week || 0) /
                groupData.member_count) *
                100
            )}
            %
          </p>
        </div>
      </div>

      {/* 랭킹 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-6">주간 랭킹</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                순위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이번 주 층수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                획득 포인트
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rankings.map((user, index) => (
              <tr
                key={user.user_id}
                className={index < 3 ? "bg-indigo-50" : ""}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-800"
                        : index === 1
                        ? "bg-gray-100 text-gray-800"
                        : index === 2
                        ? "bg-orange-100 text-orange-800"
                        : "text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.weekly_stairs}층
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.weekly_points}P
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GroupDashboard;
