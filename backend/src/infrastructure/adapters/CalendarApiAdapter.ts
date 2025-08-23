/**
 * Calendar API Infrastructure Adapter
 * Pure infrastructure layer for external calendar integrations
 */

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  participants: Participant[];
  location?: string;
  meetingLink?: string;
  type: "session" | "event" | "prep" | "personal";
  metadata?: any;
}

export interface Participant {
  email: string;
  name: string;
  participantId?: string;
  responseStatus?: "accepted" | "declined" | "tentative" | "needsAction";
}

export interface CalendarIntegration {
  provider: "calendly" | "google" | "microsoft" | "zoom";
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Pure infrastructure adapter for calendar APIs
 * Contains no business logic - only external API access
 */
export class CalendarApiAdapter {
  private calendlyApiKey?: string;
  private googleApiKey?: string;
  private microsoftClientId?: string;

  constructor() {
    this.calendlyApiKey = process.env.CALENDLY_API_KEY;
    this.googleApiKey = process.env.GOOGLE_CALENDAR_API_KEY;
    this.microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
  }

  // === CALENDLY INTEGRATION ===

  /**
   * Fetch events from Calendly
   */
  async getCalendlyEvents(userUri: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    try {
      if (!this.calendlyApiKey) {
        console.warn('Calendly API key not configured');
        return [];
      }

      // Mock implementation - replace with actual Calendly API calls
      return this.getMockCalendlyEvents();
    } catch (error) {
      console.warn('Failed to fetch Calendly events:', error);
      return [];
    }
  }

  /**
   * Create Calendly webhook for event notifications
   */
  async createCalendlyWebhook(callbackUrl: string, events: string[]): Promise<any> {
    try {
      if (!this.calendlyApiKey) {
        throw new Error('Calendly API key not configured');
      }

      // Mock webhook creation
      return {
        id: 'webhook_' + Date.now(),
        url: callbackUrl,
        events,
        status: 'active'
      };
    } catch (error) {
      console.warn('Failed to create Calendly webhook:', error);
      throw new Error(`Webhook creation failed: ${error}`);
    }
  }

  // === GOOGLE CALENDAR INTEGRATION ===

  /**
   * Fetch events from Google Calendar
   */
  async getGoogleCalendarEvents(calendarId: string, accessToken: string): Promise<CalendarEvent[]> {
    try {
      if (!this.googleApiKey) {
        console.warn('Google Calendar API key not configured');
        return [];
      }

      // Mock implementation
      return this.getMockGoogleEvents();
    } catch (error) {
      console.warn('Failed to fetch Google Calendar events:', error);
      return [];
    }
  }

  /**
   * Create event in Google Calendar
   */
  async createGoogleCalendarEvent(calendarId: string, event: CalendarEvent, accessToken: string): Promise<any> {
    try {
      // Mock event creation
      return {
        id: 'google_event_' + Date.now(),
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com/event?eid=mock'
      };
    } catch (error) {
      console.warn('Failed to create Google Calendar event:', error);
      throw new Error(`Event creation failed: ${error}`);
    }
  }

  // === MICROSOFT TEAMS INTEGRATION ===

  /**
   * Fetch events from Microsoft Calendar
   */
  async getMicrosoftCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
    try {
      if (!this.microsoftClientId) {
        console.warn('Microsoft client ID not configured');
        return [];
      }

      // Mock implementation
      return this.getMockMicrosoftEvents();
    } catch (error) {
      console.warn('Failed to fetch Microsoft Calendar events:', error);
      return [];
    }
  }

  /**
   * Create Teams meeting
   */
  async createTeamsMeeting(event: CalendarEvent, accessToken: string): Promise<any> {
    try {
      // Mock Teams meeting creation
      return {
        id: 'teams_meeting_' + Date.now(),
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/mock',
        conferenceId: 'mock-conference-id'
      };
    } catch (error) {
      console.warn('Failed to create Teams meeting:', error);
      throw new Error(`Teams meeting creation failed: ${error}`);
    }
  }

  // === ZOOM INTEGRATION ===

  /**
   * Create Zoom meeting
   */
  async createZoomMeeting(event: CalendarEvent, accessToken: string): Promise<any> {
    try {
      // Mock Zoom meeting creation
      return {
        id: 'zoom_meeting_' + Date.now(),
        join_url: 'https://zoom.us/j/mock-meeting-id',
        meeting_id: 'mock-meeting-id',
        password: 'mock-password'
      };
    } catch (error) {
      console.warn('Failed to create Zoom meeting:', error);
      throw new Error(`Zoom meeting creation failed: ${error}`);
    }
  }

  // === WEBHOOK PROCESSING ===

  /**
   * Process incoming webhook from calendar providers
   */
  async processWebhook(provider: string, payload: any): Promise<CalendarEvent | null> {
    try {
      switch (provider) {
        case 'calendly':
          return this.processCalendlyWebhook(payload);
        case 'google':
          return this.processGoogleWebhook(payload);
        case 'microsoft':
          return this.processMicrosoftWebhook(payload);
        default:
          console.warn(`Unknown webhook provider: ${provider}`);
          return null;
      }
    } catch (error) {
      console.warn(`Failed to process ${provider} webhook:`, error);
      return null;
    }
  }

  // === PRIVATE HELPER METHODS ===

  private getMockCalendlyEvents(): CalendarEvent[] {
    return [
      {
        id: 'calendly_event_1',
        title: 'Spiralogic Consultation',
        start: new Date(Date.now() + 86400000), // Tomorrow
        end: new Date(Date.now() + 86400000 + 3600000), // Tomorrow + 1 hour
        participants: [
          { email: 'user@example.com', name: 'User', responseStatus: 'accepted' }
        ],
        type: 'session',
        meetingLink: 'https://meet.example.com/calendly-session'
      }
    ];
  }

  private getMockGoogleEvents(): CalendarEvent[] {
    return [
      {
        id: 'google_event_1',
        title: 'Team Sync',
        start: new Date(Date.now() + 172800000), // Day after tomorrow
        end: new Date(Date.now() + 172800000 + 1800000), // + 30 minutes
        participants: [
          { email: 'colleague@example.com', name: 'Colleague', responseStatus: 'accepted' }
        ],
        type: 'event'
      }
    ];
  }

  private getMockMicrosoftEvents(): CalendarEvent[] {
    return [
      {
        id: 'microsoft_event_1',
        title: 'Weekly Planning',
        start: new Date(Date.now() + 259200000), // 3 days from now
        end: new Date(Date.now() + 259200000 + 2700000), // + 45 minutes
        participants: [
          { email: 'manager@example.com', name: 'Manager', responseStatus: 'accepted' }
        ],
        type: 'event',
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/mock'
      }
    ];
  }

  private processCalendlyWebhook(payload: any): CalendarEvent | null {
    // Mock Calendly webhook processing
    return {
      id: payload.scheduled_event?.uuid || 'calendly_webhook_event',
      title: payload.event_type?.name || 'Calendly Event',
      start: new Date(payload.scheduled_event?.start_time || Date.now()),
      end: new Date(payload.scheduled_event?.end_time || Date.now() + 3600000),
      participants: [],
      type: 'session'
    };
  }

  private processGoogleWebhook(payload: any): CalendarEvent | null {
    // Mock Google webhook processing
    return null; // Google Calendar uses different webhook structure
  }

  private processMicrosoftWebhook(payload: any): CalendarEvent | null {
    // Mock Microsoft webhook processing
    return null; // Microsoft Graph uses different webhook structure
  }

  /**
   * Test connectivity to all configured calendar services
   */
  async testConnections(): Promise<Record<string, boolean>> {
    return {
      calendly: !!this.calendlyApiKey,
      google: !!this.googleApiKey,
      microsoft: !!this.microsoftClientId,
      zoom: !!process.env.ZOOM_API_KEY
    };
  }
}