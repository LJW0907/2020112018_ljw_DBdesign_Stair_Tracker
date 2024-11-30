import { useState, useEffect } from "react";
import axios from "axios";

function StairUsage() {
  const [records, setRecords] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 사용자의 계단 이용 기록 조회
        const recordsResponse = await axios.get(
          `http://localhost:3000/api/stair-usage/user/${user.user_id}`
        );
        setRecords(recordsResponse.data);

        // 건물 목록 조회
        const buildingsResponse = await axios.get(
          "http://localhost:3000/api/buildings"
        );
        setBuildings(buildingsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user.user_id]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">계단 이용 기록</h1>
      </div>

      {/* 기록 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                날짜
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                건물
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                올라간 층수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                획득 포인트
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.usage_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(record.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.building_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.floors_climbed}층
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.floors_climbed * 10}P
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-4">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            이전
          </button>
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            1
          </button>
          <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            다음
          </button>
        </nav>
      </div>
    </div>
  );
}

export default StairUsage;
