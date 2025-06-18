import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-display font-semibold transition-all duration-300 ease-out cursor-pointer relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
  {
    variants: {
      variant: {
        // Hero button - main adventure starter
        hero: "bg-gradient-to-r from-ocean-500 to-ocean-700 text-white shadow-large hover:shadow-glow-blue hover:-translate-y-1 active:translate-y-0 active:shadow-medium border-2 border-ocean-600",
        
        // Adventure buttons - menu options
        adventure: "bg-gradient-to-r from-adventure-400 to-adventure-600 text-white shadow-medium hover:shadow-glow-green hover:-translate-y-1 active:translate-y-0 active:shadow-soft border-2 border-adventure-500",
        
        // Energy buttons - interactive actions
        energy: "bg-gradient-to-r from-energy-400 to-energy-600 text-white shadow-medium hover:shadow-glow-orange hover:-translate-y-1 active:translate-y-0 active:shadow-soft border-2 border-energy-500",
        
        // Secondary actions
        secondary: "bg-gradient-to-r from-hero-400 to-hero-600 text-white shadow-soft hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0 border-2 border-hero-500",
        
        // Utility buttons
        utility: "bg-gradient-to-r from-sunshine-400 to-sunshine-600 text-comicInk shadow-soft hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0 border-2 border-sunshine-500",
        
        // Legacy compatibility
        default: "bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-medium hover:shadow-large hover:-translate-y-1",
        menu: "bg-gradient-to-r from-sunshine-400 to-sunshine-600 text-comicInk shadow-medium hover:shadow-large hover:-translate-y-1"
      },
      size: {
        sm: "h-10 px-4 text-sm rounded-xl",
        md: "h-12 px-6 text-base rounded-xl",
        lg: "h-16 px-8 text-xl rounded-2xl", // 2-2.5 inches tall as requested
        xl: "h-20 px-12 text-2xl rounded-3xl", // Large hero button
        xxl: "h-24 px-16 text-3xl rounded-4xl", // Extra large for main actions
      },
    },
    defaultVariants: { 
      variant: "default", 
      size: "lg" 
    },
  }
);

export function Button({ 
  className, 
  variant, 
  size, 
  children, 
  loading = false,
  ...props 
}) {
  return (
    <button 
      className={twMerge(
        buttonVariants({ variant, size }), 
        loading && "loading",
        "group", // For hover effects on children
        className
      )} 
      disabled={loading || props.disabled}
      {...props}
    >
      {/* Shine effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </button>
  );
}