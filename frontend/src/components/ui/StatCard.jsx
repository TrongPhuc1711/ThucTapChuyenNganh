export default function StatCard({
  icon: Icon,
  label,
  value,
  gradient = "from-coffee-700 to-coffee-600",
  className = "",
}) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-5 border border-coffee-100/50
        shadow-sm hover:shadow-md transition-all duration-300
        ${className}
      `}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
            w-12 h-12 bg-gradient-to-br ${gradient}
            rounded-xl flex items-center justify-center
            text-white shadow-lg
          `}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-2xl font-bold text-coffee-800">{value}</p>
          <p className="text-xs text-coffee-400 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}
