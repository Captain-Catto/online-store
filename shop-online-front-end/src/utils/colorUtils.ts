// Mapping màu sắc sang mã hex
export const colorToHex: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  blue: "#0066CC",
  gray: "#808080",
  charcoal: "#36454F",
  green: "#008000",
  red: "#FF0000",
  navy: "#000080",
  yellow: "#FFFF00",
  purple: "#800080",
};

// Mapping màu sắc sang tên tiếng Việt
export const colorToVietnamese: Record<string, string> = {
  black: "Đen",
  white: "Trắng",
  blue: "Xanh dương",
  gray: "Xám",
  charcoal: "Than chì",
  green: "Xanh lá",
  red: "Đỏ",
  navy: "Xanh navy",
  yellow: "Vàng",
  purple: "Tím",
};

/**
 * Lấy mã màu hex từ tên màu
 * @param color Tên màu (tiếng Anh)
 * @returns Mã màu hex hoặc tên màu gốc nếu không tìm thấy
 */
export function getColorCode(color: string): string {
  return colorToHex[color.toLowerCase()] || color;
}

/**
 * Lấy tên màu tiếng Việt từ tên màu tiếng Anh
 * @param color Tên màu (tiếng Anh)
 * @returns Tên màu tiếng Việt hoặc tên màu gốc nếu không tìm thấy
 */
export function getColorName(color: string): string {
  return colorToVietnamese[color.toLowerCase()] || color;
}
