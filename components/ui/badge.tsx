import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
        secondary: "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
        success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400",
        destructive: "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400",
        warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400",
        outline: "text-slate-700 border border-slate-200 dark:text-slate-300 dark:border-slate-800",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
