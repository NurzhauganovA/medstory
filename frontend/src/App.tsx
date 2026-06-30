import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { MedicalCardFormPage } from "./components/patients/MedicalCardFormPage";
import { PatientDetailPage } from "./components/patients/PatientDetailPage";
import { PatientsPage } from "./components/patients/PatientsPage";
import { UsersPage } from "./components/admin/UsersPage";
import { LoginPage } from "./components/auth/LoginPage";
import SchedulePage from "./pages/SchedulePage";
import { useAuth } from "./auth/AuthContext";
import { ROLE_LABELS } from "./auth/types";
import "./styles/global.css";

export type AppNavId = "schedule" | "patients" | "users";

type PatientsView =
  | { kind: "list" }
  | { kind: "detail"; patientId: number }
  | {
      kind: "visit";
      patientId: number;
      medicalCardId: number;
      patientName: string;
      startAtStep?: number;
    };

function TopBar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const initials = user.full_name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <header className="app-topbar">
      <div className="app-topbar__spacer" />
      <div className="app-topbar__user">
        <div className="app-topbar__avatar">{initials}</div>
        <div className="app-topbar__meta">
          <div className="app-topbar__name">{user.full_name}</div>
          <div className="app-topbar__role">{ROLE_LABELS[user.role]}</div>
        </div>
        <button type="button" className="app-topbar__logout" onClick={logout} title="Выйти">
          Выйти
        </button>
      </div>
    </header>
  );
}

function AppShell() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState<AppNavId>("patients");
  const [patientsView, setPatientsView] = useState<PatientsView>({ kind: "list" });
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

  const bumpDetailRefresh = () => setDetailRefreshKey((k) => k + 1);

  const handleNavChange = (navId: AppNavId) => {
    setActiveNav(navId);
    if (navId === "patients") {
      setPatientsView({ kind: "list" });
    }
  };

  const renderPatientsModule = () => {
    if (patientsView.kind === "visit") {
      return (
        <MedicalCardFormPage
          patientId={patientsView.patientId}
          patientName={patientsView.patientName}
          medicalCardId={patientsView.medicalCardId}
          startAtStep={patientsView.startAtStep}
          onClose={() => {
            bumpDetailRefresh();
            setPatientsView({ kind: "detail", patientId: patientsView.patientId });
          }}
          onSaved={() => {
            bumpDetailRefresh();
            setPatientsView({ kind: "detail", patientId: patientsView.patientId });
          }}
        />
      );
    }

    if (patientsView.kind === "detail") {
      return (
        <PatientDetailPage
          patientId={patientsView.patientId}
          refreshKey={detailRefreshKey}
          onBack={() => setPatientsView({ kind: "list" })}
          onStartVisit={(patientId, medicalCardId, patientName) =>
            setPatientsView({ kind: "visit", patientId, medicalCardId, patientName, startAtStep: 1 })
          }
          onContinueVisit={(patientId, medicalCardId, patientName) =>
            setPatientsView({ kind: "visit", patientId, medicalCardId, patientName })
          }
        />
      );
    }

    return (
      <PatientsPage
        onOpenPatient={(patientId) => setPatientsView({ kind: "detail", patientId })}
      />
    );
  };

  const renderContent = () => {
    if (activeNav === "users" && user?.role === "admin") return <UsersPage />;
    if (activeNav === "patients") return renderPatientsModule();
    return <SchedulePage embedded />;
  };

  return (
    <div className="app-layout">
      <Sidebar activeNav={activeNav} role={user?.role} onNavigate={handleNavChange} />
      <div className="app-main">
        <TopBar />
        {renderContent()}
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="app-loading">Загрузка…</div>;
  }
  if (!user) {
    return <LoginPage />;
  }
  return <AppShell />;
}
