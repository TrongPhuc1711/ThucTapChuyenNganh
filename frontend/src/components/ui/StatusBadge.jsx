const STATUS_STYLES = {
  "Treo": {
    bg: "bg-warning-light",
    text: "text-warning",
    dot: "bg-warning",
  },
  "Chờ xử lý": {
    bg: "bg-warning-light",
    text: "text-warning",
    dot: "bg-warning",
  },
  "Đang xử lý": {
    bg: "bg-info-light",
    text: "text-info",
    dot: "bg-info",
  },
  "Đang giao": {
    bg: "bg-purple-100",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  "Đã giao": {
    bg: "bg-success-light",
    text: "text-success",
    dot: "bg-success",
  },
  "Đã thanh toán": {
    bg: "bg-success-light",
    text: "text-success",
    dot: "bg-success",
  },
  "Đã hủy": {
    bg: "bg-danger-light",
    text: "text-danger",
    dot: "bg-danger",
  },
  "Đã hoàn tiền": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  "Còn bán": {
    bg: "bg-success-light",
    text: "text-success",
    dot: "bg-success",
  },
  "Hết hàng": {
    bg: "bg-danger-light",
    text: "text-danger",
    dot: "bg-danger",
  },
  Admin: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  NhanVien: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-coffee-100",
  text: "text-coffee-600",
  dot: "bg-coffee-400",
};

export default function StatusBadge({ status, showDot = true, className = "" }) {
  const style = STATUS_STYLES[status] || DEFAULT_STYLE;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 text-xs font-semibold rounded-full
        ${style.bg} ${style.text}
        ${className}
      `}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      )}
      {status}
    </span>
  );
}
