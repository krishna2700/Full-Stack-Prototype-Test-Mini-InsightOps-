"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { authStore } from "@/lib/client";

type Props = {
  children: React.ReactNode;
  allowedRoles?: Role[];
};

export const AuthGate = ({ children, allowedRoles }: Props) => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = authStore.get();
    if (!stored) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(stored.user.role)) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [allowedRoles, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading workspace...
      </div>
    );
  }

  return <>{children}</>;
};
