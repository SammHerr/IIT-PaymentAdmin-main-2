"use client";
import { useAuth } from "@/app/(auth)/auth-context";

export default function ProtectedValue({
  children,
  fallback = "Inicia sesión para ver estos datos",
  className = "",
}: {
  children: React.ReactNode;
  fallback?: string;
  className?: string;
}) {
  const { user, loading } = useAuth();
  if (loading) return <span className={className}>...</span>;
  if (!user) return <span className={`text-gray-400 ${className}`}>{fallback}</span>;
  return <span className={className}>{children}</span>;
}
