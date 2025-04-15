import Link from "next/link";

interface Order {
  id: number;
  userId: string | number;
  status: string;
  statusClass: string;
  total: string;
  date: string;
}

interface RecentOrdersTableProps {
  orders: Order[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Đơn hàng gần đây</h3>
      </div>
      <div className="card-body table-responsive p-0">
        <table className="table table-hover text-nowrap">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Trạng thái</th>
              <th>Tổng tiền</th>
              <th>Ngày đặt</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <span className={`badge ${order.statusClass}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.total}</td>
                <td>{order.date}</td>
                <td>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="btn btn-info btn-sm"
                  >
                    <i className="fas fa-eye"></i> Xem chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
