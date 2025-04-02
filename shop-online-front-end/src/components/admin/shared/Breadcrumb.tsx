import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <ol className="breadcrumb float-sm-right">
      {items.map((item, index) => (
        <li
          key={index}
          className={`breadcrumb-item ${item.active ? "active" : ""}`}
        >
          {item.href && !item.active ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            item.label
          )}
        </li>
      ))}
    </ol>
  );
}
