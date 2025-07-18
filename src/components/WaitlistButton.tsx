import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WaitlistButtonProps {
  className?: string;
  size?: "default" | "lg";
}

export function WaitlistButton({ className, size = "default" }: WaitlistButtonProps) {
  const handleWaitlistClick = () => {
    // In a real app, this would open a form or redirect to a waitlist signup
    console.log("Waitlist signup clicked");
  };

  return (
    <Button
      onClick={handleWaitlistClick}
      size={size}
      className={cn(
        "bg-gradient-neural hover:neural-glow transition-all duration-500 group font-semibold",
        "hover:scale-105 active:scale-95",
        size === "lg" && "text-lg px-8 py-6 h-auto",
        className
      )}
    >
      <span className="relative z-10">Join the Private Waitlist</span>
      <div className="absolute inset-0 bg-gradient-vision opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-md" />
    </Button>
  );
}