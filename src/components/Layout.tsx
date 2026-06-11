import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-52 p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
