
import { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '@/lib/backgroundRemoval';

interface LogoProcessorProps {
  originalImageUrl: string;
  onProcessed: (processedImageUrl: string) => void;
  className?: string;
}

export function LogoProcessor({ originalImageUrl, onProcessed, className }: LogoProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        console.log('Starting logo background removal...');
        
        // Fetch the original image
        const response = await fetch(originalImageUrl);
        const blob = await response.blob();
        
        // Convert to image element
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for processed image
        const processedUrl = URL.createObjectURL(processedBlob);
        setProcessedImageUrl(processedUrl);
        onProcessed(processedUrl);
        
        console.log('Logo background removal completed');
      } catch (error) {
        console.error('Error processing logo:', error);
        // Fallback to original image
        onProcessed(originalImageUrl);
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();
  }, [originalImageUrl, onProcessed]);

  if (isProcessing) {
    return (
      <div className={className}>
        <div className="animate-pulse bg-gray-700 rounded w-12 h-12" />
      </div>
    );
  }

  return (
    <img 
      src={processedImageUrl || originalImageUrl}
      alt="PropCloud Logo"
      className={className}
    />
  );
}
