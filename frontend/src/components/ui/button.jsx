import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-display shadow-sm transition",
  {
    variants: {
      variant: {
        default: "bg-sky-500 text-white hover:bg-sky-600",
        menu: "bg-amber-400 text-comicInk hover:bg-amber-500",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        lg: "h-14 px-8 text-xl",
        xl: "h-24 px-10 text-4xl",
      },
    },
    defaultVariants: { variant: "default", size: "lg" },
  }
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button className={twMerge(buttonVariants({ variant, size }), className)} {...props} />
  );
}
