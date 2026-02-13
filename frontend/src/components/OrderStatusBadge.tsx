interface OrderStatusBadgeProps {
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  showDot?: boolean;
}

export default function OrderStatusBadge({ status, showDot = true }: OrderStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Chờ xử lý',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      dotColor: 'bg-yellow-500'
    },
    confirmed: {
      label: 'Đã xác nhận',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      dotColor: 'bg-blue-500'
    },
    shipping: {
      label: 'Đang giao',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      dotColor: 'bg-purple-500'
    },
    delivered: {
      label: 'Đã giao',
      color: 'bg-green-100 text-green-800 border-green-300',
      dotColor: 'bg-green-500'
    },
    cancelled: {
      label: 'Đã hủy',
      color: 'bg-red-100 text-red-800 border-red-300',
      dotColor: 'bg-red-500'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {showDot && (
        <span className={`w-2 h-2 rounded-full ${config.dotColor} mr-2 animate-pulse`}></span>
      )}
      {config.label}
    </span>
  );
}
