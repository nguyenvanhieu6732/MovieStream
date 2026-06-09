import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1.35rem] text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-white/20 bg-primary/90 text-primary-foreground shadow-[0_18px_48px_rgba(244,63,94,0.26),inset_0_1px_0_rgba(255,255,255,0.24)] hover:bg-primary hover:shadow-[0_24px_70px_rgba(244,63,94,0.34),inset_0_1px_0_rgba(255,255,255,0.28)]",
        destructive:
          "border border-red-300/20 bg-destructive/90 text-destructive-foreground shadow-[0_18px_48px_rgba(220,38,38,0.26)] hover:bg-destructive",
        outline:
          "border border-white/18 bg-white/[0.065] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_38px_rgba(0,0,0,0.18)] backdrop-blur-[30px] hover:border-white/28 hover:bg-white/[0.11] hover:text-white",
        secondary:
          "border border-white/12 bg-secondary/65 text-secondary-foreground backdrop-blur-[30px] hover:bg-secondary/85",
        ghost: "text-white/82 hover:bg-white/10 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-[1.15rem] px-4",
        lg: "h-12 rounded-[1.5rem] px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
