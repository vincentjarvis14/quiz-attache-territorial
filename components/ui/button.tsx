import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
        primary:
          "bg-blue-900 text-white hover:bg-blue-800 shadow-sm",
        primaryOutline:
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200",
        secondaryOutline:
          "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
        ghost:
          "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        danger:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
        dangerOutline:
          "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
        super:
          "bg-indigo-700 text-white hover:bg-indigo-800 shadow-sm",
        superOutline:
          "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50",
        locked:
          "bg-slate-200 text-slate-400 cursor-not-allowed",
        sidebar:
          "bg-transparent text-slate-500 border-2 border-transparent hover:bg-slate-100 transition-none",
        sidebarOutline:
          "bg-blue-50 text-blue-900 border-blue-200 border-2 hover:bg-blue-100 transition-none",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-7 text-base",
        xl: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        rounded: "rounded-full",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
