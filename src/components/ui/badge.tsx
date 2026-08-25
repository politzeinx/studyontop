import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
        secondary:
          "border-slate-700 bg-slate-800 text-slate-300",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-400",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-400",
        outline:
          "border-slate-700 text-slate-300",
        purple:
          "border-purple-500/30 bg-purple-500/10 text-purple-300",
        cyan:
          "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
