
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl md:text-4xl"
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        <img 
          src="/lovable-uploads/ca6dcb7f-9a61-40ab-88ac-78b6a9cad3c4.png" 
          alt="PropCloud Logo"
          className={cn("object-contain filter brightness-0 invert", sizeClasses[size])}
          style={{
            filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(140deg)'
          }}
        />
      </div>
      {showText && (
        <h1 className={cn("font-bold tracking-wider", textSizeClasses[size])}>
          <span className="text-primary">PROP</span>
          <span className="text-white">CLOUD</span>
        </h1>
      )}
    </div>
  );
}
