import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { AuthClient } from "@/services/AuthClient";
import { AuthService } from "@/services/AuthService";

interface JwtPayload {
  id: number;
  username: string;
  role: number;
  exp: number;
  iat: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: number;
}

export function useAuth(redirectTo?: string) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token
        const token = sessionStorage.getItem("authToken");

        if (token) {
          try {
            // Validate token
            const decodedToken = jwtDecode<JwtPayload>(token);
            const currentTime = Date.now() / 1000;

            // If token is expired, try to refresh
            if (decodedToken.exp < currentTime) {
              const newToken = await AuthClient.refreshToken();
              if (!newToken) {
                throw new Error("Expired token couldn't be refreshed");
              }
            }

            // Token is valid, get user from localStorage
            const userStr = localStorage.getItem("user");
            if (userStr) {
              try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                // Kiểm tra nếu user có role === 1 (admin role) và role == 2 (employee role)
                setIsAdmin(userData.role === 1);
                setIsEmployee(userData.role === 2);
              } catch (e) {
                console.error("Error parsing user data:", e);
              }
            }

            setIsLoggedIn(true);
          } catch (error) {
            // Token is invalid or expired and couldn't be refreshed
            console.error("Auth validation error:", error);
            await handleLogout();

            if (redirectTo) {
              router.push(redirectTo);
            }
          }
        } else if (localStorage.getItem("isLoggedIn") === "true") {
          // No token in sessionStorage but isLoggedIn is true, try refresh
          try {
            const newToken = await AuthClient.refreshToken();
            if (newToken) {
              // Successfully refreshed token
              const userStr = localStorage.getItem("user");
              if (userStr) {
                setUser(JSON.parse(userStr));
              }
              setIsLoggedIn(true);
            } else {
              // Failed to refresh token
              await handleLogout();

              if (redirectTo) {
                router.push(redirectTo);
              }
            }
          } catch (error) {
            console.error("Token refresh error:", error);
            await handleLogout();

            if (redirectTo) {
              router.push(redirectTo);
            }
          }
        } else {
          // User is not logged in at all
          setIsLoggedIn(false);
          setUser(null);

          if (redirectTo) {
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [redirectTo, router]);

  // Logout function
  const logout = async () => {
    await AuthService.logout();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/login");
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  return { isLoggedIn, user, isLoading, logout, isAdmin, isEmployee };
}
