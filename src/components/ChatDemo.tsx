import { useState, useEffect } from "react";

const chatExamples = [
  {
    user: "Show me the top 3 emerging neighborhoods in Austin for Airbnb investment right now.",
    ai: "Based on current market data and growth trends, here are the top 3 emerging Austin neighborhoods:\n\n1. **East Austin (Webberville)** - 23% YoY growth, avg. $180/night\n2. **Mueller District** - New development, 15% ROI projection\n3. **Riverside** - Upcoming light rail, 19% booking increase"
  },
  {
    user: "Analyze the projected ROI for 123 Main St, factoring in seasonality and local events.",
    ai: "**123 Main St Analysis:**\n\n• Base ROI: 14.2% annually\n• SXSW boost: +$3,200 (March)\n• Formula 1 impact: +$1,800 (October)\n• Summer seasonality: +8% above average\n\n**Final projected ROI: 18.7%**"
  },
  {
    user: "What's the optimal nightly rate for my property in July?",
    ai: "For your 2BR downtown property in July:\n\n**Optimal rate: $195/night**\n\n• Market average: $175\n• Your premium factors: Downtown location (+$15), Pool (+$5)\n• July demand surge: +12%\n\nThis rate optimizes for 85% occupancy while maximizing revenue."
  }
];

export function ChatDemo() {
  const [currentExample, setCurrentExample] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % chatExamples.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const example = chatExamples[currentExample];

  return (
    <div className={`max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="space-y-6 p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border">
        <div className="flex justify-end">
          <div className="bg-secondary rounded-2xl px-6 py-4 max-w-[85%]">
            <p className="text-foreground">{example.user}</p>
          </div>
        </div>
        
        <div className="flex justify-start">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-6 py-4 max-w-[85%]">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-1 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-primary-foreground animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-foreground whitespace-pre-line leading-relaxed">{example.ai}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicator dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {chatExamples.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentExample(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentExample 
                ? 'bg-primary w-6' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}