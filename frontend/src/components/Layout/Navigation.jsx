import { NavLink } from "react-router-dom";

function Navigation() {
  const navItems = [
    { path: "/dashboard", label: "대시보드" },
    { path: "/stairs", label: "계단 이용" },
    { path: "/points", label: "포인트/보상" },
    { path: "/groups", label: "그룹" },
  ];

  return (
    <nav className="w-64 min-h-screen bg-white border-r">
      <div className="p-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-indigo-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
