import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    type = "text",
    className = "",
    containerClassName = "",
    required = false,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-coffee-600 mb-1.5">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-300 pointer-events-none" />
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-coffee-50 border border-coffee-100
            text-coffee-800 text-sm
            placeholder-coffee-300
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? "pl-10" : ""}
            ${isPassword ? "pr-10" : ""}
            ${error ? "border-danger/50 focus:ring-danger/30" : ""}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-400 hover:text-coffee-600 transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
});

export default Input;
