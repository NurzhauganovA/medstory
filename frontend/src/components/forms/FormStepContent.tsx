import type { FormSchema, MedicalCardData } from "../../types";
import { PatientDataForm } from "./PatientDataForm";
import { Step1PassportPage } from "./steps/Step1PassportPage";
import { Step2ComplaintsPage } from "./steps/Step2ComplaintsPage";
import { Step3DiagnosticsPage } from "./steps/Step3DiagnosticsPage";
import { Step4DiagnosisPage } from "./steps/Step4DiagnosisPage";
import { Step5TreatmentPage } from "./steps/Step5TreatmentPage";

interface FormStepContentProps {
  step: number;
  mode: "create" | "edit";
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
  onPersistStep?: (data: MedicalCardData) => Promise<void>;
}

export function FormStepContent({ step, mode, data, options, onChange, onPersistStep }: FormStepContentProps) {
  if (mode === "create") {
    return <PatientDataForm data={data} options={options} onChange={onChange} />;
  }

  const props = { data, options, onChange, onPersistStep };

  switch (step) {
    case 1:
      return <Step1PassportPage {...props} />;
    case 2:
      return <Step2ComplaintsPage {...props} />;
    case 3:
      return <Step3DiagnosticsPage {...props} />;
    case 4:
      return <Step4DiagnosisPage {...props} />;
    case 5:
      return <Step5TreatmentPage {...props} />;
    default:
      return null;
  }
}
