export interface Patient {
  id: number;
  iin: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  gender: string | null;
  residence: string | null;
  workplace: string | null;
  insurance_company: string | null;
  created_at: string;
}

export type PatientListItem = Patient;

export interface PatientListResponse {
  items: PatientListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PatientVisitItem {
  id: number;
  medical_card_id: number | null;
  visit_date: string | null;
  status: string;
  doctor_name: string | null;
  diagnosis: string | null;
  pain_vas: number | null;
}

export interface PatientDetailResponse {
  patient: PatientListItem;
  latest_card_id: number | null;
  latest_card_step: number;
  active_card_id: number | null;
  visits: PatientVisitItem[];
}

export function emptyPathologyRow(): PathologyRow {
  return {
    hernia_type: null,
    segment_name: null,
    size_mm: null,
    sequestration: null,
    location: null,
    bulging: null,
    modic: null,
  };
}

export function getPathologyRows(diagnosis: DiagnosisBlock): PathologyRow[] {
  if (diagnosis.pathology_rows?.length) {
    return diagnosis.pathology_rows;
  }
  const mri = diagnosis.mri;
  const hasData =
    mri.hernia_type ||
    mri.sequestration ||
    mri.location ||
    mri.bulging ||
    mri.modic ||
    mri.segments.length > 0;
  if (!hasData) return [];
  return [
    {
      hernia_type: mri.hernia_type,
      segment_name: mri.segments[0]?.segment_name ?? null,
      size_mm: mri.segments[0]?.size_mm ?? null,
      sequestration: mri.sequestration,
      location: mri.location,
      bulging: mri.bulging,
      modic: mri.modic,
    },
  ];
}

export function syncMriFromPathologyRows(rows: PathologyRow[]): Partial<MriBlock> {
  const first = rows[0];
  if (!first) {
    return { segments: [] };
  }
  return {
    hernia_type: first.hernia_type,
    sequestration: first.sequestration,
    location: first.location,
    bulging: first.bulging,
    modic: first.modic,
    segments: first.segment_name || first.size_mm
      ? [{ segment_name: first.segment_name, size_mm: first.size_mm }]
      : [],
  };
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

export interface Icd10Item {
  code: string;
  name: string;
}

export interface Icd10SearchResponse {
  query: string;
  count: number;
  results: Icd10Item[];
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

export interface PathologyRow {
  hernia_type: string | null;
  segment_name: string | null;
  size_mm: string | null;
  sequestration: string | null;
  location: string | null;
  bulging: string | null;
  modic: string | null;
}

export type BodyMapView = "front" | "back";
export type BodyMapTool = "diamond" | "circle" | "link" | "grid" | "arrow";

export interface BodyMapProcedure {
  id: string;
  procedure_name: string;
  procedure_date: string | null;
  dose: string | null;
  drug_name: string | null;
  notes: string | null;
}

export interface BodyMapMarker {
  id: string;
  view: BodyMapView;
  tool: BodyMapTool;
  x: number;
  y: number;
  description: string | null;
  procedures: BodyMapProcedure[];
}

export interface DiagnosisBlock {
  icd10_list: Icd10Entry[];
  full_description: string | null;
  mri: MriBlock;
  pathology_rows: PathologyRow[];
  body_map_markers: BodyMapMarker[];
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

export interface TreatmentProcedure {
  id: string;
  name: string;
  date: string | null;
  dose: string | null;
  drug_name: string | null;
}

export interface TreatmentCourse {
  id: string;
  number: number;
  course_type: string | null;
  coordinator: string | null;
  start_date: string | null;
  end_date: string | null;
  next_mri_date: string | null;
  procedures: TreatmentProcedure[];
  recommendations: string[];
  lfk_per_week: string | null;
  walking_steps: string | null;
  additional_recs: string | null;
}

export interface TreatmentBlock {
  courses: TreatmentCourse[];
  active_course_id: string | null;
  /** @deprecated синхронизируется с активным курсом */
  course_type: string | null;
  coordinator: string | null;
  procedures: TreatmentProcedure[];
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
      pathology_rows: [],
      body_map_markers: [],
    },
    treatment: {
      courses: [],
      active_course_id: null,
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

export function newEntryId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeTreatmentProcedures(raw: unknown): TreatmentProcedure[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") {
      return {
        id: newEntryId("tp"),
        name: item,
        date: null,
        dose: null,
        drug_name: null,
      };
    }
    const row = item as Partial<TreatmentProcedure>;
    return {
      id: row.id ?? newEntryId("tp"),
      name: row.name ?? "",
      date: row.date ?? null,
      dose: row.dose ?? null,
      drug_name: row.drug_name ?? null,
    };
  });
}

export function normalizeBodyMapMarker(marker: BodyMapMarker): BodyMapMarker {
  return {
    ...marker,
    procedures: Array.isArray(marker.procedures) ? marker.procedures : [],
  };
}

export function normalizeBodyMapMarkers(markers: BodyMapMarker[] | undefined): BodyMapMarker[] {
  return (markers ?? []).map(normalizeBodyMapMarker);
}

export function emptyTreatmentCourse(number: number, courseType: string | null = null): TreatmentCourse {
  return {
    id: newEntryId("tc"),
    number,
    course_type: courseType,
    coordinator: null,
    start_date: null,
    end_date: null,
    next_mri_date: null,
    procedures: [],
    recommendations: [],
    lfk_per_week: null,
    walking_steps: null,
    additional_recs: null,
  };
}

export function defaultCourseType(number: number, courseTypes: string[]): string | null {
  const byNumber = courseTypes.find((t) => t.includes(`№ ${number}`));
  if (byNumber) return byNumber;
  if (number >= 3 && courseTypes.includes("ПОВТОРНЫЙ КУРС")) return "ПОВТОРНЫЙ КУРС";
  return courseTypes[number - 1] ?? courseTypes[0] ?? null;
}

export function normalizeTreatmentCourse(course: TreatmentCourse, index: number): TreatmentCourse {
  return {
    ...course,
    number: course.number || index + 1,
    procedures: normalizeTreatmentProcedures(course.procedures),
    recommendations: course.recommendations ?? [],
  };
}

export function normalizeTreatment(treatment: TreatmentBlock): TreatmentBlock {
  if (treatment.courses?.length) {
    const courses = treatment.courses.map(normalizeTreatmentCourse);
    const activeId =
      treatment.active_course_id && courses.some((c) => c.id === treatment.active_course_id)
        ? treatment.active_course_id
        : courses[courses.length - 1].id;
    return { ...treatment, courses, active_course_id: activeId };
  }

  const legacy = emptyTreatmentCourse(1, treatment.course_type);
  legacy.coordinator = treatment.coordinator;
  legacy.next_mri_date = treatment.next_mri_date;
  legacy.procedures = normalizeTreatmentProcedures(treatment.procedures);
  legacy.recommendations = treatment.recommendations ?? [];
  legacy.lfk_per_week = treatment.lfk_per_week;
  legacy.walking_steps = treatment.walking_steps;
  legacy.additional_recs = treatment.additional_recs;

  return {
    ...treatment,
    courses: [legacy],
    active_course_id: legacy.id,
  };
}

export function getActiveCourse(treatment: TreatmentBlock): TreatmentCourse {
  const normalized = normalizeTreatment(treatment);
  return (
    normalized.courses.find((c) => c.id === normalized.active_course_id) ?? normalized.courses[0]
  );
}

export function syncTreatmentLegacyFields(treatment: TreatmentBlock): TreatmentBlock {
  const normalized = normalizeTreatment(treatment);
  const active = getActiveCourse(normalized);
  return {
    ...normalized,
    course_type: active.course_type,
    coordinator: active.coordinator,
    next_mri_date: active.next_mri_date,
    procedures: active.procedures,
    recommendations: active.recommendations,
    lfk_per_week: active.lfk_per_week,
    walking_steps: active.walking_steps,
    additional_recs: active.additional_recs,
  };
}

export function updateTreatmentCourses(
  treatment: TreatmentBlock,
  updater: (
    courses: TreatmentCourse[],
    activeId: string,
  ) => { courses: TreatmentCourse[]; activeId?: string },
): TreatmentBlock {
  const normalized = normalizeTreatment(treatment);
  const activeId = normalized.active_course_id!;
  const result = updater(normalized.courses, activeId);
  return syncTreatmentLegacyFields({
    ...normalized,
    courses: result.courses,
    active_course_id: result.activeId ?? activeId,
  });
}

export function addTreatmentCourse(
  treatment: TreatmentBlock,
  courseTypes: string[],
): TreatmentBlock {
  return updateTreatmentCourses(treatment, (courses) => {
    const number = courses.length + 1;
    const next = emptyTreatmentCourse(number, defaultCourseType(number, courseTypes));
    return { courses: [...courses, next], activeId: next.id };
  });
}

export function removeTreatmentCourse(treatment: TreatmentBlock, courseId: string): TreatmentBlock {
  return updateTreatmentCourses(treatment, (courses, activeId) => {
    if (courses.length <= 1) return { courses };
    const nextCourses = courses
      .filter((c) => c.id !== courseId)
      .map((c, index) => ({ ...c, number: index + 1 }));
    const nextActive =
      activeId === courseId ? nextCourses[nextCourses.length - 1].id : activeId;
    return { courses: nextCourses, activeId: nextActive };
  });
}

export function emptyBodyMapProcedure(): BodyMapProcedure {
  return {
    id: newEntryId("bp"),
    procedure_name: "",
    procedure_date: null,
    dose: null,
    drug_name: null,
    notes: null,
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
        diagnostics: {
          pain_vas: data.diagnostics.pain_vas,
        },
      };
    case 3:
      return { diagnostics: data.diagnostics };
    case 4:
      return {
        diagnosis: data.diagnosis,
        diagnostics: { walking_pattern: data.diagnostics.walking_pattern },
        treatment: syncTreatmentLegacyFields(data.treatment),
      };
    case 5:
      return { treatment: syncTreatmentLegacyFields(data.treatment) };
    default:
      return {};
  }
}
