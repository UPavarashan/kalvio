import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccessGate from "./components/AccessGate";
import AuthGate from "./components/AuthGate";
import ConfigError from "./components/ConfigError";
import { AuthProvider } from "./context/AuthContext";
import { LedgerUIProvider } from "./context/LedgerUIContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Ledger from "./pages/Ledger";
import GPAPlanner from "./pages/GPAPlanner";
import PastPapers from "./pages/PastPapers";
import SkillRoadmap from "./pages/SkillRoadmap";
import { getConfigErrorMessage } from "./config/env";

export default function App() {
  const configError = getConfigErrorMessage();
  if (configError) {
    return <ConfigError message={configError} />;
  }

  return (
    <AccessGate>
      <AuthProvider>
        <AuthGate>
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
        </AuthGate>
      </AuthProvider>
    </AccessGate>
  );
}
