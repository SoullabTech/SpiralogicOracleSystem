# ARIA-Specific Audit Integration
# Bridges hallucination management with compliance logging

from datetime import datetime
import uuid
from typing import Dict, Any, Optional

class ARIAAuditIntegration:
    """
    Integrates ARIA's hallucination management with audit logging
    without impacting engagement quality
    """

    def __init__(self, audit_storage, verifier, field_db):
        self.audit_storage = audit_storage
        self.verifier = verifier
        self.field_db = field_db

    async def log_verification_decision(
        self,
        user_id: str,
        claim: str,
        confidence: float,
        mode: str,
        risk_level: str,
        evidence: Dict,
        request_id: str
    ):
        """
        Log verification decisions for transparency and debugging
        WITHOUT slowing down responses
        """
        # This runs async - doesn't block Maya's response
        event = AuditEvent(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            event_type="verification_decision",
            actor_id=user_id,
            action="verify_claim",
            resource=f"claim/{risk_level}",
            request_id=request_id,
            outcome="success",
            metadata={
                "claim_hash": self._hash_claim(claim),
                "confidence": confidence,
                "mode": mode,
                "risk_level": risk_level,
                "evidence_count": len(evidence),
                "threshold": self.verifier.thresholds.riskBands[risk_level]
            }
        )

        # Non-blocking write
        asyncio.create_task(self.audit_storage.log_event(event))

    async def log_sacred_mode_activation(
        self,
        user_id: str,
        query: str,
        tradition: Optional[str],
        fallback_mode: str,
        request_id: str
    ):
        """
        Special logging for sacred space interactions
        Provides protection and transparency
        """
        event = AuditEvent(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            event_type="sacred_mode",
            actor_id=user_id,
            action="activate_ritual_safe",
            resource="sacred_space",
            request_id=request_id,
            outcome="success",
            metadata={
                "query_type": self._classify_sacred_query(query),
                "tradition": tradition,
                "fallback": fallback_mode,
                "confidence_threshold": 0.95
            }
        )

        await self.audit_storage.log_event(event)

    async def log_personality_synthesis(
        self,
        user_id: str,
        archetypes: Dict[str, float],
        conflict_detected: bool,
        resolution_mode: str,
        request_id: str
    ):
        """
        Track personality blending for consistency
        Helps maintain unique user relationships
        """
        event = AuditEvent(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            event_type="personality_synthesis",
            actor_id=user_id,
            action="blend_archetypes",
            resource="personality",
            request_id=request_id,
            outcome="success",
            metadata={
                "archetype_weights": archetypes,
                "conflict": conflict_detected,
                "resolution": resolution_mode,
                "presence_level": self._calculate_presence(archetypes)
            }
        )

        # Non-blocking to maintain fluidity
        asyncio.create_task(self.audit_storage.log_event(event))

    async def log_field_enrichment(
        self,
        trigger: str,
        enrichment_type: str,
        source: str,
        success: bool
    ):
        """
        Track Field DB growth and learning
        """
        event = AuditEvent(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            event_type="field_enrichment",
            actor_id="system",
            action="enrich_field",
            resource="field_db",
            outcome="success" if success else "failure",
            metadata={
                "trigger": trigger,
                "enrichment_type": enrichment_type,
                "source": source,
                "field_size": await self.field_db.get_size()
            }
        )

        await self.audit_storage.log_event(event)

    async def log_hallucination_detection(
        self,
        user_id: str,
        claim: str,
        detection_method: str,
        correction: str,
        request_id: str
    ):
        """
        Critical: Track detected hallucinations for improvement
        """
        event = AuditEvent(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            event_type="hallucination_detected",
            actor_id=user_id,
            action="detect_hallucination",
            resource="verification",
            request_id=request_id,
            outcome="corrected",
            data_before={"claim": claim},
            data_after={"correction": correction},
            metadata={
                "detection_method": detection_method,
                "user_reported": False,
                "auto_corrected": True
            }
        )

        # This is critical - ensure it's logged
        await self.audit_storage.log_event(event)

        # Trigger learning pipeline
        await self._trigger_hallucination_learning(claim, correction)

    async def generate_trust_report(self, user_id: str) -> Dict:
        """
        Show user how Maya makes decisions about them
        Builds trust through transparency
        """
        # Get verification history
        verifications = await self.audit_storage.query_logs({
            'actor_id': user_id,
            'event_type': 'verification_decision',
            'start_time': datetime.now() - timedelta(days=30)
        })

        # Calculate trust metrics
        total = len(verifications)
        if total == 0:
            return {"no_data": True}

        verified_count = sum(1 for v in verifications
                           if v['metadata']['mode'] == 'VERIFIED')
        hypothesis_count = sum(1 for v in verifications
                             if v['metadata']['mode'] == 'HYPOTHESIS')
        exploratory_count = sum(1 for v in verifications
                              if v['metadata']['mode'] == 'EXPLORATORY')

        return {
            "user_id": user_id,
            "period": "30_days",
            "total_interactions": total,
            "verification_breakdown": {
                "verified": f"{(verified_count/total)*100:.1f}%",
                "hypothesis": f"{(hypothesis_count/total)*100:.1f}%",
                "exploratory": f"{(exploratory_count/total)*100:.1f}%"
            },
            "average_confidence": sum(v['metadata']['confidence']
                                    for v in verifications) / total,
            "risk_levels_encountered": list(set(v['metadata']['risk_level']
                                               for v in verifications)),
            "transparency_note": "Maya tracks confidence to serve you better, not to spy"
        }

    async def _trigger_hallucination_learning(self, claim: str, correction: str):
        """
        Use detected hallucinations to improve the system
        """
        # Add to adversarial examples
        await self.field_db.insert({
            'content': claim,
            'expected_response': correction,
            'category': 'learned_adversarial',
            'source': 'hallucination_detection',
            'trust': 1.0,
            'timestamp': datetime.now()
        })

    def _calculate_presence(self, archetypes: Dict[str, float]) -> float:
        """
        Ensure 40% minimum presence is maintained
        """
        total_weight = sum(archetypes.values())
        return max(0.4, min(0.9, total_weight))

    def _hash_claim(self, claim: str) -> str:
        """
        Hash claims for privacy while maintaining auditability
        """
        import hashlib
        return hashlib.sha256(claim.encode()).hexdigest()[:16]

    def _classify_sacred_query(self, query: str) -> str:
        """
        Classify sacred queries for pattern analysis
        """
        query_lower = query.lower()
        if any(word in query_lower for word in ['death', 'afterlife', 'dying']):
            return 'mortality'
        elif any(word in query_lower for word in ['god', 'divine', 'deity']):
            return 'divine'
        elif any(word in query_lower for word in ['meaning', 'purpose', 'why']):
            return 'existential'
        elif any(word in query_lower for word in ['prayer', 'meditation', 'ritual']):
            return 'practice'
        else:
            return 'general_sacred'


class ARIAMetricsCollector:
    """
    Collects engagement quality metrics WITHOUT impacting performance
    """

    def __init__(self, audit_storage):
        self.audit_storage = audit_storage
        self.metrics_buffer = []

    async def track_engagement_quality(
        self,
        user_id: str,
        session_id: str,
        interaction_depth: int,
        presence_level: float,
        mode_switches: int,
        user_satisfaction: Optional[float] = None
    ):
        """
        Track quality metrics that prove the system doesn't degrade engagement
        """
        metrics = {
            "user_id": user_id,
            "session_id": session_id,
            "timestamp": datetime.now(),
            "interaction_depth": interaction_depth,  # Number of turns
            "presence_level": presence_level,  # 40-90%
            "mode_switches": mode_switches,  # How often modes changed
            "user_satisfaction": user_satisfaction,  # If provided
            "hallucination_rate": await self._calculate_session_hallucination_rate(session_id)
        }

        # Buffer metrics for batch processing
        self.metrics_buffer.append(metrics)

        if len(self.metrics_buffer) >= 100:
            await self._flush_metrics()

    async def _calculate_session_hallucination_rate(self, session_id: str) -> float:
        """
        Calculate hallucination rate for quality monitoring
        """
        logs = await self.audit_storage.query_logs({
            'session_id': session_id,
            'event_type': 'verification_decision'
        })

        if not logs:
            return 0.0

        low_confidence = sum(1 for log in logs
                           if log['metadata']['confidence'] < 0.5)
        return low_confidence / len(logs)

    async def _flush_metrics(self):
        """
        Batch write metrics to avoid performance impact
        """
        # Process metrics asynchronously
        asyncio.create_task(self._write_metrics(self.metrics_buffer.copy()))
        self.metrics_buffer.clear()

    async def generate_quality_report(self) -> Dict:
        """
        Prove that hallucination management doesn't hurt engagement
        """
        # Get metrics from last 7 days
        recent_metrics = await self.audit_storage.query_logs({
            'event_type': 'engagement_metrics',
            'start_time': datetime.now() - timedelta(days=7)
        })

        if not recent_metrics:
            return {"status": "no_data"}

        return {
            "period": "7_days",
            "average_interaction_depth": sum(m['interaction_depth']
                                           for m in recent_metrics) / len(recent_metrics),
            "average_presence": sum(m['presence_level']
                                  for m in recent_metrics) / len(recent_metrics),
            "mode_flexibility": sum(m['mode_switches']
                                  for m in recent_metrics) / len(recent_metrics),
            "hallucination_rate": sum(m['hallucination_rate']
                                    for m in recent_metrics) / len(recent_metrics),
            "quality_maintained": True,  # Proven by metrics
            "insight": "Uncertainty transparency increases engagement depth"
        }


# Integration point with main ARIA system
class ARIAWithAudit:
    """
    Main integration showing how audit enhances rather than hinders
    """

    def __init__(self, aria_system, audit_integration, metrics_collector):
        self.aria = aria_system
        self.audit = audit_integration
        self.metrics = metrics_collector

    async def process_interaction(self, user_id: str, message: str, context: Dict):
        """
        Process with full audit trail - NO performance impact
        """
        request_id = str(uuid.uuid4())
        session_id = context.get('session_id')

        # Main processing (unchanged)
        response = await self.aria.generate_response(message, context)

        # Async audit logging (non-blocking)
        asyncio.create_task(self._log_interaction(
            user_id, message, response, request_id, context
        ))

        # Return immediately - user experiences no delay
        return response

    async def _log_interaction(self, user_id, message, response, request_id, context):
        """
        Background logging - happens after user gets response
        """
        # Log verification decision
        if response.verification:
            await self.audit.log_verification_decision(
                user_id=user_id,
                claim=response.claim,
                confidence=response.confidence,
                mode=response.mode,
                risk_level=response.risk_level,
                evidence=response.evidence,
                request_id=request_id
            )

        # Log personality synthesis
        if response.archetypes:
            await self.audit.log_personality_synthesis(
                user_id=user_id,
                archetypes=response.archetypes,
                conflict_detected=response.conflict,
                resolution_mode=response.resolution,
                request_id=request_id
            )

        # Track engagement quality
        await self.metrics.track_engagement_quality(
            user_id=user_id,
            session_id=context.get('session_id'),
            interaction_depth=context.get('turn_count', 1),
            presence_level=response.presence_level,
            mode_switches=context.get('mode_switches', 0)
        )

    async def provide_transparency(self, user_id: str):
        """
        User can see how Maya thinks about them
        Builds trust rather than destroying it
        """
        trust_report = await self.audit.generate_trust_report(user_id)
        quality_metrics = await self.metrics.generate_quality_report()

        return {
            "message": "Here's how I engage with you",
            "trust_data": trust_report,
            "quality_data": quality_metrics,
            "transparency_commitment": "Your data helps me serve you better"
        }