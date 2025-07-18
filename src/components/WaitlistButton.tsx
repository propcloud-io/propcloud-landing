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
        "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300",
        "hover:scale-105 active:scale-95 glow-primary",
        size === "lg" && "text-lg px-8 py-6 h-auto",
        className
      )}
    >
      Join the Private Waitlist
    </Button>
  );
}