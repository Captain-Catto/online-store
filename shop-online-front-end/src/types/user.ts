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

// Interface để cập nhật thông tin user
export interface UserProfileUpdate {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  username?: string;
}
