import { forwardRef } from "react";
import { cn } from "../../lib/utils"; // You may need to create this utility

const Button = forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

// Professional button variants matching forecasting app style
const buttonVariants = ({ variant, size, className }) => {
  const base = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    // Primary action button (blue)
    default: "bg-blue-600 text-white shadow-sm border border-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:ring-blue-500",
    
    // Secondary button (white with border)
    secondary: "bg-white text-slate-700 shadow-sm border border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500",
    
    // Success/positive action (green)
    success: "bg-green-600 text-white shadow-sm border border-green-600 hover:bg-green-700 hover:border-green-700 focus:ring-green-500",
    
    // Warning/attention (yellow)
    warning: "bg-yellow-500 text-white shadow-sm border border-yellow-500 hover:bg-yellow-600 hover:border-yellow-600 focus:ring-yellow-500",
    
    // Destructive action (red)
    destructive: "bg-red-600 text-white shadow-sm border border-red-600 hover:bg-red-700 hover:border-red-700 focus:ring-red-500",
    
    // Utility/neutral action (slate)
    utility: "bg-slate-600 text-white shadow-sm border border-slate-600 hover:bg-slate-700 hover:border-slate-700 focus:ring-slate-500",
    
    // Ghost/minimal button
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500",
    
    // Link style button
    link: "text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500",
    
    // Legacy variants for compatibility (map to new styles)
    adventure: "bg-green-600 text-white shadow-sm border border-green-600 hover:bg-green-700 hover:border-green-700 focus:ring-green-500",
    energy: "bg-yellow-500 text-white shadow-sm border border-yellow-500 hover:bg-yellow-600 hover:border-yellow-600 focus:ring-yellow-500",
    hero: "bg-purple-600 text-white shadow-sm border border-purple-600 hover:bg-purple-700 hover:border-purple-700 focus:ring-purple-500",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 py-2",
    md: "h-11 px-6 py-2",
    lg: "h-12 px-8 py-3 text-base",
    xl: "h-14 px-10 py-4 text-lg",
    xxl: "h-16 px-12 py-5 text-xl"
  };
  
  return `${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className || ''}`;
};

// Utility function for className merging (create this file if it doesn't exist)
// src/lib/utils.js
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export { Button, buttonVariants };