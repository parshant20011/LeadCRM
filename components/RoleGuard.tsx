"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/app/context/AppContext";

const ADMIN_ONLY_PATHS = ["/leads", "/agents"];
const SUPER_ADMIN_ONLY_PATHS = ["/admins"];
const AGENT_ONLY_PATHS = ["/agent"];

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useApp();

  useEffect(() => {
    if (role === "agent" && ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
      router.replace("/agent");
      return;
    }
    if (role !== "super_admin" && SUPER_ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
      router.replace("/dashboard");
      return;
    }
    if (role !== "agent" && AGENT_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      router.replace("/dashboard");
    }
  }, [role, pathname, router]);

  return <>{children}</>;
}
