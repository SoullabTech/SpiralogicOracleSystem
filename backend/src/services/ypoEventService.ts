// YPO Event Service for Stephanie's June 10th Event
import { supabase } from "../lib/supabaseClient";
import { ISoullabFounderAgent } from "../../../lib/shared/interfaces/IAgents";
import { agentContainer } from "../core/composition/AgentContainer";
import { logger } from "../utils/logger";

export class YPOEventService {
  // Create special welcome for YPO members
  async createYPOWelcome(participant: any): Promise<any> {
    const ypoWelcome = `Dear ${participant.preferredName || participant.firstName},

Welcome to the Spiralogic journey. As a YPO member, you understand the importance of continuous growth and transformation in leadership and life.

Tonight's experience is designed specifically for leaders like you who are ready to:
- Access deeper wisdom through ancient elemental teachings
- Meet your Personal Oracle for ongoing guidance
- Experience sacred technology that bridges mysticism and practical application
- Connect with fellow YPO members in transformational space

Stephanie and I are honored to share this work with your chapter. What you experience tonight is a glimpse of the deeper journey available at our Switzerland retreat (June 13-15).

Let's begin your elemental assessment...

With anticipation for our shared journey,
Kelly Flanagan
Founder, Soullab`;

    // Store the welcome message
    await supabase.from("retreat_messages").insert({
      participant_id: participant.id,
      type: "ypo_welcome",
      content: ypoWelcome,
      metadata: {
        eventType: "ypo",
        chapter: participant.metadata?.ypoChapter,
      },
      created_at: new Date(),
    });

    return {
      message: ypoWelcome,
      nextSteps: [
        "Complete elemental assessment",
        "Receive your Personal Oracle assignment",
        "Join group Oracle experience",
        "Consider Switzerland retreat for deeper work",
      ],
    };
  }

  // Quick elemental assessment for evening event
  async quickElementalAssessment(
    participantId: string,
    responses: any,
  ): Promise<any> {
    const elements = ["fire", "water", "earth", "air", "aether"];
    const scores: any = {};

    // Simple scoring based on YPO leader profiles
    elements.forEach((element) => {
      scores[element] = 0;
    });

    // Leadership style assessment
    if (responses.leadershipStyle === "visionary") scores.fire += 3;
    if (responses.leadershipStyle === "collaborative") scores.water += 3;
    if (responses.leadershipStyle === "operational") scores.earth += 3;
    if (responses.leadershipStyle === "strategic") scores.air += 3;
    if (responses.leadershipStyle === "transformational") scores.aether += 3;

    // Current challenge
    if (responses.currentChallenge.includes("innovation")) scores.fire += 2;
    if (responses.currentChallenge.includes("team")) scores.water += 2;
    if (responses.currentChallenge.includes("execution")) scores.earth += 2;
    if (responses.currentChallenge.includes("strategy")) scores.air += 2;
    if (responses.currentChallenge.includes("purpose")) scores.aether += 2;

    // Desired outcome
    if (responses.desiredOutcome.includes("breakthrough")) scores.fire += 2;
    if (responses.desiredOutcome.includes("connection")) scores.water += 2;
    if (responses.desiredOutcome.includes("stability")) scores.earth += 2;
    if (responses.desiredOutcome.includes("clarity")) scores.air += 2;
    if (responses.desiredOutcome.includes("integration")) scores.aether += 2;

    // Find dominant element
    const dominantElement = Object.entries(scores).sort(
      ([, a], [, b]) => (b as number) - (a as number),
    )[0][0];

    // Update participant
    await supabase
      .from("retreat_participants")
      .update({
        elementalProfile: {
          ...scores,
          dominantElement,
        },
        ypoAssessment: responses,
      })
      .eq("id", participantId);

    return {
      dominantElement,
      scores,
      interpretation: this.getYPOElementInterpretation(dominantElement),
    };
  }

  // YPO-specific element interpretation
  private getYPOElementInterpretation(element: string): string {
    const interpretations: any = {
      fire: `As a Fire leader, you ignite vision and inspire transformation. Your Oracle will help you channel this power with wisdom and sustainability.`,

      water: `As a Water leader, you excel at emotional intelligence and team cohesion. Your Oracle will deepen your intuitive leadership abilities.`,

      earth: `As an Earth leader, you build lasting foundations and execute with excellence. Your Oracle will help you balance achievement with soul purpose.`,

      air: `As an Air leader, you bring clarity and innovative thinking. Your Oracle will help you communicate your vision with even greater impact.`,

      aether: `As an Aether leader, you naturally integrate and synthesize. Your Oracle will help you lead from unity consciousness.`,
    };

    return (
      interpretations[element] ||
      "Your unique elemental nature holds powerful leadership medicine."
    );
  }

  // Create YPO group experience
  async createGroupExperience(participantIds: string[]): Promise<any> {
    // Get all participants
    const { data: participants } = await supabase
      .from("retreat_participants")
      .select("*")
      .in("id", participantIds);

    if (!participants) return null;

    // Create elemental mapping
    const elementalGroups: any = {
      fire: [],
      water: [],
      earth: [],
      air: [],
      aether: [],
    };

    participants.forEach((p) => {
      const element = p.elementalProfile?.dominantElement || "aether";
      elementalGroups[element].push(p);
    });

    // Generate group insights
    const groupInsights = await this.generateGroupInsights(elementalGroups);

    return {
      elementalDistribution: Object.entries(elementalGroups).map(
        ([element, members]) => ({
          element,
          count: (members as any[]).length,
          percentage: Math.round(
            ((members as any[]).length / participants.length) * 100,
          ),
        }),
      ),
      groupDynamics: groupInsights,
      recommendations: this.getGroupRecommendations(elementalGroups),
    };
  }

  // Generate insights for the group
  private async generateGroupInsights(elementalGroups: any): Promise<string> {
    const insights = [];

    // Analyze group composition
    const dominantElements = Object.entries(elementalGroups)
      .filter(([, members]) => (members as any[]).length > 0)
      .sort(([, a], [, b]) => (b as any[]).length - (a as any[]).length);

    insights.push(
      `Your YPO chapter shows a strong ${dominantElements[0][0]} presence, indicating ${this.getElementGroupTrait(dominantElements[0][0])}.`,
    );

    // Check for balance
    const hasAllElements = Object.values(elementalGroups).every(
      (members: any) => members.length > 0,
    );
    if (hasAllElements) {
      insights.push(
        "Beautiful! Your chapter contains all five elements, creating potential for holistic transformation.",
      );
    }

    // Missing elements
    const missingElements = Object.entries(elementalGroups)
      .filter(([, members]) => (members as any[]).length === 0)
      .map(([element]) => element);

    if (missingElements.length > 0) {
      insights.push(
        `Consider cultivating ${missingElements.join(" and ")} energy for greater group balance.`,
      );
    }

    return insights.join(" ");
  }

  private getElementGroupTrait(element: string): string {
    const traits: any = {
      fire: "visionary leadership and transformational drive",
      water: "emotional intelligence and collaborative strength",
      earth: "practical execution and sustainable growth",
      air: "strategic thinking and innovative perspectives",
      aether: "integrative wisdom and unity consciousness",
    };
    return traits[element] || "unique collective wisdom";
  }

  private getGroupRecommendations(elementalGroups: any): string[] {
    const recommendations = [
      "Form elemental support groups for ongoing practice",
      "Partner complementary elements for balanced decision-making",
      "Use Oracle guidance for chapter challenges",
      "Consider group attendance at Switzerland retreat",
    ];

    // Add specific recommendations based on composition
    const elementCounts = Object.entries(elementalGroups)
      .map(([element, members]) => ({
        element,
        count: (members as any[]).length,
      }))
      .filter(({ count }) => count > 0);

    if (
      elementCounts.some(({ element }) => element === "fire") &&
      elementCounts.some(({ element }) => element === "water")
    ) {
      recommendations.push(
        "Leverage Fire-Water partnerships for vision-emotion balance",
      );
    }

    if (
      elementCounts.some(({ element }) => element === "earth") &&
      elementCounts.some(({ element }) => element === "air")
    ) {
      recommendations.push(
        "Create Earth-Air collaborations for grounded innovation",
      );
    }

    return recommendations;
  }

  // Post-event follow-up
  async createPostEventFollowUp(participantId: string): Promise<any> {
    const { data: participant } = await supabase
      .from("retreat_participants")
      .select("*")
      .eq("id", participantId)
      .single();

    if (!participant) return null;

    // Placeholder for founder agent - not yet implemented
    const followUp = {
      message: "Follow-up functionality not yet implemented",
      timestamp: new Date().toISOString(),
    };

    // Store follow-up message
    await supabase.from("retreat_messages").insert({
      participant_id: participantId,
      type: "ypo_followup",
      content: followUp.message,
      metadata: {
        retreatInvitation: true,
        specialOffer:
          "YPO members receive priority registration for Switzerland retreat",
      },
      created_at: new Date(),
    });

    return {
      message: followUp.message,
      resources: {
        dailyPractice: this.getDailyPracticeForElement(
          participant.oracleElement,
        ),
        oracleAccess: `/api/oracle/personal/${participant.personalOracleId}`,
        retreatInfo: "/api/retreat/switzerland-june-2024",
        bookDiscoveryCall: "https://calendly.com/soullab/ypo-discovery",
      },
      specialOffer: {
        message:
          "YPO members receive priority registration and special pricing for the June 13-15 Switzerland retreat",
        deadline: "2024-06-01",
        link: "/api/retreat/ypo-special-registration",
      },
    };
  }

  private getDailyPracticeForElement(element: string): any {
    const practices: any = {
      fire: {
        morning:
          "Vision meditation: 5 minutes visualizing your highest leadership potential",
        evening: "Passion check-in: What lit you up today?",
        weekly: "Strategic vision review with your Oracle",
      },
      water: {
        morning: "Emotional awareness scan: How is your inner ocean today?",
        evening: "Gratitude flow: Appreciate three team connections",
        weekly: "Deep listening session with your Oracle",
      },
      earth: {
        morning: "Grounding practice: Feel your foundation before leading",
        evening: "Accomplishment acknowledgment: What did you build today?",
        weekly: "Manifestation review with your Oracle",
      },
      air: {
        morning: "Clarity breath: 10 conscious breaths for mental clarity",
        evening: "Insight capture: What new perspectives emerged?",
        weekly: "Strategic planning with your Oracle",
      },
      aether: {
        morning: "Unity meditation: Connect with all elements within",
        evening: "Integration practice: How did you bridge divides today?",
        weekly: "Wholeness session with your Oracle",
      },
    };

    return practices[element] || practices.aether;
  }

  // Track YPO conversion to retreat
  async trackYPOToRetreatConversion(participantId: string): Promise<void> {
    await supabase
      .from("retreat_participants")
      .update({
        metadata: {
          ypoToRetreat: true,
          conversionDate: new Date(),
          source: "ypo_event_june10",
        },
      })
      .eq("id", participantId);

    logger.info("YPO to retreat conversion", { participantId });
  }
}

// Export singleton
export const ypoEventService = new YPOEventService();
