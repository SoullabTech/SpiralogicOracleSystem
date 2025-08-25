"""
Spiralogic Phase Gating System
Manages spiral phase transitions and conditional behaviors
"""

from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json

from ..agents.base import SpiralPhase, Element, UserContext


@dataclass
class PhaseTransitionCondition:
    """Condition that must be met for phase transition"""
    name: str
    check_function: Callable[[Any], bool]
    description: str
    weight: float = 1.0
    required: bool = False


@dataclass 
class PhaseGate:
    """Gate between spiral phases"""
    from_phase: SpiralPhase
    to_phase: SpiralPhase
    conditions: List[PhaseTransitionCondition]
    minimum_duration: timedelta = timedelta(days=7)
    ritual_required: bool = True
    collective_resonance_threshold: float = 0.7


@dataclass
class UserPhaseData:
    """Tracks user's phase progression"""
    user_id: str
    current_phase: SpiralPhase
    phase_entry_time: datetime
    completed_conditions: Dict[str, bool] = field(default_factory=dict)
    phase_history: List[Dict[str, Any]] = field(default_factory=list)
    spiral_count: int = 1  # Which spiral iteration they're on
    phase_resonance: float = 0.5
    breakthrough_moments: List[Dict] = field(default_factory=list)


class PhaseGatingSystem:
    """Manages phase transitions and spiral progression"""
    
    def __init__(self):
        self.phase_gates = self._initialize_phase_gates()
        self.phase_behaviors = self._initialize_phase_behaviors()
        self.user_phase_data: Dict[str, UserPhaseData] = {}
        self.phase_archetypes = self._initialize_phase_archetypes()
    
    def _initialize_phase_gates(self) -> List[PhaseGate]:
        """Define transition requirements between phases"""
        
        gates = [
            # Initiation -> Exploration
            PhaseGate(
                from_phase=SpiralPhase.INITIATION,
                to_phase=SpiralPhase.EXPLORATION,
                conditions=[
                    PhaseTransitionCondition(
                        name="vision_clarified",
                        check_function=lambda ctx: ctx.get("vision_clarity", 0) > 0.7,
                        description="User has clarified their vision or intention",
                        weight=2.0,
                        required=True
                    ),
                    PhaseTransitionCondition(
                        name="first_action_taken",
                        check_function=lambda ctx: ctx.get("actions_taken", 0) > 0,
                        description="User has taken at least one concrete action",
                        weight=1.5
                    ),
                    PhaseTransitionCondition(
                        name="commitment_declared",
                        check_function=lambda ctx: ctx.get("commitment_level", 0) > 0.6,
                        description="User has declared commitment to their path",
                        weight=1.0
                    )
                ],
                minimum_duration=timedelta(days=3),
                ritual_required=True
            ),
            
            # Exploration -> Challenge
            PhaseGate(
                from_phase=SpiralPhase.EXPLORATION,
                to_phase=SpiralPhase.CHALLENGE,
                conditions=[
                    PhaseTransitionCondition(
                        name="edges_found",
                        check_function=lambda ctx: ctx.get("edges_encountered", 0) >= 3,
                        description="User has encountered multiple edge experiences",
                        weight=1.5,
                        required=True
                    ),
                    PhaseTransitionCondition(
                        name="patterns_recognized",
                        check_function=lambda ctx: ctx.get("patterns_seen", 0) >= 2,
                        description="User recognizes recurring patterns",
                        weight=1.0
                    ),
                    PhaseTransitionCondition(
                        name="resistance_felt",
                        check_function=lambda ctx: ctx.get("resistance_level", 0) > 0.5,
                        description="User feels natural resistance to growth",
                        weight=1.0
                    )
                ],
                minimum_duration=timedelta(days=7)
            ),
            
            # Challenge -> Transformation
            PhaseGate(
                from_phase=SpiralPhase.CHALLENGE,
                to_phase=SpiralPhase.TRANSFORMATION,
                conditions=[
                    PhaseTransitionCondition(
                        name="crisis_faced",
                        check_function=lambda ctx: ctx.get("crisis_intensity", 0) > 0.8,
                        description="User has faced significant crisis or challenge",
                        weight=2.0,
                        required=True
                    ),
                    PhaseTransitionCondition(
                        name="old_identity_released",
                        check_function=lambda ctx: ctx.get("identity_fluidity", 0) > 0.7,
                        description="User shows willingness to release old identity",
                        weight=1.5
                    ),
                    PhaseTransitionCondition(
                        name="surrender_achieved",
                        check_function=lambda ctx: ctx.get("surrender_level", 0) > 0.6,
                        description="User has surrendered to transformation process",
                        weight=1.5
                    )
                ],
                minimum_duration=timedelta(days=14),
                ritual_required=True,
                collective_resonance_threshold=0.8
            ),
            
            # Transformation -> Integration
            PhaseGate(
                from_phase=SpiralPhase.TRANSFORMATION,
                to_phase=SpiralPhase.INTEGRATION,
                conditions=[
                    PhaseTransitionCondition(
                        name="rebirth_complete",
                        check_function=lambda ctx: ctx.get("rebirth_markers", 0) >= 3,
                        description="User shows clear signs of rebirth",
                        weight=2.0,
                        required=True
                    ),
                    PhaseTransitionCondition(
                        name="new_identity_emerging",
                        check_function=lambda ctx: ctx.get("new_identity_coherence", 0) > 0.6,
                        description="New identity beginning to stabilize",
                        weight=1.0
                    ),
                    PhaseTransitionCondition(
                        name="gifts_recognized",
                        check_function=lambda ctx: ctx.get("gifts_awareness", 0) > 0.5,
                        description="User recognizes gifts from transformation",
                        weight=1.0
                    )
                ],
                minimum_duration=timedelta(days=7)
            ),
            
            # Integration -> Mastery
            PhaseGate(
                from_phase=SpiralPhase.INTEGRATION,
                to_phase=SpiralPhase.MASTERY,
                conditions=[
                    PhaseTransitionCondition(
                        name="wisdom_embodied",
                        check_function=lambda ctx: ctx.get("embodiment_level", 0) > 0.8,
                        description="User embodies learned wisdom consistently",
                        weight=1.5,
                        required=True
                    ),
                    PhaseTransitionCondition(
                        name="teaching_impulse",
                        check_function=lambda ctx: ctx.get("teaching_desire", 0) > 0.6,
                        description="User feels called to share wisdom",
                        weight=1.0
                    ),
                    PhaseTransitionCondition(
                        name="stability_achieved",
                        check_function=lambda ctx: ctx.get("life_stability", 0) > 0.7,
                        description="User has achieved new stability",
                        weight=1.0
                    )
                ],
                minimum_duration=timedelta(days=21)
            ),
            
            # Mastery -> Transcendence
            PhaseGate(
                from_phase=SpiralPhase.MASTERY,
                to_phase=SpiralPhase.TRANSCENDENCE,
                conditions=[
                    PhaseTransitionCondition(
                        name="ego_transcended",
                        check_function=lambda ctx: ctx.get("ego_dissolution", 0) > 0.8,
                        description="User transcends personal ego regularly",
                        weight=2.0,
                        required=True
                    ),
                    PhaseTransitionCondition(
                        name="unity_experienced",
                        check_function=lambda ctx: ctx.get("unity_experiences", 0) >= 3,
                        description="Multiple unity consciousness experiences",
                        weight=1.5
                    ),
                    PhaseTransitionCondition(
                        name="service_embodied",
                        check_function=lambda ctx: ctx.get("service_orientation", 0) > 0.9,
                        description="Life oriented toward service",
                        weight=1.0
                    )
                ],
                minimum_duration=timedelta(days=28),
                ritual_required=True,
                collective_resonance_threshold=0.9
            ),
            
            # Transcendence -> Initiation (New Spiral)
            PhaseGate(
                from_phase=SpiralPhase.TRANSCENDENCE,
                to_phase=SpiralPhase.INITIATION,
                conditions=[
                    PhaseTransitionCondition(
                        name="cycle_complete",
                        check_function=lambda ctx: ctx.get("completion_sense", 0) > 0.9,
                        description="Sense of cycle completion",
                        weight=1.0,
                        required=True
                    ),
                    PhaseTransitionCondition(
                        name="new_calling",
                        check_function=lambda ctx: ctx.get("new_vision_emerging", 0) > 0.5,
                        description="New vision or calling emerging",
                        weight=1.0
                    )
                ],
                minimum_duration=timedelta(days=7)
            )
        ]
        
        return gates
    
    def _initialize_phase_behaviors(self) -> Dict[SpiralPhase, Dict[str, Any]]:
        """Define behaviors and characteristics for each phase"""
        
        return {
            SpiralPhase.INITIATION: {
                "energy": "awakening",
                "focus": "vision_clarification",
                "challenges": ["confusion", "overwhelm", "doubt"],
                "gifts": ["fresh_perspective", "beginner_mind", "enthusiasm"],
                "practices": ["meditation", "journaling", "vision_boarding"],
                "element_affinities": {
                    Element.FIRE: 0.8,  # Vision and passion
                    Element.AIR: 0.7,   # New ideas
                    Element.WATER: 0.5,
                    Element.EARTH: 0.4,
                    Element.AETHER: 0.6
                }
            },
            
            SpiralPhase.EXPLORATION: {
                "energy": "expansion",
                "focus": "experimentation",
                "challenges": ["distraction", "overwhelm", "impatience"],
                "gifts": ["curiosity", "playfulness", "discovery"],
                "practices": ["trying_new_things", "travel", "learning"],
                "element_affinities": {
                    Element.AIR: 0.9,   # Exploration and ideas
                    Element.FIRE: 0.7,  # Enthusiasm
                    Element.WATER: 0.6,
                    Element.EARTH: 0.4,
                    Element.AETHER: 0.5
                }
            },
            
            SpiralPhase.CHALLENGE: {
                "energy": "friction",
                "focus": "perseverance",
                "challenges": ["resistance", "fear", "old_patterns"],
                "gifts": ["strength", "clarity", "determination"],
                "practices": ["shadow_work", "therapy", "physical_training"],
                "element_affinities": {
                    Element.EARTH: 0.8,  # Endurance
                    Element.FIRE: 0.7,   # Forging
                    Element.WATER: 0.6,  # Emotional processing
                    Element.AIR: 0.4,
                    Element.AETHER: 0.5
                }
            },
            
            SpiralPhase.TRANSFORMATION: {
                "energy": "metamorphosis",
                "focus": "surrender",
                "challenges": ["death_of_old_self", "uncertainty", "void"],
                "gifts": ["rebirth", "authenticity", "power"],
                "practices": ["ritual", "fasting", "vision_quest"],
                "element_affinities": {
                    Element.FIRE: 0.9,   # Phoenix transformation
                    Element.WATER: 0.8,  # Dissolution
                    Element.AETHER: 0.7, # Void walking
                    Element.EARTH: 0.4,
                    Element.AIR: 0.5
                }
            },
            
            SpiralPhase.INTEGRATION: {
                "energy": "synthesis",
                "focus": "embodiment",
                "challenges": ["patience", "practice", "consistency"],
                "gifts": ["wisdom", "balance", "groundedness"],
                "practices": ["daily_rituals", "teaching", "creating"],
                "element_affinities": {
                    Element.EARTH: 0.9,  # Grounding new wisdom
                    Element.WATER: 0.7,  # Flow
                    Element.AIR: 0.6,    # Communication
                    Element.FIRE: 0.5,
                    Element.AETHER: 0.6
                }
            },
            
            SpiralPhase.MASTERY: {
                "energy": "flow",
                "focus": "service",
                "challenges": ["humility", "continued_growth", "teaching"],
                "gifts": ["effortless_action", "wisdom", "magnetism"],
                "practices": ["mentoring", "advanced_practices", "innovation"],
                "element_affinities": {
                    Element.AETHER: 0.8, # Integrated consciousness
                    Element.FIRE: 0.7,   # Inspirational
                    Element.WATER: 0.7,  # Flowing wisdom
                    Element.EARTH: 0.7,  # Stable mastery
                    Element.AIR: 0.7     # Clear communication
                }
            },
            
            SpiralPhase.TRANSCENDENCE: {
                "energy": "unity",
                "focus": "being",
                "challenges": ["staying_grounded", "communication", "loneliness"],
                "gifts": ["unity_consciousness", "peace", "presence"],
                "practices": ["meditation", "service", "presence"],
                "element_affinities": {
                    Element.AETHER: 1.0, # Pure consciousness
                    Element.FIRE: 0.6,
                    Element.WATER: 0.6,
                    Element.EARTH: 0.5,
                    Element.AIR: 0.6
                }
            }
        }
    
    def _initialize_phase_archetypes(self) -> Dict[SpiralPhase, List[str]]:
        """Archetypes associated with each phase"""
        
        return {
            SpiralPhase.INITIATION: ["Innocent", "Seeker", "Fool", "Wonderer"],
            SpiralPhase.EXPLORATION: ["Explorer", "Student", "Adventurer", "Wanderer"],
            SpiralPhase.CHALLENGE: ["Warrior", "Challenger", "Shadow-Facer", "Tested One"],
            SpiralPhase.TRANSFORMATION: ["Phoenix", "Shapeshifter", "Death-Walker", "Alchemist"],
            SpiralPhase.INTEGRATION: ["Bridge-Builder", "Weaver", "Integrator", "Embodier"],
            SpiralPhase.MASTERY: ["Master", "Teacher", "Guide", "Sage"],
            SpiralPhase.TRANSCENDENCE: ["Mystic", "Oracle", "Void-Walker", "Unity-Keeper"]
        }
    
    def check_phase_transition(self, user_id: str, context: Dict[str, Any]) -> Optional[SpiralPhase]:
        """Check if user is ready for phase transition"""
        
        user_data = self.user_phase_data.get(user_id)
        if not user_data:
            return None
        
        # Find applicable gate
        applicable_gate = None
        for gate in self.phase_gates:
            if gate.from_phase == user_data.current_phase:
                applicable_gate = gate
                break
        
        if not applicable_gate:
            return None
        
        # Check minimum duration
        time_in_phase = datetime.now() - user_data.phase_entry_time
        if time_in_phase < applicable_gate.minimum_duration:
            return None
        
        # Check conditions
        required_met = True
        total_weight = 0
        achieved_weight = 0
        
        for condition in applicable_gate.conditions:
            met = condition.check_function(context)
            if met:
                achieved_weight += condition.weight
                user_data.completed_conditions[condition.name] = True
            elif condition.required:
                required_met = False
            
            total_weight += condition.weight
        
        # Calculate readiness
        readiness = achieved_weight / total_weight if total_weight > 0 else 0
        
        # Check if transition criteria met
        if required_met and readiness >= 0.7:
            if applicable_gate.collective_resonance_threshold:
                # Check collective field resonance
                if context.get("collective_resonance", 0) >= applicable_gate.collective_resonance_threshold:
                    return applicable_gate.to_phase
            else:
                return applicable_gate.to_phase
        
        return None
    
    def transition_phase(self, user_id: str, new_phase: SpiralPhase, ritual_completed: bool = False):
        """Transition user to new phase"""
        
        user_data = self.user_phase_data.get(user_id)
        if not user_data:
            return
        
        # Record transition
        transition_record = {
            "from_phase": user_data.current_phase.value,
            "to_phase": new_phase.value,
            "transition_time": datetime.now().isoformat(),
            "spiral_count": user_data.spiral_count,
            "ritual_completed": ritual_completed
        }
        
        user_data.phase_history.append(transition_record)
        
        # Update phase
        old_phase = user_data.current_phase
        user_data.current_phase = new_phase
        user_data.phase_entry_time = datetime.now()
        user_data.completed_conditions = {}
        user_data.phase_resonance = 0.5
        
        # Handle spiral completion
        if old_phase == SpiralPhase.TRANSCENDENCE and new_phase == SpiralPhase.INITIATION:
            user_data.spiral_count += 1
    
    def get_phase_guidance(self, phase: SpiralPhase) -> Dict[str, Any]:
        """Get guidance for current phase"""
        
        behaviors = self.phase_behaviors.get(phase, {})
        archetypes = self.phase_archetypes.get(phase, [])
        
        return {
            "phase": phase.value,
            "energy": behaviors.get("energy"),
            "focus": behaviors.get("focus"),
            "current_challenges": behaviors.get("challenges", []),
            "available_gifts": behaviors.get("gifts", []),
            "recommended_practices": behaviors.get("practices", []),
            "active_archetypes": archetypes,
            "element_affinities": behaviors.get("element_affinities", {})
        }
    
    def record_breakthrough(self, user_id: str, breakthrough_data: Dict):
        """Record a breakthrough moment"""
        
        user_data = self.user_phase_data.get(user_id)
        if user_data:
            breakthrough = {
                "timestamp": datetime.now().isoformat(),
                "phase": user_data.current_phase.value,
                "data": breakthrough_data
            }
            user_data.breakthrough_moments.append(breakthrough)
            user_data.phase_resonance = min(1.0, user_data.phase_resonance + 0.1)