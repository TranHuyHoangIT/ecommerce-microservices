interface StockBadgeProps {
  stock: number;
  threshold?: number;
}

export default function StockBadge({ stock, threshold = 10 }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
        Hết hàng
      </span>
    );
  }

  if (stock < threshold) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
        Sắp hết ({stock})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
      Còn hàng ({stock})
    </span>
  );
}
