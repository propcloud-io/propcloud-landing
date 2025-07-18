
import { useEffect, useState } from "react";

export function NeuralBackground() {
  const [nodes, setNodes] = useState<Array<{ x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const generateNodes = () => {
      const newNodes = Array.from({ length: 30 }, (_, i) => ({
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
            <stop offset="0%" stopColor="hsl(180, 84%, 25%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(180, 84%, 25%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(180, 84%, 25%)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(172, 84%, 30%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(180, 84%, 25%)" stopOpacity="0.2" />
          </linearGradient>
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
                  stroke="url(#lineGradient)"
                  strokeWidth="1.5"
                  className="animate-pulse"
                  style={{ animationDelay: `${Math.random() * 2}s` }}
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
            r="3"
            fill="url(#nodeGradient)"
            className="animate-pulse"
            style={{ animationDelay: `${node.delay}s` }}
          />
        ))}
        
        {/* Larger accent nodes */}
        {nodes.filter((_, i) => i % 8 === 0).map((node, i) => (
          <circle
            key={`accent-${i}`}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="5"
            fill="hsl(180, 84%, 25%)"
            fillOpacity="0.3"
            className="animate-pulse"
            style={{ animationDelay: `${node.delay + 1}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
