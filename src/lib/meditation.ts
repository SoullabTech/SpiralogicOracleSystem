export interface MeditationSession {
  client_name: string;
  phase: 'beginning' | 'middle' | 'advanced';
  element: string;
  progress: number;
  insights: string[];
  lastUpdated: Date;
  archetype?: string;
  focus_areas?: string[];
  milestones?: {
    title: string;
    completed: boolean;
    date?: Date;
  }[];
}

export class InnerGuideMeditation {
  async initializeSession(client: { client_name: string }): Promise<MeditationSession> {
    return {
      client_name: client.client_name,
      phase: 'beginning',
      element: 'none',
      progress: 0,
      insights: [],
      lastUpdated: new Date(),
      milestones: [
        {
          title: 'Initial Assessment',
          completed: false
        },
        {
          title: 'Element Alignment',
          completed: false
        },
        {
          title: 'Archetype Discovery',
          completed: false
        }
      ]
    };
  }

  async updateSession(session: MeditationSession, updates: Partial<MeditationSession>): Promise<MeditationSession> {
    return {
      ...session,
      ...updates,
      lastUpdated: new Date()
    };
  }

  async addInsight(session: MeditationSession, insight: string): Promise<MeditationSession> {
    return {
      ...session,
      insights: [...session.insights, insight],
      lastUpdated: new Date()
    };
  }

  async completeMilestone(session: MeditationSession, milestoneTitle: string): Promise<MeditationSession> {
    const updatedMilestones = session.milestones?.map(milestone => 
      milestone.title === milestoneTitle
        ? { ...milestone, completed: true, date: new Date() }
        : milestone
    );

    return {
      ...session,
      milestones: updatedMilestones,
      lastUpdated: new Date()
    };
  }
}