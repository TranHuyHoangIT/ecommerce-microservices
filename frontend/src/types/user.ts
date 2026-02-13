// user.ts
// Type definitions for user profile
// E-Commerce Microservices Frontend

export interface UserProfileType {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  avatar?: string;
}
