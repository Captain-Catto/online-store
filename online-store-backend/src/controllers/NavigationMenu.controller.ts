import { Request, Response } from "express";
import NavigationMenu from "../models/NavigationMenu";
import Category from "../models/Category";
import slugify from "slugify";

// Lấy menu cho frontend hiển thị
export const getPublicNavigationMenu = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const menuItems = await NavigationMenu.findAll({
      where: { isActive: true },
      order: [
        ["parentId", "ASC"],
        ["order", "ASC"],
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug", "image"],
        },
      ],
    });

    // Xây dựng cây menu
    const menuTree = buildMenuTree(menuItems);
    res.json(menuTree);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy menu", error });
  }
};

// Các API cho admin quản lý
export const getAllNavigationMenus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const menuItems = await NavigationMenu.findAll({
      order: [
        ["parentId", "ASC"],
        ["order", "ASC"],
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách menu", error });
  }
};

export const createNavigationMenu = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, link, categoryId, parentId, order, isActive, megaMenu } =
      req.body;

    // Tạo slug từ tên
    const slug = slugify(name, { lower: true });

    const newMenu = await NavigationMenu.create({
      name,
      slug,
      link: link || null,
      categoryId: categoryId || null,
      parentId: parentId || null,
      order: order || 0,
      isActive: isActive === undefined ? true : isActive,
      megaMenu: megaMenu || false,
    });

    res.status(201).json(newMenu);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo menu", error });
  }
};

export const updateNavigationMenu = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const menu = await NavigationMenu.findByPk(id);
    if (!menu) {
      res.status(404).json({ message: "Không tìm thấy menu" });
      return;
    }

    const { name, link, categoryId, parentId, order, isActive, megaMenu } =
      req.body;

    // Tạo slug mới nếu tên thay đổi
    let slug = menu.slug;
    if (name && name !== menu.name) {
      slug = slugify(name, { lower: true });
    }

    await menu.update({
      name: name || menu.name,
      slug,
      link: link === undefined ? menu.link : link,
      categoryId: categoryId === undefined ? menu.categoryId : categoryId,
      parentId: parentId === undefined ? menu.parentId : parentId,
      order: order === undefined ? menu.order : order,
      isActive: isActive === undefined ? menu.isActive : isActive,
      megaMenu: megaMenu === undefined ? menu.megaMenu : megaMenu,
    });

    res.status(200).json({ message: "Navigation menu updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật menu", error });
  }
};

export const deleteNavigationMenu = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const menu = await NavigationMenu.findByPk(id);
    if (!menu) {
      res.status(404).json({ message: "Không tìm thấy menu" });
      return;
    }

    // Kiểm tra nếu menu có menu con
    const childMenus = await NavigationMenu.findAll({
      where: { parentId: id },
    });

    if (childMenus.length > 0) {
      res.status(400).json({
        message: "Không thể xóa menu có menu con. Vui lòng xóa menu con trước.",
      });
      return;
    }

    await menu.destroy();
    res.json({ message: "Đã xóa menu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa menu", error });
  }
};

// Hàm hỗ trợ tạo cấu trúc menu dạng cây
function buildMenuTree(
  menuItems: any[],
  parentId: number | null = null
): Array<{ [key: string]: any; children?: any[] }> {
  const items = menuItems.filter((menu) => menu.parentId === parentId);

  return items.map((item) => {
    const children = buildMenuTree(menuItems, item.id);
    const itemJson = item.toJSON();

    return {
      ...itemJson,
      children: children.length > 0 ? children : undefined,
    };
  });
}
