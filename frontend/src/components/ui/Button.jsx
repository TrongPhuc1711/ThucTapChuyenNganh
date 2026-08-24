import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-gradient-to-r from-coffee-700 to-coffee-600 text-white shadow-md shadow-coffee-700/20 hover:from-coffee-600 hover:to-coffee-500",
  secondary:
    "bg-coffee-100 text-coffee-700 hover:bg-coffee-200",
  outline:
    "border border-coffee-200 text-coffee-700 hover:bg-coffee-50 bg-white",
  ghost:
    "text-coffee-600 hover:bg-coffee-50",
  danger:
    "bg-danger text-white hover:bg-red-600 shadow-md shadow-danger/20",
  gold:
    "bg-gradient-to-r from-gold to-gold-light text-white shadow-md shadow-gold/20 hover:from-gold-dark hover:to-gold",
};

const sizes = {
  xs: "px-2.5 py-1 text-xs rounded-lg",
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
  xl: "px-8 py-3.5 text-base rounded-2xl",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    className = "",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium font-ui
        transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        cursor-pointer
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className="w-4 h-4" />}
    </button>
  );
});

export default Button;
