import { useEffect, useState } from "react";

export function NeuralBackground() {
  const [nodes, setNodes] = useState<Array<{ x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const generateNodes = () => {
      const newNodes = Array.from({ length: 20 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3
      }));
      setNodes(newNodes);
    };

    generateNodes();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--neural))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--neural))" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Connection lines */}
        {nodes.map((node, i) => 
          nodes.slice(i + 1).map((otherNode, j) => {
            const distance = Math.sqrt(
              Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
            );
            if (distance < 25) {
              return (
                <line
                  key={`${i}-${j}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${otherNode.x}%`}
                  y2={`${otherNode.y}%`}
                  stroke="hsl(var(--neural))"
                  strokeWidth="1"
                  strokeOpacity={0.2}
                  className="animate-pulse"
                />
              );
            }
            return null;
          })
        )}
        
        {/* Nodes */}
        {nodes.map((node, i) => (
          <circle
            key={i}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="2"
            fill="url(#nodeGradient)"
            className="neural-pulse"
            style={{ animationDelay: `${node.delay}s` }}
          />
        ))}
      </svg>
    </div>
  );
}