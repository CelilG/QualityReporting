export type UserRole = "admin" | "manager" | "worker";

export interface User {
  username: string;
  role: UserRole;
}