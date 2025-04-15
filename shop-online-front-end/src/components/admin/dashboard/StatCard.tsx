import Link from "next/link";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  link: string;
  suffix?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  link,
  suffix,
}: StatCardProps) {
  return (
    <div className="col-lg-3 col-6">
      <div className={`small-box ${color}`}>
        <div className="inner">
          <h3>
            {value}
            {suffix && <sup style={{ fontSize: "20px" }}>{suffix}</sup>}
          </h3>
          <p>{title}</p>
        </div>
        <div className="icon">
          <i className={icon}></i>
        </div>
        <Link href={link} className="small-box-footer">
          Chi tiết <i className="fas fa-arrow-circle-right"></i>
        </Link>
      </div>
    </div>
  );
}
