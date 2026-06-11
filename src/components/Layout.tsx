import { Outlet } from "react-router-dom";
import MobileHeader from "./MobileHeader";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Sidebar />
      <MobileHeader />
      <main className="md:ml-52 px-4 py-4 pb-[max(5.5rem,calc(4.5rem+env(safe-area-inset-bottom)))] md:p-6 md:pb-6 max-w-7xl mx-auto min-w-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
