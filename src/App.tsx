import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccessGate from "./components/AccessGate";
import { LedgerUIProvider } from "./context/LedgerUIContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Ledger from "./pages/Ledger";
import GPAPlanner from "./pages/GPAPlanner";
import PastPapers from "./pages/PastPapers";
import SkillRoadmap from "./pages/SkillRoadmap";

export default function App() {
  return (
    <AccessGate>
      <BrowserRouter>
        <LedgerUIProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="ledger" element={<Ledger />} />
              <Route path="gpa" element={<GPAPlanner />} />
              <Route path="past-papers" element={<PastPapers />} />
              <Route path="skill-roadmap" element={<SkillRoadmap />} />
            </Route>
          </Routes>
        </LedgerUIProvider>
      </BrowserRouter>
    </AccessGate>
  );
}
