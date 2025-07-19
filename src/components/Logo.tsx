
import { cn } from "@/lib/utils";
import { LogoProcessor } from "./LogoProcessor";
import { useState } from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  
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

  const handleProcessed = (url: string) => {
    setProcessedImageUrl(url);
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {processedImageUrl ? (
        <img 
          src={processedImageUrl}
          alt="PropCloud Logo"
          className={cn("object-contain", sizeClasses[size])}
        />
      ) : (
        <LogoProcessor
          originalImageUrl="/lovable-uploads/ca6dcb7f-9a61-40ab-88ac-78b6a9cad3c4.png"
          onProcessed={handleProcessed}
          className={cn("object-contain", sizeClasses[size])}
        />
      )}
      {showText && (
        <h1 className={cn("font-bold tracking-wider", textSizeClasses[size])}>
          <span className="text-primary">PROP</span>
          <span className="text-white">CLOUD</span>
        </h1>
      )}
    </div>
  );
}
