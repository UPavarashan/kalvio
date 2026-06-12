import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

export default function Layout() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <TopNav />
      <main className="px-3 py-4 sm:px-4 md:p-6 max-w-7xl w-full mx-auto min-w-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  );
}
