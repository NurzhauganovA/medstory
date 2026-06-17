export interface Patient {
  id: number;
  iin: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  created_at: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  appointment_date: string;
  responsible: string | null;
  source: string | null;
  appointment_type: string | null;
  specialist: string | null;
  service: string | null;
  budget: string | null;
  created_at: string;
  patient?: Patient;
}

export interface PainBlock {
  is_present: boolean | null;
  duration: string | null;
  intensity: string | null;
  localization: string[];
  character: string[];
  frequency: string[];
  provokes: string[];
  provokes_other: string | null;
  relieves: string[];
  relieves_other: string | null;
}

export interface VitaeBlock {
  dispensary_registration: string | null;
  doctors_contacts: string | null;
  blood_type: string | null;
  concomitant_diseases: string | null;
  past_traumas_surgeries: string | null;
  preventive_measures: string | null;
  anthropometry: string | null;
  allergies: string | null;
  bad_habits: string | null;
}

export interface AnamnesisBlock {
  patient_words: string | null;
  onset_reason: string | null;
  onset_association: string | null;
  last_exacerbation: string | null;
  exacerbation_reason: string | null;
  pain: PainBlock;
  numbness: string[];
  current_state: string[];
  previous_treatment: string[];
  vitae: VitaeBlock;
}

export interface PassportBlock {
  iin: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  visit_date: string | null;
  branch: string | null;
  gender: string | null;
  age: number | null;
  nationality: string | null;
  residence: string | null;
  citizenship: string | null;
  address: string | null;
  workplace: string | null;
  position: string | null;
  education: string | null;
  insurance_company: string | null;
  insurance_type: string | null;
  social_status: string | null;
  visit_reason: string | null;
  doctor_name: string | null;
  nurse_name: string | null;
  coordinator_name: string | null;
  primary_visit_date: string | null;
  course_end_date: string | null;
}

export interface AdditionalTest {
  muscle_joint: string | null;
  test_value: string | null;
}

export interface DiagnosticsBlock {
  hypertonus: string[];
  hypotonus: string[];
  rigidity: string[];
  lasseg_right: string | null;
  lasseg_left: string | null;
  lerrey_test: string | null;
  other_spine_tests: string | null;
  knee_flexion_left: string | null;
  knee_flexion_right: string | null;
  knee_extension_left: string | null;
  knee_extension_right: string | null;
  hip_flexion: string | null;
  hip_ext_rotation: string | null;
  hip_int_rotation: string | null;
  hip_adduction: string | null;
  hip_abduction: string | null;
  shoulder_abduction: string | null;
  shoulder_flexion: string | null;
  shoulder_extension: string | null;
  shoulder_supination: string | null;
  shoulder_pronation: string | null;
  shoulder_horiz_adduction: string | null;
  shoulder_horiz_abduction: string | null;
  additional_tests: AdditionalTest[];
  walking_pattern: string | null;
  pain_vas: number | null;
  quality_of_life: number | null;
}

export interface Icd10Entry {
  code: string | null;
  description: string | null;
}

export interface MriSegment {
  segment_name: string | null;
  size_mm: string | null;
}

export interface MriBlock {
  hernia_type: string | null;
  segments: MriSegment[];
  is_ligamentous: boolean | null;
  sequestration: string | null;
  location: string | null;
  chronicity: string | null;
  bulging: string | null;
  modic: string | null;
  osteophytes: string | null;
  kpp: string | null;
  schmorl: string | null;
  hemangiomas: string | null;
}

export interface DiagnosisBlock {
  icd10_list: Icd10Entry[];
  full_description: string | null;
  mri: MriBlock;
  concomitant: string | null;
}

export interface InjectionEntry {
  inj_date: string | null;
  drug_id: number | null;
  drug_name: string | null;
}

export interface MedicationEntry {
  drug_id: number | null;
  drug_name: string | null;
  regimen: string | null;
}

export interface TreatmentBlock {
  course_type: string | null;
  coordinator: string | null;
  procedures: string[];
  injections: InjectionEntry[];
  medications: MedicationEntry[];
  recommendations: string[];
  lfk_per_week: string | null;
  walking_steps: string | null;
  additional_recs: string | null;
  next_mri_date: string | null;
}

export interface MedicalCardData {
  passport: PassportBlock;
  anamnesis: AnamnesisBlock;
  instrumental_studies: string | null;
  diagnostics: DiagnosticsBlock;
  diagnosis: DiagnosisBlock;
  treatment: TreatmentBlock;
}

export interface MedicalCard {
  id: number;
  patient_id: number;
  appointment_id: number | null;
  card_number: string | null;
  status: string;
  current_step: number;
  data: MedicalCardData;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface FormStep {
  step: number;
  key: string;
  title: string;
  page_label: string;
}

export interface FormSchema {
  steps: FormStep[];
  options: Record<string, string[]>;
}

export function emptyCardData(): MedicalCardData {
  return {
    passport: {
      iin: null,
      full_name: null,
      phone: null,
      email: null,
      birth_date: null,
      visit_date: null,
      branch: null,
      gender: null,
      age: null,
      nationality: null,
      residence: null,
      citizenship: null,
      address: null,
      workplace: null,
      position: null,
      education: null,
      insurance_company: null,
      insurance_type: null,
      social_status: null,
      visit_reason: null,
      doctor_name: null,
      nurse_name: null,
      coordinator_name: null,
      primary_visit_date: null,
      course_end_date: null,
    },
    anamnesis: {
      patient_words: null,
      onset_reason: null,
      onset_association: null,
      last_exacerbation: null,
      exacerbation_reason: null,
      pain: {
        is_present: null,
        duration: null,
        intensity: null,
        localization: [],
        character: [],
        frequency: [],
        provokes: [],
        provokes_other: null,
        relieves: [],
        relieves_other: null,
      },
      numbness: [],
      current_state: [],
      previous_treatment: [],
      vitae: {
        dispensary_registration: null,
        doctors_contacts: null,
        blood_type: null,
        concomitant_diseases: null,
        past_traumas_surgeries: null,
        preventive_measures: null,
        anthropometry: null,
        allergies: null,
        bad_habits: null,
      },
    },
    instrumental_studies: null,
    diagnostics: {
      hypertonus: [],
      hypotonus: [],
      rigidity: [],
      lasseg_right: null,
      lasseg_left: null,
      lerrey_test: null,
      other_spine_tests: null,
      knee_flexion_left: null,
      knee_flexion_right: null,
      knee_extension_left: null,
      knee_extension_right: null,
      hip_flexion: null,
      hip_ext_rotation: null,
      hip_int_rotation: null,
      hip_adduction: null,
      hip_abduction: null,
      shoulder_abduction: null,
      shoulder_flexion: null,
      shoulder_extension: null,
      shoulder_supination: null,
      shoulder_pronation: null,
      shoulder_horiz_adduction: null,
      shoulder_horiz_abduction: null,
      additional_tests: [],
      walking_pattern: null,
      pain_vas: null,
      quality_of_life: null,
    },
    diagnosis: {
      icd10_list: [],
      full_description: null,
      mri: {
        hernia_type: null,
        segments: [],
        is_ligamentous: null,
        sequestration: null,
        location: null,
        chronicity: null,
        bulging: null,
        modic: null,
        osteophytes: null,
        kpp: null,
        schmorl: null,
        hemangiomas: null,
      },
      concomitant: null,
    },
    treatment: {
      course_type: null,
      coordinator: null,
      procedures: [],
      injections: [],
      medications: [],
      recommendations: [],
      lfk_per_week: null,
      walking_steps: null,
      additional_recs: null,
      next_mri_date: null,
    },
  };
}

export function stepDataKey(step: number): keyof MedicalCardData | null {
  switch (step) {
    case 1:
      return null;
    case 2:
      return "anamnesis";
    case 3:
      return "diagnostics";
    case 4:
      return "diagnosis";
    case 5:
      return "treatment";
    default:
      return null;
  }
}

export function buildStepPayload(step: number, data: MedicalCardData): Record<string, unknown> {
  switch (step) {
    case 1:
      return {
        passport: data.passport,
        anamnesis: {
          patient_words: data.anamnesis.patient_words,
          pain: data.anamnesis.pain,
          numbness: data.anamnesis.numbness,
        },
      };
    case 2:
      return {
        anamnesis: {
          onset_reason: data.anamnesis.onset_reason,
          onset_association: data.anamnesis.onset_association,
          last_exacerbation: data.anamnesis.last_exacerbation,
          exacerbation_reason: data.anamnesis.exacerbation_reason,
          current_state: data.anamnesis.current_state,
          previous_treatment: data.anamnesis.previous_treatment,
          vitae: data.anamnesis.vitae,
        },
        instrumental_studies: data.instrumental_studies,
      };
    case 3:
      return { diagnostics: data.diagnostics };
    case 4:
      return { diagnosis: data.diagnosis };
    case 5:
      return { treatment: data.treatment };
    default:
      return {};
  }
}
