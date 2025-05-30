import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState } from 'react';
import { AstrologicalHoloflower } from '../core/AstrologicalHoloflower';
import { motion } from 'framer-motion';
import { astrologicalService } from '../services/astrologicalService';
export const AstrologicalHoloflowerVisualization = ({ userId, birthData, showPlanetaryInfluences = true, showNatalStrengths = true, onHouseClick }) => {
    const svgRef = useRef(null);
    const [holoflower] = useState(() => new AstrologicalHoloflower());
    const [state, setState] = useState(holoflower.getAstrologicalState());
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [hoveredHouse, setHoveredHouse] = useState(null);
    const [showTransits, setShowTransits] = useState(true);
    const [showNatal, setShowNatal] = useState(true);
    const [showSpiralogic, setShowSpiralogic] = useState(true);
    const [currentPlanets, setCurrentPlanets] = useState(new Map());
    const width = 1000;
    const height = 1000;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = 280;
    // Initialize with birth data if provided
    useEffect(() => {
        if (birthData) {
            holoflower.setNatalChart(birthData);
            setState(holoflower.getAstrologicalState());
        }
    }, [birthData, holoflower]);
    // Update current transits periodically
    useEffect(() => {
        const updateTransits = async () => {
            if (userId) {
                const astroData = await astrologicalService.getUserAstrologicalState(userId);
                if (astroData && astroData.currentTransits) {
                    // Update holoflower with current transits
                    const transitMap = new Map();
                    astroData.currentTransits.forEach(transit => {
                        transitMap.set(transit.planet, {
                            sign: transit.sign,
                            degree: transit.degree,
                            retrograde: transit.retrograde
                        });
                    });
                    holoflower.updateCurrentTransits(transitMap);
                    setState(holoflower.getAstrologicalState());
                    setCurrentPlanets(transitMap);
                }
            }
        };
        updateTransits();
        const interval = setInterval(updateTransits, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [userId, holoflower]);
    // Planet symbols
    const planetSymbols = {
        sun: '☉',
        moon: '☽',
        mercury: '☿',
        venus: '♀',
        mars: '♂',
        jupiter: '♃',
        saturn: '♄',
        uranus: '♅',
        neptune: '♆',
        pluto: '♇',
        north_node: '☊',
        chiron: '⚷'
    };
    // Zodiac colors
    const zodiacColors = {
        aries: '#FF0000',
        taurus: '#228B22',
        gemini: '#FFD700',
        cancer: '#C0C0C0',
        leo: '#FFA500',
        virgo: '#8B4513',
        libra: '#FFB6C1',
        scorpio: '#8B0000',
        sagittarius: '#9370DB',
        capricorn: '#2F4F4F',
        aquarius: '#00CED1',
        pisces: '#4169E1'
    };
    const renderHouse = (house) => {
        const visualData = holoflower.exportAstrologicalData();
        const houseVis = visualData.houses.find(h => h.number === house.number);
        const isSelected = selectedHouse?.number === house.number;
        const isHovered = hoveredHouse?.number === house.number;
        const hasTransit = house.currentTransits.length > 0;
        const hasNatalPlanet = house.natalPlanets.length > 0;
        // Calculate position with slight spiral for Spiralogic stages
        const spiralOffset = showSpiralogic ? (house.spiralogicStage - 1) * 2 : 0;
        const radius = baseRadius + spiralOffset;
        const angle = ((house.number - 1) * 30 - 90) * Math.PI / 180;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        return (_jsxs(motion.g, { initial: { scale: 0, opacity: 0 }, animate: {
                scale: isSelected ? 1.2 : (isHovered ? 1.1 : 1),
                opacity: 1
            }, transition: {
                duration: 0.3,
                delay: house.number * 0.05
            }, children: [showTransits && hasTransit && (_jsx(motion.circle, { cx: x, cy: y, r: 40, fill: "none", stroke: "#FFD700", strokeWidth: 3, strokeDasharray: "5,3", opacity: house.transitActivation, animate: {
                        rotate: 360,
                        scale: [1, 1.1, 1]
                    }, transition: {
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity }
                    } })), showNatal && hasNatalPlanet && (_jsx("circle", { cx: x, cy: y, r: 35, fill: "none", stroke: "#87CEEB", strokeWidth: 2, opacity: house.natalStrength })), _jsx(motion.circle, { cx: x, cy: y, r: 30, fill: house.color, fillOpacity: 0.3 + house.currentIntensity * 0.7, stroke: isSelected ? '#FFD700' : (isHovered ? '#FFFFFF' : house.color), strokeWidth: isSelected ? 4 : (isHovered ? 3 : 2), style: { cursor: 'pointer' }, onMouseEnter: () => setHoveredHouse(house), onMouseLeave: () => setHoveredHouse(null), onClick: () => handleHouseClick(house), whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } }), _jsx("text", { x: x, y: y - 8, textAnchor: "middle", alignmentBaseline: "middle", fill: "white", fontSize: "16", fontWeight: "bold", style: { pointerEvents: 'none' }, children: house.number }), _jsx("text", { x: x, y: y + 10, textAnchor: "middle", alignmentBaseline: "middle", fill: "white", fontSize: "14", style: { pointerEvents: 'none' }, children: house.sacredSymbol }), showTransits && house.currentTransits.map((transit, index) => (_jsx("text", { x: x + 25, y: y + index * 12 - 10, fill: "#FFD700", fontSize: "12", style: { pointerEvents: 'none' }, children: planetSymbols[transit.planet] }, transit.planet))), showNatal && house.natalPlanets.map((natal, index) => (_jsx("text", { x: x - 25, y: y + index * 12 - 10, fill: "#87CEEB", fontSize: "12", style: { pointerEvents: 'none' }, children: planetSymbols[natal.planet] }, natal.planet)))] }, house.number));
    };
    const renderZodiacWheel = () => {
        const signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];
        return signs.map((sign, index) => {
            const angle = index * 30 * Math.PI / 180;
            const textRadius = baseRadius + 60;
            const x = centerX + Math.cos(angle - Math.PI / 2) * textRadius;
            const y = centerY + Math.sin(angle - Math.PI / 2) * textRadius;
            return (_jsx("text", { x: x, y: y, textAnchor: "middle", alignmentBaseline: "middle", fill: zodiacColors[sign.toLowerCase()], fontSize: "14", fontWeight: "bold", opacity: 0.7, children: sign }, sign));
        });
    };
    const renderCurrentPlanets = () => {
        if (!showPlanetaryInfluences)
            return null;
        const planets = Array.from(currentPlanets.entries());
        return (_jsx("g", { className: "current-planets", children: planets.map(([planet, position], index) => {
                const radius = baseRadius - 40;
                const angle = (this.getAbsoluteDegree(position.sign, position.degree) - 90) * Math.PI / 180;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                return (_jsxs(motion.g, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { delay: index * 0.1 }, children: [_jsx("circle", { cx: x, cy: y, r: 15, fill: zodiacColors[position.sign], fillOpacity: 0.3, stroke: zodiacColors[position.sign], strokeWidth: 2 }), _jsx("text", { x: x, y: y, textAnchor: "middle", alignmentBaseline: "middle", fill: "white", fontSize: "16", fontWeight: "bold", children: planetSymbols[planet] }), position.retrograde && (_jsx("text", { x: x + 10, y: y - 10, fill: "#FF6B6B", fontSize: "10", fontWeight: "bold", children: "R" }))] }, planet));
            }) }));
    };
    const renderSpiralogicSpiral = () => {
        if (!showSpiralogic)
            return null;
        const points = [];
        for (let i = 0; i <= 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const radius = baseRadius + i * 2;
            points.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
        const pathData = points
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');
        return (_jsx(motion.path, { d: pathData, fill: "none", stroke: "#FFD700", strokeWidth: 1, strokeDasharray: "3,3", opacity: 0.3, initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 2 } }));
    };
    const handleHouseClick = (house) => {
        setSelectedHouse(house);
        onHouseClick?.(house);
    };
    // Helper function to get absolute degree
    const getAbsoluteDegree = (sign, degree) => {
        const signs = [
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        const signIndex = signs.indexOf(sign);
        return signIndex * 30 + degree;
    };
    return (_jsxs("div", { className: "astrological-holoflower-container", children: [_jsxs("div", { className: "controls", children: [_jsx("button", { className: showTransits ? 'active' : '', onClick: () => setShowTransits(!showTransits), children: "Current Transits" }), _jsx("button", { className: showNatal ? 'active' : '', onClick: () => setShowNatal(!showNatal), children: "Natal Planets" }), _jsx("button", { className: showSpiralogic ? 'active' : '', onClick: () => setShowSpiralogic(!showSpiralogic), children: "Spiralogic Stages" }), _jsx("button", { onClick: () => holoflower.integratePhiSpiral(), children: "Activate Phi Spiral" })] }), _jsxs("svg", { ref: svgRef, width: width, height: height, style: {
                    background: 'radial-gradient(circle at center, #1a1a2e 0%, #0f0f1e 100%)',
                    borderRadius: '50%'
                }, children: [_jsx("circle", { cx: centerX, cy: centerY, r: baseRadius + 80, fill: "none", stroke: "#333", strokeWidth: 1, opacity: 0.5 }), Array.from({ length: 12 }, (_, i) => {
                        const angle = (i * 30 - 90) * Math.PI / 180;
                        const x1 = centerX + Math.cos(angle) * (baseRadius - 50);
                        const y1 = centerY + Math.sin(angle) * (baseRadius - 50);
                        const x2 = centerX + Math.cos(angle) * (baseRadius + 80);
                        const y2 = centerY + Math.sin(angle) * (baseRadius + 80);
                        return (_jsx("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#333", strokeWidth: 1, opacity: 0.3 }, i));
                    }), renderZodiacWheel(), renderSpiralogicSpiral(), renderCurrentPlanets(), renderCenterSpiral(), state.houses.map(renderHouse), showPlanetaryInfluences && renderCurrentAspects()] }), selectedHouse && (_jsxs("div", { className: "house-details-panel", children: [_jsxs("h2", { children: ["House ", selectedHouse.number] }), _jsx("h3", { children: selectedHouse.astrologicalMeaning }), _jsxs("div", { className: "detail-section", children: [_jsx("h4", { children: "Life Area" }), _jsx("p", { children: selectedHouse.lifeArea })] }), _jsxs("div", { className: "detail-section", children: [_jsxs("h4", { children: ["Spiralogic Stage ", selectedHouse.spiralogicStage] }), _jsxs("p", { children: [_jsx("strong", { children: "Theme:" }), " ", selectedHouse.developmentalTheme] }), _jsxs("p", { children: [_jsx("strong", { children: "Goal:" }), " ", selectedHouse.evolutionaryGoal] })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h4", { children: "Elemental Alchemy" }), _jsxs("p", { children: [_jsx("strong", { children: "Element:" }), " ", selectedHouse.element, " ", selectedHouse.sacredSymbol] }), _jsxs("p", { children: [_jsx("strong", { children: "Phase:" }), " ", selectedHouse.phase] }), _jsxs("p", { children: [_jsx("strong", { children: "Process:" }), " ", selectedHouse.alchemicalProcess] }), _jsxs("p", { children: [_jsx("strong", { children: "Consciousness:" }), " ", selectedHouse.consciousnessLevel] })] }), selectedHouse.currentTransits.length > 0 && (_jsxs("div", { className: "detail-section", children: [_jsx("h4", { children: "Current Transits" }), selectedHouse.currentTransits.map(transit => (_jsxs("p", { children: [planetSymbols[transit.planet], " ", transit.planet, " in ", transit.sign, ": ", transit.influence] }, transit.planet)))] })), selectedHouse.natalPlanets.length > 0 && (_jsxs("div", { className: "detail-section", children: [_jsx("h4", { children: "Natal Planets" }), selectedHouse.natalPlanets.map(natal => (_jsxs("p", { children: [planetSymbols[natal.planet], " ", natal.planet, ": ", natal.interpretation] }, natal.planet)))] })), _jsxs("div", { className: "detail-section", children: [_jsx("h4", { children: "Shadow & Gift" }), _jsxs("p", { children: [_jsx("strong", { children: "Shadow:" }), " ", selectedHouse.shadowAspect] }), _jsxs("p", { children: [_jsx("strong", { children: "Gift:" }), " ", selectedHouse.giftAspect] })] })] })), _jsx("style", { jsx: true, children: `
        .astrological-holoflower-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: #0a0a0f;
          color: white;
          position: relative;
        }
        
        .controls {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          align-items: center;
          z-index: 10;
        }
        
        .controls button {
          padding: 8px 16px;
          background: #2a2a3e;
          border: 1px solid #FFD700;
          color: #FFD700;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .controls button.active,
        .controls button:hover {
          background: #3a3a4e;
          transform: translateY(-2px);
        }
        
        .house-details-panel {
          position: absolute;
          top: 100px;
          right: 20px;
          background: rgba(42, 42, 62, 0.95);
          padding: 25px;
          border-radius: 12px;
          border: 2px solid #FFD700;
          max-width: 350px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
        }
        
        .house-details-panel h2 {
          margin: 0 0 5px 0;
          color: #FFD700;
          font-size: 24px;
        }
        
        .house-details-panel h3 {
          margin: 0 0 20px 0;
          color: #87CEEB;
          font-size: 18px;
          font-weight: normal;
        }
        
        .detail-section {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        }
        
        .detail-section:last-child {
          border-bottom: none;
        }
        
        .detail-section h4 {
          margin: 0 0 10px 0;
          color: #FFD700;
          font-size: 16px;
        }
        
        .detail-section p {
          margin: 5px 0;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .detail-section strong {
          color: #87CEEB;
        }
      ` })] }));
};
// Helper component for center spiral
const renderCenterSpiral = () => {
    return (_jsxs(motion.g, { children: [_jsx(motion.circle, { cx: 500, cy: 500, r: 60, fill: "url(#centerGradient)", fillOpacity: 0.3, animate: {
                    scale: [1, 1.1, 1],
                    rotate: 360
                }, transition: {
                    scale: { duration: 3, repeat: Infinity },
                    rotate: { duration: 60, repeat: Infinity, ease: "linear" }
                } }), _jsx("defs", { children: _jsxs("radialGradient", { id: "centerGradient", children: [_jsx("stop", { offset: "0%", stopColor: "#FFD700" }), _jsx("stop", { offset: "50%", stopColor: "#FFA500" }), _jsx("stop", { offset: "100%", stopColor: "#FF6347" })] }) })] }));
};
// Helper component for current aspects
const renderCurrentAspects = () => {
    // Would render lines between planets forming aspects
    return null;
};
