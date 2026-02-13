// page.tsx
// User Profile Page route for Next.js App Router
// E-Commerce Microservices Frontend

"use client";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";

const UserProfilePage = dynamic(() => import("@/features/user/UserProfilePage"), { ssr: false });

export default function UserProfileRoute() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <UserProfilePage />
    </ProtectedRoute>
  );
}
