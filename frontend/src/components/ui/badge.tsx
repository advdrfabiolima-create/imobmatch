import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary/20 text-primary hover:bg-primary/30",
        secondary:   "border-white/10 bg-white/10 text-slate-400 hover:bg-white/15",
        destructive: "border-transparent bg-red-500/15 text-red-300 hover:bg-red-500/25",
        outline:     "border-border text-foreground",
        success:     "border-transparent bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25",
        warning:     "border-transparent bg-amber-500/15 text-amber-300 hover:bg-amber-500/25",
        info:        "border-transparent bg-blue-500/15 text-blue-300 hover:bg-blue-500/25",
        gold:        "border-amber-500/30 bg-amber-500/15 text-amber-300",
        silver:      "border-slate-400/30 bg-slate-400/10 text-slate-300",
        bronze:      "border-orange-500/30 bg-orange-500/15 text-orange-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
