
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Twitter, Linkedin, Mail, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThankYouModal({ isOpen, onClose }: ThankYouModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareText = "Just joined the PropCloud waitlist - the future of real estate investment is a conversation! 🏠✨";
  const shareUrl = window.location.origin;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('Check out PropCloud')}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to the Future!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-3">
            <p className="text-gray-300 text-lg">
              🎉 You're officially on the PropCloud waitlist!
            </p>
            <p className="text-gray-400">
              We'll keep you updated on our progress and give you priority access when we launch.
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-primary">What happens next?</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                You'll receive a welcome email shortly
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Get exclusive updates on our development
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Priority access when PropCloud launches
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm text-gray-400">
              Know someone who'd love this? Share the revolution:
            </p>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="border-gray-600 hover:border-primary/50 hover:bg-primary/10"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="border-gray-600 hover:border-primary/50 hover:bg-primary/10"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('email')}
                className="border-gray-600 hover:border-primary/50 hover:bg-primary/10"
              >
                <Mail className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="border-gray-600 hover:border-primary/50 hover:bg-primary/10"
              >
                <Copy className={`w-4 h-4 ${copied ? 'text-primary' : ''}`} />
              </Button>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Continue Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
