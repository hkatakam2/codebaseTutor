import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Fira Code',
});

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return;
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid render error:', error);
        setSvg(`<div class="text-red-400 p-2 text-sm border border-red-900 rounded bg-red-900/10">Failed to render diagram. Syntax might be invalid.</div>`);
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div 
      ref={containerRef}
      className="my-8 flex justify-center bg-surface/30 rounded-lg p-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export default Mermaid;