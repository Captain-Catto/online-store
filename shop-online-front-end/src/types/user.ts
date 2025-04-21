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

// Định nghĩa interface cho Address từ API
export interface UserAddress {
  id: number;
  userId: number;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface cho dữ liệu người dùng trả về từ API
export interface UserAdminApi {
  id: number;
  username: string | null;
  email: string;
  roleId: number;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalSpent: number;
  role: {
    id: number;
    name: string;
  };
  // Thêm trường addresses
  addresses?: UserAddress[];
  // Thêm trường notes nếu có
  notes?: string;
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
  // Thêm trường addresses trong UserAdmin
  addresses?: UserAddress[];
  // Thêm trường notes nếu có
  notes?: string;
}

export interface UserProfileUpdate {
  username?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

// Kiểu dữ liệu cho một ghi chú
export interface UserNote {
  id: number;
  userId: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// Kiểu dữ liệu trả về của getUserNotes
export interface UserNotes {
  userId: string | number;
  username: string;
  notes: UserNote[];
}

// Kiểu dữ liệu trả về của addUserNote và updateUserNote
export interface UserNoteResponse {
  message: string;
  note: UserNote;
}

// Kiểu dữ liệu trả về của deleteUserNote
export interface UserNoteDeleteResponse {
  message: string;
  noteId: number;
}
