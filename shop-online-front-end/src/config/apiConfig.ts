// Cấu hình URL cơ sở cho API
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
console.log("API_BASE_URL:", apiUrl);
export const API_BASE_URL = apiUrl;
