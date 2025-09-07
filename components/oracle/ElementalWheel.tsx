// Elemental Wheel Visualization Component
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

interface ElementalWheelProps {
  balance: ElementalBalance;
  size?: number;
  animated?: boolean;
  showLabels?: boolean;
}

export const ElementalWheel: React.FC<ElementalWheelProps> = ({
  balance,
  size = 300,
  animated = true,
  showLabels = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2 - 20;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Element data with colors
    const elements = [
      { name: 'fire', value: balance.fire, color: '#FF6B35', symbol: '🔥' },
      { name: 'water', value: balance.water, color: '#4A90E2', symbol: '💧' },
      { name: 'earth', value: balance.earth, color: '#7B4B2A', symbol: '🌍' },
      { name: 'air', value: balance.air, color: '#87CEEB', symbol: '💨' },
      { name: 'aether', value: balance.aether, color: '#9B59B6', symbol: '✨' }
    ];

    // Create scales
    const angleScale = d3.scaleLinear()
      .domain([0, elements.length])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius]);

    // Draw background circles
    [0.2, 0.4, 0.6, 0.8, 1].forEach(level => {
      g.append('circle')
        .attr('r', radiusScale(level))
        .attr('fill', 'none')
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3);
    });

    // Draw spokes
    elements.forEach((_, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', Math.cos(angle) * radius)
        .attr('y2', Math.sin(angle) * radius)
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3);
    });

    // Create radar path
    const radarLine = d3.lineRadial<typeof elements[0]>()
      .angle((_, i) => angleScale(i) - Math.PI / 2)
      .radius(d => radiusScale(d.value))
      .curve(d3.curveCardinalClosed);

    // Draw filled radar area
    const radarPath = g.append('path')
      .datum(elements)
      .attr('d', radarLine as any)
      .attr('fill', 'url(#elementalGradient)')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#8B4789')
      .attr('stroke-width', 2);

    if (animated) {
      // Animate the radar growth
      radarPath
        .attr('transform', 'scale(0)')
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('transform', 'scale(1)');
    }

    // Draw element nodes
    const nodes = g.selectAll('.element-node')
      .data(elements)
      .enter()
      .append('g')
      .attr('class', 'element-node')
      .attr('transform', (d, i) => {
        const angle = angleScale(i) - Math.PI / 2;
        const x = Math.cos(angle) * radiusScale(d.value);
        const y = Math.sin(angle) * radiusScale(d.value);
        return `translate(${x},${y})`;
      });

    // Add circles at data points
    nodes.append('circle')
      .attr('r', animated ? 0 : 8)
      .attr('fill', d => d.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .transition()
      .duration(animated ? 1200 : 0)
      .delay((_, i) => i * 100)
      .attr('r', 8);

    // Add element labels
    if (showLabels) {
      elements.forEach((el, i) => {
        const angle = angleScale(i) - Math.PI / 2;
        const labelRadius = radius + 30;
        const x = Math.cos(angle) * labelRadius;
        const y = Math.sin(angle) * labelRadius;

        const label = g.append('g')
          .attr('transform', `translate(${x},${y})`);

        // Add symbol
        label.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '20px')
          .text(el.symbol);

        // Add name
        label.append('text')
          .attr('y', 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', '#666')
          .text(el.name.charAt(0).toUpperCase() + el.name.slice(1));

        // Add value
        label.append('text')
          .attr('y', 32)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#999')
          .text((el.value * 100).toFixed(0) + '%');
      });
    }

    // Add center aether indicator
    const aetherGroup = g.append('g');
    
    aetherGroup.append('circle')
      .attr('r', radiusScale(balance.aether) * 0.3)
      .attr('fill', 'url(#aetherGradient)')
      .attr('opacity', 0.6);

    aetherGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '24px')
      .text('✨')
      .attr('opacity', balance.aether);

    // Define gradients
    const defs = svg.append('defs');

    const elementalGradient = defs.append('radialGradient')
      .attr('id', 'elementalGradient');

    elementalGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#9B59B6')
      .attr('stop-opacity', 0.8);

    elementalGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8B4789')
      .attr('stop-opacity', 0.3);

    const aetherGradient = defs.append('radialGradient')
      .attr('id', 'aetherGradient');

    aetherGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#E8D5F2')
      .attr('stop-opacity', 1);

    aetherGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#9B59B6')
      .attr('stop-opacity', 0.3);

  }, [balance, size, animated, showLabels]);

  return (
    <div className="elemental-wheel-container">
      <svg 
        ref={svgRef} 
        width={size} 
        height={size}
        style={{ display: 'block', margin: '0 auto' }}
      />
    </div>
  );
};

export default ElementalWheel;