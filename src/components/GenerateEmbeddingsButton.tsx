
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateEmbeddings } from "@/utils/generateEmbeddings";
import { Loader2, Zap } from "lucide-react";

const GenerateEmbeddingsButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateEmbeddings = async () => {
    setIsGenerating(true);
    try {
      const result = await generateEmbeddings();
      
      toast({
        title: "Embeddings Generated!",
        description: `Successfully processed ${result.successCount || 0} properties. The AI is now ready for intelligent responses.`,
      });
    } catch (error: any) {
      console.error('Error generating embeddings:', error);
      toast({
        title: "Error",
        description: `Failed to generate embeddings: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateEmbeddings}
      disabled={isGenerating}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Embeddings...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-4 w-4" />
          Generate AI Embeddings
        </>
      )}
    </Button>
  );
};

export default GenerateEmbeddingsButton;
