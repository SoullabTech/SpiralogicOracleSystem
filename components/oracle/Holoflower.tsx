// Holoflower Visualization - Matches the Spiralogic aesthetic
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HoloflowerProps {
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  spiralStage: {
    element: 'fire' | 'water' | 'earth' | 'air';
    stage: 1 | 2 | 3;
  };
  size?: number;
  animated?: boolean;
}

export const Holoflower: React.FC<HoloflowerProps> = ({
  elementalBalance,
  spiralStage,
  size = 500,
  animated = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = size;
    const height = size;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.15;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Define the 12 wedges matching the holoflower image
    const wedgeData = [
      // Air (yellow/gold) - Upper left quadrant
      { element: 'air', stage: 3, index: 0, startAngle: -Math.PI, endAngle: -5*Math.PI/6 },
      { element: 'air', stage: 2, index: 1, startAngle: -5*Math.PI/6, endAngle: -2*Math.PI/3 },
      { element: 'air', stage: 1, index: 2, startAngle: -2*Math.PI/3, endAngle: -Math.PI/2 },
      
      // Fire (red/orange) - Upper right quadrant
      { element: 'fire', stage: 1, index: 3, startAngle: -Math.PI/2, endAngle: -Math.PI/3 },
      { element: 'fire', stage: 2, index: 4, startAngle: -Math.PI/3, endAngle: -Math.PI/6 },
      { element: 'fire', stage: 3, index: 5, startAngle: -Math.PI/6, endAngle: 0 },
      
      // Water (blue) - Lower right quadrant
      { element: 'water', stage: 1, index: 6, startAngle: 0, endAngle: Math.PI/6 },
      { element: 'water', stage: 2, index: 7, startAngle: Math.PI/6, endAngle: Math.PI/3 },
      { element: 'water', stage: 3, index: 8, startAngle: Math.PI/3, endAngle: Math.PI/2 },
      
      // Earth (green) - Lower left quadrant
      { element: 'earth', stage: 3, index: 9, startAngle: Math.PI/2, endAngle: 2*Math.PI/3 },
      { element: 'earth', stage: 2, index: 10, startAngle: 2*Math.PI/3, endAngle: 5*Math.PI/6 },
      { element: 'earth', stage: 1, index: 11, startAngle: 5*Math.PI/6, endAngle: Math.PI }
    ];

    // Color palettes matching the holoflower image
    const elementColors = {
      fire: ['#C85450', '#B8524E', '#A84E4A'],  // Light to dark red
      water: ['#6B9BD1', '#5A89C0', '#4A77AE'],  // Light to dark blue
      earth: ['#7A9A65', '#6B8B56', '#5C7C47'],  // Light to dark green
      air: ['#D4B896', '#C5A987', '#B69A78']     // Light to dark gold
    };

    // Create arc generators for different radii
    const createArc = (innerR: number, outerR: number) => 
      d3.arc()
        .innerRadius(innerR)
        .outerRadius(outerR)
        .cornerRadius(3);

    // Draw wedges
    const wedges = g.selectAll('.wedge')
      .data(wedgeData)
      .enter()
      .append('g')
      .attr('class', 'wedge');

    wedges.each(function(d) {
      const wedgeGroup = d3.select(this);
      const colors = elementColors[d.element];
      const stageColor = colors[d.stage - 1];
      
      // Calculate dynamic radius based on elemental balance
      const elementStrength = elementalBalance[d.element];
      const radiusMultiplier = 0.7 + (elementStrength * 0.3);
      const wedgeOuterRadius = outerRadius * radiusMultiplier;
      
      // Main wedge
      const arc = createArc(innerRadius, wedgeOuterRadius);
      
      const wedgePath = wedgeGroup.append('path')
        .attr('d', arc({
          startAngle: d.startAngle,
          endAngle: d.endAngle,
          innerRadius,
          outerRadius: wedgeOuterRadius
        }) as string)
        .attr('fill', stageColor)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 0.85);

      // Highlight active wedge
      if (d.element === spiralStage.element && d.stage === spiralStage.stage) {
        wedgePath
          .attr('opacity', 1)
          .attr('stroke', '#fff')
          .attr('stroke-width', 3);

        // Add glow effect
        wedgeGroup.append('path')
          .attr('d', arc({
            startAngle: d.startAngle,
            endAngle: d.endAngle,
            innerRadius: innerRadius - 5,
            outerRadius: wedgeOuterRadius + 5
          }) as string)
          .attr('fill', 'none')
          .attr('stroke', stageColor)
          .attr('stroke-width', 2)
          .attr('opacity', 0.5)
          .attr('filter', 'blur(4px)');
      }

      // Animate wedge growth
      if (animated) {
        wedgePath
          .attr('transform', 'scale(0)')
          .transition()
          .duration(800)
          .delay(d.index * 50)
          .ease(d3.easeCubicOut)
          .attr('transform', 'scale(1)');
      }
    });

    // Draw center mandala (rainbow spiral)
    const centerGroup = g.append('g');
    
    // Create gradient for center
    const defs = svg.append('defs');
    
    const radialGradient = defs.append('radialGradient')
      .attr('id', 'centerGradient');

    const gradientStops = [
      { offset: '0%', color: '#FFD700', opacity: 1 },
      { offset: '20%', color: '#FF6B35', opacity: 0.9 },
      { offset: '40%', color: '#E91E63', opacity: 0.8 },
      { offset: '60%', color: '#9C27B0', opacity: 0.7 },
      { offset: '80%', color: '#3F51B5', opacity: 0.6 },
      { offset: '100%', color: '#00BCD4', opacity: 0.5 }
    ];

    gradientStops.forEach(stop => {
      radialGradient.append('stop')
        .attr('offset', stop.offset)
        .attr('stop-color', stop.color)
        .attr('stop-opacity', stop.opacity);
    });

    // Center circle with Aether representation
    const aetherRadius = innerRadius * (0.5 + elementalBalance.aether);
    
    centerGroup.append('circle')
      .attr('r', aetherRadius)
      .attr('fill', 'url(#centerGradient)')
      .attr('opacity', 0.8);

    // Add spiral dots pattern in center
    const spiralPoints = [];
    const numPoints = 50;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 4;
      const radius = (i / numPoints) * aetherRadius * 0.8;
      spiralPoints.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 1 + (i / numPoints) * 2
      });
    }

    centerGroup.selectAll('.spiral-dot')
      .data(spiralPoints)
      .enter()
      .append('circle')
      .attr('class', 'spiral-dot')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.size)
      .attr('fill', '#FFD700')
      .attr('opacity', d => 0.3 + (d.size / 3) * 0.7);

    // Add radial lines
    wedgeData.forEach(d => {
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', Math.cos(d.startAngle) * outerRadius)
        .attr('y2', Math.sin(d.startAngle) * outerRadius)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 0.5);
    });

    // Add floating particles effect
    if (animated) {
      const particles = g.append('g').attr('class', 'particles');
      
      const particleData = d3.range(20).map(() => ({
        angle: Math.random() * Math.PI * 2,
        radius: innerRadius + Math.random() * (outerRadius - innerRadius),
        size: 1 + Math.random() * 3,
        element: ['fire', 'water', 'earth', 'air'][Math.floor(Math.random() * 4)]
      }));

      particles.selectAll('.particle')
        .data(particleData)
        .enter()
        .append('circle')
        .attr('class', 'particle')
        .attr('cx', d => Math.cos(d.angle) * d.radius)
        .attr('cy', d => Math.sin(d.angle) * d.radius)
        .attr('r', d => d.size)
        .attr('fill', d => elementColors[d.element as keyof typeof elementColors][0])
        .attr('opacity', 0)
        .transition()
        .duration(2000)
        .attr('opacity', 0.6)
        .transition()
        .duration(2000)
        .attr('opacity', 0)
        .on('end', function repeat() {
          d3.select(this)
            .transition()
            .duration(2000)
            .attr('opacity', 0.6)
            .transition()
            .duration(2000)
            .attr('opacity', 0)
            .on('end', repeat);
        });
    }

    // Rotation animation for center
    if (animated) {
      const rotateCenter = () => {
        centerGroup
          .transition()
          .duration(30000)
          .ease(d3.easeLinear)
          .attr('transform', 'rotate(360)')
          .on('end', () => {
            centerGroup.attr('transform', 'rotate(0)');
            rotateCenter();
          });
      };
      rotateCenter();
    }

  }, [elementalBalance, spiralStage, size, animated]);

  return (
    <div className="holoflower-container" style={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
    }}>
      <svg 
        ref={svgRef}
        width={size}
        height={size}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default Holoflower;