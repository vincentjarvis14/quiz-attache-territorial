import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-ink/10 bg-white text-ink hover:bg-cream/60 shadow-sm",
        primary:
          "bg-coral-500 text-white hover:bg-coral-600 shadow-sm",
        primaryOutline:
          "border border-ink/15 bg-white text-ink hover:bg-cream/60 hover:border-ink/25",
        secondary:
          "bg-white text-ink hover:bg-cream/60 shadow-sm",
        secondaryOutline:
          "border border-ink/15 bg-transparent text-ink hover:bg-white/60",
        ghost:
          "text-ink/70 hover:text-ink hover:bg-ink/5",
        danger:
          "bg-coral-600 text-white hover:bg-coral-700 shadow-sm",
        dangerOutline:
          "border border-coral-100 bg-white text-coral-600 hover:bg-coral-50",
        super:
          "bg-coral-500 text-white hover:bg-coral-600 shadow-sm",
        superOutline:
          "border border-coral-100 bg-white text-coral-600 hover:bg-coral-50",
        locked:
          "bg-ink/10 text-ink/40 cursor-not-allowed",
        sidebar:
          "bg-transparent text-ink/60 border-2 border-transparent hover:bg-ink/5 transition-none",
        sidebarOutline:
          "bg-coral-50 text-coral-700 border-coral-100 border-2 hover:bg-coral-100 transition-none",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-9 text-base",
        icon: "h-11 w-11",
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
