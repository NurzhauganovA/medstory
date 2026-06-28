import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { MedicalCardFormPage } from "./components/patients/MedicalCardFormPage";
import { PatientDetailPage } from "./components/patients/PatientDetailPage";
import { PatientsPage } from "./components/patients/PatientsPage";
import SchedulePage from "./pages/SchedulePage";
import "./styles/global.css";

export type AppNavId = "schedule" | "patients";

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

export default function App() {
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

  return (
    <div className="app-layout">
      <Sidebar activeNav={activeNav} onNavigate={handleNavChange} />
      <div className="app-main">
        {activeNav === "patients" ? renderPatientsModule() : <SchedulePage embedded />}
      </div>
    </div>
  );
}
