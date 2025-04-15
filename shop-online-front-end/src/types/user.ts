// Interface cho thông tin người dùng hiển thị trong profile
export interface User {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  address?: string;
}

// Interface cho user profile từ API
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  role: number;
  createdAt: string;
  updatedAt: string;
}

// Interface cho dữ liệu người dùng trả về từ API
export interface UserAdminApi {
  id: number;
  username: string | null;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  role: {
    id: number;
    name: string;
  };
  roleId: number;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
  dateOfBirth: string | null;
}

// Interface cho user hiển thị ở trang admin
export interface UserAdmin {
  id: number;
  username: string | null;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  statusLabel: string; // "Đang hoạt động" | "Đã vô hiệu hóa"
  statusClass: string; // "bg-success" | "bg-danger"
  role: string; // Tên role: "Admin", "User", v.v.
  roleId: number; // ID của role
  totalOrders: number;
  totalSpent: number;
  createdAt: string; // Đã format theo định dạng dd/MM/yyyy
  updatedAt: string;
  dateOfBirth: string | null;
}

export interface UserProfileUpdate {
  username?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}
