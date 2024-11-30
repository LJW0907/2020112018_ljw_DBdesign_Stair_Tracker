import { Outlet } from "react-router-dom";
import Header from "./Header";
import Navigation from "./Navigation";

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Navigation />
        <main className="flex-1 bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
