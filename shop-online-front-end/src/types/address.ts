// Interface cho địa chỉ hiển thị
export interface Address {
  id: string;
  fullName: string;
  streetAddress: string;
  district: string;
  ward: string;
  city: string;
  phoneNumber: string;
  isDefault: boolean;
}
export interface AddressPagination extends Address {
  total?: number;
  page?: number;
  limit?: number;
}

// Interface cho việc tạo địa chỉ mới từ API
export interface AddressCreate {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

// Interface cho việc cập nhật địa chỉ
export interface AddressUpdate extends AddressCreate {
  id: number;
}

// Interface cho địa chỉ từ API
export interface AddressResponse {
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
