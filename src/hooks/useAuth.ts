"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthToken } from "@/utils/api";

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    
    if (requireAuth && !token) {
      // User needs to be logged in but isn't
      router.push("/signin");
    } else if (!requireAuth && token) {
      // User is logged in but on auth page
      router.push("/dashboard");
    } else {
      setIsAuthenticated(!!token);
    }
    
    setLoading(false);
  }, [pathname, requireAuth, router]);

  return { isAuthenticated, loading };
};