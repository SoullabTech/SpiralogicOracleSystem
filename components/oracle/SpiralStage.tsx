// Spiral Stage Visualization - 12-Wedge Spiralogic Wheel
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SpiralStageProps {
  element: 'fire' | 'water' | 'earth' | 'air';
  stage: 1 | 2 | 3;
  size?: number;
  animated?: boolean;
  showPath?: boolean;
  previousStages?: Array<{ element: string; stage: number }>;
}

export const SpiralStage: React.FC<SpiralStageProps> = ({
  element,
  stage,
  size = 400,
  animated = true,
  showPath = false,
  previousStages = []
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = size;
    const height = size;
    const outerRadius = Math.min(width, height) / 2 - 40;
    const innerRadius = outerRadius * 0.3;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Define the 12 wedges (3 stages × 4 elements)
    const wedgeData = [
      // Fire (12 o'clock to 3 o'clock)
      { element: 'fire', stage: 1, startAngle: -Math.PI/2, endAngle: -Math.PI/3 },
      { element: 'fire', stage: 2, startAngle: -Math.PI/3, endAngle: -Math.PI/6 },
      { element: 'fire', stage: 3, startAngle: -Math.PI/6, endAngle: 0 },
      
      // Water (3 o'clock to 6 o'clock)
      { element: 'water', stage: 1, startAngle: 0, endAngle: Math.PI/6 },
      { element: 'water', stage: 2, startAngle: Math.PI/6, endAngle: Math.PI/3 },
      { element: 'water', stage: 3, startAngle: Math.PI/3, endAngle: Math.PI/2 },
      
      // Earth (6 o'clock to 9 o'clock)
      { element: 'earth', stage: 1, startAngle: Math.PI/2, endAngle: 2*Math.PI/3 },
      { element: 'earth', stage: 2, startAngle: 2*Math.PI/3, endAngle: 5*Math.PI/6 },
      { element: 'earth', stage: 3, startAngle: 5*Math.PI/6, endAngle: Math.PI },
      
      // Air (9 o'clock to 12 o'clock)
      { element: 'air', stage: 1, startAngle: Math.PI, endAngle: 7*Math.PI/6 },
      { element: 'air', stage: 2, startAngle: 7*Math.PI/6, endAngle: 4*Math.PI/3 },
      { element: 'air', stage: 3, startAngle: 4*Math.PI/3, endAngle: 3*Math.PI/2 }
    ];

    // Element colors
    const elementColors: Record<string, string> = {
      fire: '#FF6B35',
      water: '#4A90E2',
      earth: '#7B4B2A',
      air: '#87CEEB'
    };

    // Stage labels
    const stageLabels: Record<number, string> = {
      1: 'Recognition',
      2: 'Deepening',
      3: 'Integration'
    };

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    // Draw all wedges
    const wedges = g.selectAll('.wedge')
      .data(wedgeData)
      .enter()
      .append('g')
      .attr('class', 'wedge');

    wedges.append('path')
      .attr('d', d => arc({
        startAngle: d.startAngle,
        endAngle: d.endAngle,
        innerRadius,
        outerRadius
      }) as string)
      .attr('fill', d => {
        const isActive = d.element === element && d.stage === stage;
        const isPrevious = previousStages.some(p => 
          p.element === d.element && p.stage === d.stage
        );
        
        if (isActive) {
          return elementColors[d.element];
        } else if (isPrevious) {
          return d3.color(elementColors[d.element])?.darker(1).toString() || '#666';
        } else {
          return '#f0f0f0';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', d => {
        const isActive = d.element === element && d.stage === stage;
        return isActive ? 1 : 0.3;
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('transform', 'scale(1.05)');
      })
      .on('mouseout', function(event, d) {
        const isActive = d.element === element && d.stage === stage;
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', isActive ? 1 : 0.3)
          .attr('transform', 'scale(1)');
      });

    // Add labels for active wedge
    wedgeData.forEach(d => {
      if (d.element === element && d.stage === stage) {
        const midAngle = (d.startAngle + d.endAngle) / 2;
        const labelRadius = (innerRadius + outerRadius) / 2;
        const x = Math.cos(midAngle) * labelRadius;
        const y = Math.sin(midAngle) * labelRadius;

        const label = g.append('g')
          .attr('transform', `translate(${x},${y})`);

        label.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'white')
          .attr('font-weight', 'bold')
          .attr('font-size', '14px')
          .text(d.element.toUpperCase());

        label.append('text')
          .attr('y', 16)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .text(`Stage ${d.stage}`);
      }
    });

    // Draw journey path if enabled
    if (showPath && previousStages.length > 0) {
      const pathData = [...previousStages, { element, stage }].map(p => {
        const wedge = wedgeData.find(w => w.element === p.element && w.stage === p.stage);
        if (wedge) {
          const midAngle = (wedge.startAngle + wedge.endAngle) / 2;
          const pathRadius = (innerRadius + outerRadius) / 2;
          return {
            x: Math.cos(midAngle) * pathRadius,
            y: Math.sin(midAngle) * pathRadius
          };
        }
        return { x: 0, y: 0 };
      });

      const line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveCatmullRom);

      g.append('path')
        .datum(pathData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', '#9B59B6')
        .attr('stroke-width', 3)
        .attr('opacity', 0.6)
        .attr('stroke-dasharray', '5,5');
    }

    // Add center circle with current stage info
    const centerGroup = g.append('g');

    centerGroup.append('circle')
      .attr('r', innerRadius - 10)
      .attr('fill', 'white')
      .attr('stroke', elementColors[element])
      .attr('stroke-width', 3);

    // Element symbol in center
    const elementSymbols: Record<string, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨'
    };

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '32px')
      .text(elementSymbols[element]);

    centerGroup.append('text')
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text(stageLabels[stage]);

    // Add outer ring labels
    const elements = ['fire', 'water', 'earth', 'air'];
    const elementAngles = [
      -Math.PI/4,  // Fire (top-right)
      Math.PI/4,   // Water (bottom-right)
      3*Math.PI/4, // Earth (bottom-left)
      -3*Math.PI/4 // Air (top-left)
    ];

    elements.forEach((el, i) => {
      const angle = elementAngles[i];
      const labelRadius = outerRadius + 25;
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', el === element ? 'bold' : 'normal')
        .attr('fill', el === element ? elementColors[el] : '#999')
        .text(el.charAt(0).toUpperCase() + el.slice(1));
    });

    // Animate current wedge
    if (animated) {
      const activeWedge = wedges.filter(d => 
        d.element === element && d.stage === stage
      );

      activeWedge.select('path')
        .attr('transform', 'scale(0)')
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('transform', 'scale(1)');

      // Pulse animation
      const pulse = () => {
        activeWedge.select('path')
          .transition()
          .duration(2000)
          .attr('opacity', 0.7)
          .transition()
          .duration(2000)
          .attr('opacity', 1)
          .on('end', pulse);
      };
      
      setTimeout(pulse, 1000);
    }

  }, [element, stage, size, animated, showPath, previousStages]);

  return (
    <div className="spiral-stage-container">
      <svg 
        ref={svgRef}
        width={size}
        height={size}
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  );
};

export default SpiralStage;