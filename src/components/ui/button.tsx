import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 hover:shadow-indigo-500/35 border border-indigo-400/30",
        primary:
          "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 border border-white/10",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700/80 border border-slate-700/60 shadow-sm",
        outline:
          "border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white text-slate-300",
        ghost:
          "hover:bg-slate-800/60 text-slate-300 hover:text-white",
        destructive:
          "bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 border border-rose-400/20",
        success:
          "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 border border-emerald-400/20",
        glow:
          "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] border border-indigo-300/40",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 rounded-2xl px-8 text-base font-semibold",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
