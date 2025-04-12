import { getCookie } from "@/services/AuthService";
import { jwtDecode } from "jwt-decode";

import { API_BASE_URL } from "@/config/apiConfig";

// Interface for JWT payload
interface JwtPayload {
  id: number;
  username: string;
  role: number;
  exp: number;
  iat: number;
}

// For handling multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to notify all subscribers with the new token
function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Function to add subscribers
function addSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export class AuthClient {
  static async fetchWithAuth(url: string, options: RequestInit = {}) {
    try {
      // Get token from sessionStorage
      let token = sessionStorage.getItem("authToken");

      // Check if token is valid or needs refresh
      if (token) {
        try {
          const decodedToken = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;

          // If token is expired or about to expire, refresh it
          if (decodedToken.exp < currentTime + 60) {
            // 60s buffer
            console.log("Token expired or expiring soon, refreshing...");
            const newToken = await this.refreshToken();
            if (newToken) {
              token = newToken;
            } else {
              throw new Error("TOKEN_REFRESH_FAILED");
            }
          }
        } catch (tokenError) {
          console.error("Error validating token:", tokenError);
          // If token can't be decoded, try refresh
          const newToken = await this.refreshToken();
          if (newToken) {
            token = newToken;
          } else {
            throw new Error("TOKEN_REFRESH_FAILED");
          }
        }
      } else if (
        localStorage.getItem("isLoggedIn") === "true" ||
        getCookie("auth_status")
      ) {
        // No token but user appears logged in - try refresh
        const newToken = await this.refreshToken();
        if (newToken) {
          token = newToken;
        } else {
          throw new Error("NO_AUTH_TOKEN");
        }
      } else {
        // No token and no login state
        throw new Error("NO_AUTH_TOKEN");
      }

      // Create headers with validated token
      const headers = {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Make request with validated token
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      // If still getting 401, last attempt at refresh
      if (response.status === 401) {
        console.log("Got 401 despite valid token, final refresh attempt");
        const newToken = await this.refreshToken();
        if (newToken) {
          const newHeaders = {
            ...options.headers,
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          };
          return fetch(url, {
            ...options,
            headers: newHeaders,
            credentials: "include",
          });
        }
        throw new Error("TOKEN_REFRESH_FAILED");
      }

      return response;
    } catch (error) {
      console.error("Auth API call error:", error);
      if (
        error instanceof Error &&
        (error.message === "NO_AUTH_TOKEN" ||
          error.message === "TOKEN_REFRESH_FAILED")
      ) {
        throw error;
      }
      throw error;
    }
  }

  static async refreshToken(): Promise<string | null> {
    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        addSubscriber((token) => resolve(token));
      });
    }

    isRefreshing = true;

    try {
      console.log("Actually performing token refresh...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(API_BASE_URL + "/auth/refresh-token", {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("Refresh token API error:", response.status);
        try {
          const errorText = await response.text();
          console.error("Error response:", errorText);
        } catch {
          console.error("Could not parse error response");
        }

        sessionStorage.removeItem("authToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        isRefreshing = false;
        return null;
      }

      const data = await response.json();
      const newToken = data.accessToken;

      if (!newToken) {
        console.error("No accessToken in refresh response");
        isRefreshing = false;
        return null;
      }

      console.log("Got new token, storing it");
      sessionStorage.setItem("authToken", newToken);

      onRefreshed(newToken);
      isRefreshing = false;

      return newToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      isRefreshing = false;
      return null;
    }
  }
}
