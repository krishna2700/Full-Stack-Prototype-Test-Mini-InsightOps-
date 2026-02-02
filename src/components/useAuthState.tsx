"use client";

import { useEffect, useState } from "react";
import { authStore, type AuthState } from "@/lib/client";

export const useAuthState = () => {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    setAuth(authStore.get());
  }, []);

  return { auth, setAuth };
};
