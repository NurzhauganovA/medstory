export type UserRole = "admin" | "doctor" | "nurse";

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserCreatePayload {
  username: string;
  full_name: string;
  role: UserRole;
  password: string;
  is_active?: boolean;
}

export interface UserUpdatePayload {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
  password?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Администратор",
  doctor: "Врач",
  nurse: "Мед.сестра",
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Администратор" },
  { value: "doctor", label: "Врач" },
  { value: "nurse", label: "Мед.сестра" },
];

/** Может ли роль создавать/редактировать пациентов и медкарты. */
export function canEdit(role: UserRole | undefined): boolean {
  return role === "admin" || role === "doctor";
}
