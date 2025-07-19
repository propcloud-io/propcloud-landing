
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWaitlist } from "@/hooks/useWaitlist";
import { WaitlistForm } from "./WaitlistForm";

interface WaitlistButtonProps {
  className?: string;
  size?: "default" | "lg";
}

export function WaitlistButton({ className, size = "default" }: WaitlistButtonProps) {
  const { handleWaitlistSuccess } = useWaitlist();

  return (
    <WaitlistForm 
      onSuccess={handleWaitlistSuccess}
      size={size}
      className={className}
    />
  );
}
