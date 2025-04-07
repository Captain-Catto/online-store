const COOKIE_NAME = "refreshToken";

// Hàm Helper để lấy giá trị từ cookie
const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!cookieValue) return null;

  return cookieValue.split("=")[1];
};

export const AuthService = {
  isLoggedIn: (): boolean => {
    if (typeof window !== "undefined") {
      return !!getCookie(COOKIE_NAME);
    }
    return false;
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return getCookie(COOKIE_NAME);
    }
    return null;
  },
};

//schema cho user
export interface User {
  email: string;
  password: string;
}

// hàm xử lý để tạo user
export const createUser = async (user: User) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error("Đăng ký thất bại");
  }

  const data = await response.json();
  return data;
};
