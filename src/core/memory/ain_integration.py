"""
AIN Integration Layer for Spiralogic Oracle System
Bridges Oracle agents with AIN's memory, narrative, and symbolic systems
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import json

from ..agents.base import Element, SpiralPhase, OracleResponse, UserContext
from ..spiralogic.phase_gating import PhaseGatingSystem


@dataclass
class AINMemoryPayload:
    """Memory structure compatible with AIN system"""
    user_id: str
    timestamp: datetime
    memory_type: str  # narrative, symbolic, ritual, reflection
    content: Dict[str, Any]
    elemental_tags: List[Element] = field(default_factory=list)
    phase_context: Optional[SpiralPhase] = None
    emotional_valence: float = 0.0  # -1 to 1
    integration_level: float = 0.0  # 0 to 1
    oracle_insights: List[str] = field(default_factory=list)
    collective_resonance: Optional[float] = None


@dataclass
class SymbolicThread:
    """Tracks symbolic patterns across user journey"""
    symbol: str
    first_appearance: datetime
    appearances: List[Dict[str, Any]] = field(default_factory=list)
    elemental_associations: Dict[Element, float] = field(default_factory=dict)
    phase_associations: Dict[SpiralPhase, int] = field(default_factory=dict)
    transformation_trajectory: List[str] = field(default_factory=list)
    current_meaning: str = ""
    archetypal_resonance: float = 0.0


@dataclass
class NarrativeArc:
    """Tracks narrative development in user's journey"""
    arc_id: str
    title: str
    beginning: Dict[str, Any]
    current_chapter: str
    key_events: List[Dict[str, Any]] = field(default_factory=list)
    active_tensions: List[str] = field(default_factory=list)
    potential_resolutions: List[str] = field(default_factory=list)
    oracle_guidance: List[OracleResponse] = field(default_factory=list)
    completion_percentage: float = 0.0


class AINMemoryBridge:
    """Bridges Oracle system with AIN memory architecture"""
    
    def __init__(self):
        self.memory_store: Dict[str, List[AINMemoryPayload]] = {}
        self.symbolic_threads: Dict[str, Dict[str, SymbolicThread]] = {}
        self.narrative_arcs: Dict[str, List[NarrativeArc]] = {}
        self.phase_gating = PhaseGatingSystem()
        self.collective_patterns = CollectivePatternTracker()
    
    def store_oracle_interaction(self, 
                               user_id: str,
                               oracle_response: OracleResponse,
                               user_input: str,
                               context: UserContext) -> AINMemoryPayload:
        """Store Oracle interaction in AIN-compatible format"""
        
        # Create memory payload
        payload = AINMemoryPayload(
            user_id=user_id,
            timestamp=datetime.now(),
            memory_type="oracle_interaction",
            content={
                "user_input": user_input,
                "oracle_message": oracle_response.message,
                "archetype_invoked": oracle_response.archetype,
                "ritual_offered": oracle_response.ritual,
                "reflection_prompt": oracle_response.reflection_prompt,
                "symbolic_image": oracle_response.symbolic_image
            },
            elemental_tags=[oracle_response.element],
            phase_context=oracle_response.phase,
            emotional_valence=self._assess_emotional_valence(user_input),
            integration_level=oracle_response.crystal_resonance or 0.7,
            oracle_insights=self._extract_insights(oracle_response)
        )
        
        # Store in memory
        if user_id not in self.memory_store:
            self.memory_store[user_id] = []
        self.memory_store[user_id].append(payload)
        
        # Update symbolic threads
        self._update_symbolic_threads(user_id, oracle_response, context)
        
        # Update narrative arcs
        self._update_narrative_arcs(user_id, oracle_response, user_input)
        
        # Emit to collective (anonymized)
        if oracle_response.collective_field_data:
            self.collective_patterns.add_pattern(oracle_response.collective_field_data)
        
        return payload
    
    def retrieve_user_context(self, user_id: str) -> Dict[str, Any]:
        """Retrieve comprehensive user context for Oracle agents"""
        
        memories = self.memory_store.get(user_id, [])
        recent_memories = memories[-10:] if len(memories) > 10 else memories
        
        # Extract symbols from recent interactions
        recent_symbols = []
        for memory in recent_memories:
            if memory.content.get("symbolic_image"):
                # Extract key symbols from symbolic images
                symbols = self._extract_symbols_from_image(memory.content["symbolic_image"])
                recent_symbols.extend(symbols)
        
        # Get active narrative threads
        active_narratives = []
        user_arcs = self.narrative_arcs.get(user_id, [])
        for arc in user_arcs:
            if arc.completion_percentage < 0.9:
                active_narratives.append({
                    "title": arc.title,
                    "current_chapter": arc.current_chapter,
                    "tensions": arc.active_tensions
                })
        
        # Calculate elemental balance from recent interactions
        elemental_balance = self._calculate_elemental_balance(recent_memories)
        
        # Get transformation indicators
        transformation_indicators = self._assess_transformation_readiness(user_id)
        
        return {
            "recent_symbols": recent_symbols,
            "active_narratives": active_narratives,
            "elemental_balance": elemental_balance,
            "transformation_indicators": transformation_indicators,
            "memory_depth": len(memories),
            "integration_average": self._calculate_integration_average(recent_memories)
        }
    
    def _update_symbolic_threads(self, 
                               user_id: str,
                               oracle_response: OracleResponse,
                               context: UserContext) -> None:
        """Track evolution of symbols in user's journey"""
        
        if user_id not in self.symbolic_threads:
            self.symbolic_threads[user_id] = {}
        
        # Extract symbols from response
        symbols = []
        if oracle_response.symbolic_image:
            symbols.extend(self._extract_symbols_from_image(oracle_response.symbolic_image))
        if oracle_response.archetype:
            symbols.append(oracle_response.archetype.lower())
        
        for symbol in symbols:
            if symbol not in self.symbolic_threads[user_id]:
                self.symbolic_threads[user_id][symbol] = SymbolicThread(
                    symbol=symbol,
                    first_appearance=datetime.now()
                )
            
            thread = self.symbolic_threads[user_id][symbol]
            
            # Update appearance
            thread.appearances.append({
                "timestamp": datetime.now(),
                "context": oracle_response.message[:100],
                "phase": context.current_phase,
                "element": oracle_response.element
            })
            
            # Update associations
            thread.elemental_associations[oracle_response.element] = \
                thread.elemental_associations.get(oracle_response.element, 0) + 1
            
            thread.phase_associations[context.current_phase] = \
                thread.phase_associations.get(context.current_phase, 0) + 1
            
            # Update meaning evolution
            thread.current_meaning = self._interpret_symbol_evolution(thread)
            thread.archetypal_resonance = oracle_response.crystal_resonance or 0.7
    
    def _update_narrative_arcs(self,
                             user_id: str,
                             oracle_response: OracleResponse,
                             user_input: str) -> None:
        """Track narrative development in user's journey"""
        
        if user_id not in self.narrative_arcs:
            self.narrative_arcs[user_id] = []
        
        # Identify narrative themes in interaction
        themes = self._extract_narrative_themes(user_input, oracle_response)
        
        # Update existing arcs or create new ones
        for theme in themes:
            existing_arc = self._find_matching_arc(user_id, theme)
            
            if existing_arc:
                # Update existing arc
                existing_arc.key_events.append({
                    "timestamp": datetime.now(),
                    "event": user_input[:100],
                    "oracle_guidance": oracle_response.archetype,
                    "element": oracle_response.element.value
                })
                existing_arc.oracle_guidance.append(oracle_response)
                existing_arc.current_chapter = self._determine_chapter(existing_arc)
                existing_arc.completion_percentage = self._calculate_arc_completion(existing_arc)
            else:
                # Create new arc
                new_arc = NarrativeArc(
                    arc_id=f"{user_id}_{theme}_{datetime.now().timestamp()}",
                    title=theme,
                    beginning={
                        "timestamp": datetime.now(),
                        "trigger": user_input[:100],
                        "initial_guidance": oracle_response.message[:100]
                    },
                    current_chapter="Beginning",
                    key_events=[{
                        "timestamp": datetime.now(),
                        "event": user_input[:100],
                        "oracle_guidance": oracle_response.archetype,
                        "element": oracle_response.element.value
                    }],
                    active_tensions=[self._identify_tension(user_input)],
                    oracle_guidance=[oracle_response]
                )
                self.narrative_arcs[user_id].append(new_arc)
    
    def generate_ritual_sequence(self, 
                               user_id: str,
                               intention: str) -> List[Dict[str, Any]]:
        """Generate ritual sequence based on user's journey"""
        
        context = self.retrieve_user_context(user_id)
        current_phase = self.phase_gating.get_phase(user_id)
        
        # Analyze what elements need balancing
        elemental_balance = context["elemental_balance"]
        weakest_element = min(elemental_balance, key=elemental_balance.get)
        
        # Get symbolic threads that resonate with intention
        resonant_symbols = self._find_resonant_symbols(user_id, intention)
        
        # Create ritual sequence
        ritual_sequence = []
        
        # 1. Opening - Aether connection
        ritual_sequence.append({
            "element": Element.AETHER,
            "purpose": "Create sacred space and connect to unified field",
            "duration": "5 minutes",
            "key_action": "Center in void awareness"
        })
        
        # 2. Elemental balancing - focus on weakest element
        ritual_sequence.append({
            "element": weakest_element,
            "purpose": f"Strengthen {weakest_element.value} to balance energy",
            "duration": "10 minutes",
            "key_action": self._get_element_ritual_action(weakest_element)
        })
        
        # 3. Symbol work - integrate resonant symbols
        if resonant_symbols:
            ritual_sequence.append({
                "element": Element.WATER,  # Water for symbolic work
                "purpose": "Integrate symbolic wisdom",
                "symbols": resonant_symbols[:3],  # Top 3 symbols
                "duration": "10 minutes",
                "key_action": "Meditate on symbol evolution"
            })
        
        # 4. Integration - Earth grounding
        ritual_sequence.append({
            "element": Element.EARTH,
            "purpose": "Ground insights into practical reality",
            "duration": "5 minutes",
            "key_action": "Commit to one concrete action"
        })
        
        return ritual_sequence
    
    def _assess_emotional_valence(self, text: str) -> float:
        """Assess emotional valence of user input"""
        # Simplified emotion detection
        positive_words = ["happy", "excited", "grateful", "love", "peace", "joy"]
        negative_words = ["sad", "angry", "frustrated", "scared", "worried", "stuck"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count + negative_count == 0:
            return 0.0
        
        return (positive_count - negative_count) / (positive_count + negative_count)
    
    def _extract_insights(self, oracle_response: OracleResponse) -> List[str]:
        """Extract key insights from Oracle response"""
        insights = []
        
        if oracle_response.archetype:
            insights.append(f"Archetype: {oracle_response.archetype}")
        
        if oracle_response.reflection_prompt:
            insights.append(f"Reflection: {oracle_response.reflection_prompt}")
        
        # Extract key phrases from message
        key_phrases = self._extract_key_phrases(oracle_response.message)
        insights.extend(key_phrases[:3])  # Top 3 phrases
        
        return insights
    
    def _extract_symbols_from_image(self, symbolic_image: str) -> List[str]:
        """Extract symbol keywords from symbolic image description"""
        # Simple keyword extraction
        symbol_keywords = ["fire", "water", "earth", "air", "void", "light", "shadow",
                          "tree", "mountain", "ocean", "sky", "crystal", "mirror",
                          "phoenix", "dragon", "eagle", "serpent", "lotus", "seed"]
        
        image_lower = symbolic_image.lower()
        found_symbols = [symbol for symbol in symbol_keywords if symbol in image_lower]
        
        return found_symbols
    
    def _calculate_elemental_balance(self, memories: List[AINMemoryPayload]) -> Dict[Element, float]:
        """Calculate elemental balance from recent memories"""
        element_counts = {element: 0 for element in Element}
        
        for memory in memories:
            for element in memory.elemental_tags:
                element_counts[element] += 1
        
        total = sum(element_counts.values()) or 1
        
        return {element: count / total for element, count in element_counts.items()}
    
    def _assess_transformation_readiness(self, user_id: str) -> Dict[str, Any]:
        """Assess readiness for phase transformation"""
        memories = self.memory_store.get(user_id, [])
        if len(memories) < 5:
            return {"ready": False, "indicators": []}
        
        recent_memories = memories[-10:]
        
        # Check integration levels
        avg_integration = self._calculate_integration_average(recent_memories)
        
        # Check for transformation themes
        transformation_words = ["change", "transform", "ready", "new", "release", "let go"]
        transformation_mentions = sum(
            1 for memory in recent_memories 
            if any(word in memory.content.get("user_input", "").lower() 
                  for word in transformation_words)
        )
        
        # Check for symbolic evolution
        symbol_evolution = self._check_symbol_evolution(user_id)
        
        return {
            "ready": avg_integration > 0.75 and transformation_mentions >= 3,
            "indicators": {
                "integration_level": avg_integration,
                "transformation_mentions": transformation_mentions,
                "symbol_evolution": symbol_evolution,
                "phase_duration": self._get_phase_duration(user_id)
            }
        }
    
    def _calculate_integration_average(self, memories: List[AINMemoryPayload]) -> float:
        """Calculate average integration level"""
        if not memories:
            return 0.0
        
        total_integration = sum(memory.integration_level for memory in memories)
        return total_integration / len(memories)
    
    def _interpret_symbol_evolution(self, thread: SymbolicThread) -> str:
        """Interpret how a symbol has evolved in meaning"""
        if len(thread.appearances) < 2:
            return f"Emerging symbol: {thread.symbol}"
        
        # Analyze phase progression
        phases = list(thread.phase_associations.keys())
        if len(phases) > 1:
            return f"{thread.symbol} evolving through {phases[-1].value}"
        
        # Analyze elemental associations
        dominant_element = max(thread.elemental_associations, 
                             key=thread.elemental_associations.get)
        
        return f"{thread.symbol} resonating with {dominant_element.value} energy"
    
    def _extract_narrative_themes(self, 
                                user_input: str,
                                oracle_response: OracleResponse) -> List[str]:
        """Extract narrative themes from interaction"""
        themes = []
        
        # Theme detection based on keywords
        theme_patterns = {
            "transformation": ["change", "transform", "new", "different"],
            "relationship": ["love", "connection", "partner", "relationship"],
            "purpose": ["purpose", "meaning", "calling", "mission"],
            "healing": ["heal", "pain", "trauma", "recovery"],
            "growth": ["grow", "develop", "evolve", "expand"],
            "creation": ["create", "build", "manifest", "birth"]
        }
        
        input_lower = user_input.lower()
        for theme, keywords in theme_patterns.items():
            if any(keyword in input_lower for keyword in keywords):
                themes.append(theme)
        
        return themes
    
    def _find_matching_arc(self, user_id: str, theme: str) -> Optional[NarrativeArc]:
        """Find existing narrative arc matching theme"""
        user_arcs = self.narrative_arcs.get(user_id, [])
        
        for arc in user_arcs:
            if theme in arc.title.lower() and arc.completion_percentage < 0.9:
                return arc
        
        return None
    
    def _determine_chapter(self, arc: NarrativeArc) -> str:
        """Determine current chapter of narrative arc"""
        event_count = len(arc.key_events)
        
        if event_count <= 2:
            return "Beginning"
        elif event_count <= 5:
            return "Rising Action"
        elif event_count <= 8:
            return "Climax"
        elif arc.completion_percentage > 0.8:
            return "Resolution"
        else:
            return "Falling Action"
    
    def _calculate_arc_completion(self, arc: NarrativeArc) -> float:
        """Calculate narrative arc completion percentage"""
        # Simple heuristic based on tension resolution
        if not arc.active_tensions:
            return 1.0
        
        initial_tensions = len(arc.active_tensions)
        resolved_tensions = sum(1 for tension in arc.active_tensions 
                              if "resolved" in tension.lower())
        
        base_completion = resolved_tensions / initial_tensions if initial_tensions > 0 else 0
        
        # Factor in oracle guidance depth
        guidance_factor = min(len(arc.oracle_guidance) / 10, 1.0)
        
        return (base_completion + guidance_factor) / 2
    
    def _identify_tension(self, user_input: str) -> str:
        """Identify narrative tension in user input"""
        tension_indicators = {
            "conflict": ["but", "however", "struggle", "fight"],
            "uncertainty": ["confused", "don't know", "unsure", "lost"],
            "desire": ["want", "need", "wish", "hope"],
            "fear": ["afraid", "scared", "worry", "anxious"]
        }
        
        input_lower = user_input.lower()
        
        for tension_type, keywords in tension_indicators.items():
            if any(keyword in input_lower for keyword in keywords):
                return f"{tension_type}: {user_input[:50]}..."
        
        return "exploration: " + user_input[:50] + "..."
    
    def _find_resonant_symbols(self, user_id: str, intention: str) -> List[str]:
        """Find symbols that resonate with user's intention"""
        user_threads = self.symbolic_threads.get(user_id, {})
        
        resonant_symbols = []
        intention_lower = intention.lower()
        
        for symbol, thread in user_threads.items():
            # Check if symbol appeared recently
            if thread.appearances and \
               (datetime.now() - thread.appearances[-1]["timestamp"]).days < 30:
                # Check if symbol relates to intention
                if symbol in intention_lower or \
                   any(symbol in appearance["context"].lower() 
                       for appearance in thread.appearances[-3:]):
                    resonant_symbols.append(symbol)
        
        # Sort by archetypal resonance
        resonant_symbols.sort(
            key=lambda s: user_threads[s].archetypal_resonance, 
            reverse=True
        )
        
        return resonant_symbols
    
    def _get_element_ritual_action(self, element: Element) -> str:
        """Get ritual action for element"""
        ritual_actions = {
            Element.FIRE: "Light candle and speak your passion aloud",
            Element.WATER: "Flow with emotional currents through movement",
            Element.EARTH: "Ground through physical sensation and presence",
            Element.AIR: "Breathe deeply and expand mental perspective",
            Element.AETHER: "Rest in void awareness between thoughts"
        }
        
        return ritual_actions.get(element, "Connect with elemental energy")
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract key phrases from text"""
        # Simple extraction of phrases between punctuation
        import re
        
        sentences = re.split(r'[.!?]', text)
        key_phrases = []
        
        for sentence in sentences:
            if len(sentence) > 20 and len(sentence) < 100:
                # Look for metaphorical or instructive language
                if any(word in sentence.lower() for word in 
                      ["you are", "remember", "trust", "become", "let"]):
                    key_phrases.append(sentence.strip())
        
        return key_phrases[:5]  # Top 5 phrases
    
    def _check_symbol_evolution(self, user_id: str) -> bool:
        """Check if symbols show evolution"""
        user_threads = self.symbolic_threads.get(user_id, {})
        
        evolving_symbols = 0
        for thread in user_threads.values():
            if len(thread.appearances) > 3 and len(thread.phase_associations) > 1:
                evolving_symbols += 1
        
        return evolving_symbols >= 2
    
    def _get_phase_duration(self, user_id: str) -> int:
        """Get days in current phase"""
        # Simplified - would integrate with phase gating system
        return 7  # Placeholder


class CollectivePatternTracker:
    """Tracks patterns across all users for collective field"""
    
    def __init__(self):
        self.patterns: List[Dict[str, Any]] = []
        self.archetypal_frequencies: Dict[str, int] = {}
        self.elemental_trends: Dict[Element, List[float]] = {
            element: [] for element in Element
        }
    
    def add_pattern(self, pattern_data: Dict[str, Any]) -> None:
        """Add anonymized pattern to collective field"""
        
        # Extract archetypal data
        if "archetype" in pattern_data:
            archetype = pattern_data["archetype"]
            self.archetypal_frequencies[archetype] = \
                self.archetypal_frequencies.get(archetype, 0) + 1
        
        # Track elemental resonance
        if "element" in pattern_data and "resonance" in pattern_data:
            element = Element(pattern_data["element"])
            resonance = pattern_data["resonance"]
            self.elemental_trends[element].append(resonance)
            
            # Keep only recent trends (last 100)
            if len(self.elemental_trends[element]) > 100:
                self.elemental_trends[element] = self.elemental_trends[element][-100:]
        
        # Store pattern
        self.patterns.append({
            "timestamp": datetime.now().isoformat(),
            "data": pattern_data
        })
        
        # Keep only recent patterns (last 1000)
        if len(self.patterns) > 1000:
            self.patterns = self.patterns[-1000:]
    
    def get_collective_insights(self) -> Dict[str, Any]:
        """Generate insights from collective patterns"""
        
        # Most active archetypes
        top_archetypes = sorted(
            self.archetypal_frequencies.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5]
        
        # Elemental balance trends
        elemental_averages = {}
        for element, trends in self.elemental_trends.items():
            if trends:
                elemental_averages[element.value] = sum(trends) / len(trends)
        
        return {
            "top_archetypes": top_archetypes,
            "elemental_balance": elemental_averages,
            "pattern_count": len(self.patterns),
            "collective_themes": self._extract_collective_themes()
        }
    
    def _extract_collective_themes(self) -> List[str]:
        """Extract themes from collective patterns"""
        themes = []
        
        # Analyze recent patterns for common themes
        recent_patterns = self.patterns[-100:] if len(self.patterns) > 100 else self.patterns
        
        theme_counts = {}
        for pattern in recent_patterns:
            if "phase" in pattern["data"]:
                phase = pattern["data"]["phase"]
                theme_counts[phase] = theme_counts.get(phase, 0) + 1
        
        # Sort by frequency
        sorted_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)
        
        return [theme for theme, count in sorted_themes[:3]]