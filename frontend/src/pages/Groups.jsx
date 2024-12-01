import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Groups() {
  const [myGroups, setMyGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const [myGroupsResponse, allGroupsResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/groups/user/${user.user_id}`),
          axios.get("http://localhost:3000/api/groups/available"),
        ]);

        setMyGroups(myGroupsResponse.data);
        setAvailableGroups(
          allGroupsResponse.data.filter(
            (group) =>
              !myGroupsResponse.data.some(
                (myGroup) => myGroup.group_id === group.group_id
              )
          )
        );
      } catch (error) {
        console.error("Error fetching groups:", error);
        setFeedback({
          type: "error",
          message: "그룹 정보를 불러오는데 실패했습니다.",
        });
      }
    };

    fetchGroups();
  }, [user.user_id]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setFeedback({ type: "error", message: "그룹 이름을 입력해주세요." });
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/groups", {
        group_name: newGroupName,
        created_by: user.user_id,
      });

      setNewGroupName("");
      setFeedback({ type: "success", message: "그룹이 생성되었습니다!" });

      const [myGroupsResponse, allGroupsResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/groups/user/${user.user_id}`),
        axios.get("http://localhost:3000/api/groups/available"),
      ]);

      setMyGroups(myGroupsResponse.data);
      setAvailableGroups(
        allGroupsResponse.data.filter(
          (group) =>
            !myGroupsResponse.data.some(
              (myGroup) => myGroup.group_id === group.group_id
            )
        )
      );
    } catch (error) {
      console.error("Error creating group:", error);
      setFeedback({ type: "error", message: "그룹 생성에 실패했습니다." });
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post("http://localhost:3000/api/groups/join", {
        user_id: user.user_id,
        group_id: groupId,
      });

      setFeedback({ type: "success", message: "그룹에 참여했습니다!" });

      const [myGroupsResponse, allGroupsResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/groups/user/${user.user_id}`),
        axios.get("http://localhost:3000/api/groups/available"),
      ]);

      setMyGroups(myGroupsResponse.data);
      setAvailableGroups(
        allGroupsResponse.data.filter(
          (group) =>
            !myGroupsResponse.data.some(
              (myGroup) => myGroup.group_id === group.group_id
            )
        )
      );
    } catch (error) {
      console.error("Error joining group:", error);
      setFeedback({ type: "error", message: "그룹 참여에 실패했습니다." });
    }
  };

  return (
    <div className="space-y-6">
      {/* 그룹 생성 섹션 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">새 그룹 만들기</h2>
        <form onSubmit={handleCreateGroup} className="flex gap-4">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="그룹 이름 입력"
            className="flex-1 rounded-md border border-gray-300 px-4 py-2"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            그룹 만들기
          </button>
        </form>
        {feedback.message && (
          <div
            className={`mt-2 p-2 rounded ${
              feedback.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      {/* 내 그룹 목록 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">내 그룹</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myGroups.map((group) => (
            <div key={group.group_id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{group.group_name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>멤버: {group.member_count || 0}명</p>
                <p>내 순위: {group.my_rank || "-"}</p>
              </div>
              <button
                onClick={() => navigate(`/groups/${group.group_id}`)}
                className="mt-2 text-indigo-600 hover:text-indigo-800"
              >
                상세보기
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 참여 가능한 그룹 목록 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">참여 가능한 그룹</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableGroups.map((group) => (
            <div key={group.group_id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{group.group_name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>멤버: {group.member_count || 0}명</p>
              </div>
              <button
                onClick={() => handleJoinGroup(group.group_id)}
                className="mt-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-200"
              >
                참여하기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Groups;
