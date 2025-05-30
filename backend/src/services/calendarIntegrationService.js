/**
 * Calendar Integration Service
 * Handles Calendly, Microsoft Teams, Google Calendar integrations
 * with ADHD-friendly reminders and prep automation
 */
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
export class CalendarIntegrationService {
    constructor() {
        this.calendlyApiKey = process.env.CALENDLY_API_KEY || '';
        this.msGraphToken = process.env.MS_GRAPH_TOKEN || '';
        this.googleCalendarToken = process.env.GOOGLE_CALENDAR_TOKEN || '';
    }
    // Calendly Integration
    async setupCalendlyWebhook(facilitatorId, webhookUrl) {
        try {
            const response = await axios.post('https://api.calendly.com/webhook_subscriptions', {
                url: webhookUrl,
                events: ['invitee.created', 'invitee.canceled'],
                organization: process.env.CALENDLY_ORGANIZATION_URI,
                scope: 'user'
            }, {
                headers: {
                    'Authorization': `Bearer ${this.calendlyApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            // Save webhook config
            await supabase
                .from('calendar_integrations')
                .update({
                calendly_webhook_id: response.data.resource.uri,
                calendly_webhook_active: true
            })
                .eq('facilitator_id', facilitatorId);
            return response.data;
        }
        catch (error) {
            console.error('Error setting up Calendly webhook:', error);
            throw error;
        }
    }
    async handleCalendlyWebhook(data, facilitatorId) {
        const { event, payload } = data;
        if (event === 'invitee.created') {
            // New booking created
            const calendarEvent = await this.convertCalendlyToEvent(payload);
            // Match to existing participant or create new
            const participant = await this.matchOrCreateParticipant(payload.invitee.email, payload.invitee.name, facilitatorId);
            // Create session record
            await this.createSessionRecord(calendarEvent, participant.id, facilitatorId);
            // Generate prep notes
            await this.generateSessionPrep(calendarEvent, participant);
            // Schedule reminders
            await this.scheduleSessionReminders(calendarEvent, facilitatorId);
            // Send confirmation with sacred prep
            await this.sendSacredSessionConfirmation(calendarEvent, participant);
        }
        else if (event === 'invitee.canceled') {
            // Handle cancellation
            await this.handleSessionCancellation(payload.scheduled_event.uuid, facilitatorId);
        }
    }
    async convertCalendlyToEvent(payload) {
        return {
            id: payload.scheduled_event.uuid,
            title: payload.scheduled_event.name,
            start: new Date(payload.scheduled_event.start_time),
            end: new Date(payload.scheduled_event.end_time),
            participants: [{
                    email: payload.invitee.email,
                    name: payload.invitee.name
                }],
            location: payload.scheduled_event.location?.location,
            meetingLink: payload.scheduled_event.location?.join_url,
            type: 'session',
            metadata: { source: 'calendly', originalPayload: payload }
        };
    }
    // Microsoft Teams Integration
    async setupMSTeamsIntegration(facilitatorId) {
        try {
            // Exchange auth code for token (simplified)
            const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
                client_id: process.env.MS_CLIENT_ID,
                scope: 'Calendars.ReadWrite OnlineMeetings.ReadWrite',
                grant_type: 'authorization_code',
                // ... other OAuth params
            });
            this.msGraphToken = tokenResponse.data.access_token;
            // Subscribe to calendar notifications
            await this.subscribeMSCalendarNotifications(facilitatorId);
            return { success: true };
        }
        catch (error) {
            console.error('Error setting up MS Teams:', error);
            throw error;
        }
    }
    async subscribeMSCalendarNotifications(facilitatorId) {
        const subscription = await axios.post('https://graph.microsoft.com/v1.0/subscriptions', {
            changeType: 'created,updated,deleted',
            notificationUrl: `${process.env.API_URL}/webhooks/ms-calendar/${facilitatorId}`,
            resource: 'me/events',
            expirationDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            clientState: facilitatorId
        }, {
            headers: {
                'Authorization': `Bearer ${this.msGraphToken}`,
                'Content-Type': 'application/json'
            }
        });
        await supabase
            .from('calendar_integrations')
            .update({
            ms_subscription_id: subscription.data.id,
            ms_subscription_active: true
        })
            .eq('facilitator_id', facilitatorId);
    }
    async syncMSTeamsCalendar(facilitatorId) {
        try {
            // Get upcoming events
            const response = await axios.get('https://graph.microsoft.com/v1.0/me/events', {
                headers: {
                    'Authorization': `Bearer ${this.msGraphToken}`
                },
                params: {
                    '$filter': `start/dateTime ge '${new Date().toISOString()}'`,
                    '$orderby': 'start/dateTime',
                    '$top': 50
                }
            });
            const events = response.data.value;
            for (const msEvent of events) {
                const calendarEvent = await this.convertMSTeamsToEvent(msEvent);
                // Process each event
                await this.processCalendarEvent(calendarEvent, facilitatorId);
            }
            return events.length;
        }
        catch (error) {
            console.error('Error syncing MS Teams calendar:', error);
            throw error;
        }
    }
    async convertMSTeamsToEvent(msEvent) {
        return {
            id: msEvent.id,
            title: msEvent.subject,
            start: new Date(msEvent.start.dateTime),
            end: new Date(msEvent.end.dateTime),
            participants: msEvent.attendees.map(att => ({
                email: att.emailAddress.address,
                name: att.emailAddress.name,
                responseStatus: this.convertMSResponseStatus(att.status.response)
            })),
            meetingLink: msEvent.onlineMeeting?.joinUrl,
            type: this.detectEventType(msEvent.subject),
            metadata: { source: 'msteams', originalEvent: msEvent }
        };
    }
    convertMSResponseStatus(status) {
        const statusMap = {
            'accepted': 'accepted',
            'declined': 'declined',
            'tentativelyAccepted': 'tentative',
            'notResponded': 'needsAction'
        };
        return statusMap[status] || 'needsAction';
    }
    // Google Calendar Integration
    async syncGoogleCalendar(facilitatorId) {
        // Similar implementation to MS Teams
        // Would use Google Calendar API
    }
    // Session Prep Automation
    async generateSessionPrep(event, participant) {
        const prep = {
            sessionId: event.id,
            participantName: participant.name,
            scheduledTime: event.start,
            prepNotes: [],
            suggestedQuestions: [],
            elementalFocus: participant.primaryElement,
            recentBreakthroughs: [],
            currentChallenges: []
        };
        // Get participant's recent activity
        const recentActivity = await this.getParticipantRecentActivity(participant.id);
        // Get their holoflower state
        const holoflowerState = await this.getParticipantHoloflower(participant.id);
        // Generate prep based on their journey
        prep.prepNotes.push(`${participant.name} is in ${recentActivity.transformationStage} stage`, `Primary element: ${participant.primaryElement}`, `Last session focus: ${recentActivity.lastSessionFocus}`);
        // Generate suggested questions based on their active houses
        if (holoflowerState.activeHouses.includes(7)) {
            prep.suggestedQuestions.push('How are your relationships evolving since our last session?', 'What patterns are you noticing in your partnerships?');
        }
        // Check for recent breakthroughs
        prep.recentBreakthroughs = recentActivity.breakthroughs;
        // Save prep notes
        await supabase
            .from('session_prep')
            .insert({
            session_id: event.id,
            facilitator_id: participant.facilitatorId,
            participant_id: participant.id,
            prep_data: prep,
            created_at: new Date()
        });
        return prep;
    }
    // Sacred Reminders with ADHD Support
    async scheduleSessionReminders(event, facilitatorId) {
        const facilitatorSettings = await this.getFacilitatorSettings(facilitatorId);
        const reminderTimes = this.calculateReminderTimes(event, facilitatorSettings);
        for (const reminderTime of reminderTimes) {
            await supabase
                .from('smart_reminders')
                .insert({
                facilitator_id: facilitatorId,
                task_type: 'session',
                task_id: event.id,
                scheduled_time: reminderTime.time,
                priority: reminderTime.priority,
                channels: facilitatorSettings.reminderChannels,
                message: reminderTime.message,
                adaptive_timing: true
            });
        }
    }
    calculateReminderTimes(event, settings) {
        const reminders = [];
        const sessionTime = event.start.getTime();
        // 24 hours before
        reminders.push({
            time: new Date(sessionTime - 24 * 60 * 60 * 1000),
            priority: 'gentle',
            message: `Tomorrow: ${event.participants[0].name} at ${event.start.toLocaleTimeString()}`
        });
        // Morning of
        const morningOf = new Date(event.start);
        morningOf.setHours(9, 0, 0, 0);
        if (morningOf.getTime() < sessionTime) {
            reminders.push({
                time: morningOf,
                priority: 'ambient',
                message: `Today: ${event.participants[0].name} - Review prep notes`
            });
        }
        // 2 hours before
        reminders.push({
            time: new Date(sessionTime - 2 * 60 * 60 * 1000),
            priority: 'interrupt',
            message: `Upcoming: ${event.participants[0].name} in 2 hours - ${settings.prepReminder}`
        });
        // 30 minutes before
        reminders.push({
            time: new Date(sessionTime - 30 * 60 * 1000),
            priority: 'interrupt',
            message: `Starting soon: ${event.participants[0].name} - ${event.meetingLink ? 'Join link ready' : 'Prepare space'}`
        });
        return reminders;
    }
    // Process any calendar event
    async processCalendarEvent(event, facilitatorId) {
        // Check if it's a client session
        const participant = await this.matchEventToParticipant(event);
        if (participant) {
            // It's a client session
            await this.createSessionRecord(event, participant.id, facilitatorId);
            await this.generateSessionPrep(event, participant);
            await this.scheduleSessionReminders(event, facilitatorId);
        }
        else if (event.type === 'event') {
            // It's a group event
            await this.processGroupEvent(event, facilitatorId);
        }
        else {
            // Personal time or other
            await this.processPersonalEvent(event, facilitatorId);
        }
    }
    // Match calendar event to participant
    async matchEventToParticipant(event) {
        if (event.participants.length === 0)
            return null;
        const participantEmail = event.participants[0].email;
        const { data: participant } = await supabase
            .from('sacred_participants')
            .select('*')
            .eq('email', participantEmail)
            .single();
        return participant;
    }
    // Helper methods
    async matchOrCreateParticipant(email, name, facilitatorId) {
        let { data: participant } = await supabase
            .from('sacred_participants')
            .select('*')
            .eq('email', email)
            .eq('facilitator_id', facilitatorId)
            .single();
        if (!participant) {
            // Create new participant
            const { data: newParticipant } = await supabase
                .from('sacred_participants')
                .insert({
                facilitator_id: facilitatorId,
                email,
                name,
                created_at: new Date(),
                journey_stage: 'initiation'
            })
                .select()
                .single();
            participant = newParticipant;
            // Trigger onboarding
            await this.triggerParticipantOnboarding(participant);
        }
        return participant;
    }
    async createSessionRecord(event, participantId, facilitatorId) {
        await supabase
            .from('session_records')
            .insert({
            id: event.id,
            facilitator_id: facilitatorId,
            participant_id: participantId,
            scheduled_time: event.start,
            duration: (event.end.getTime() - event.start.getTime()) / 60000, // minutes
            type: 'individual',
            meeting_link: event.meetingLink,
            status: 'scheduled'
        });
    }
    detectEventType(title) {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('session') || lowerTitle.includes('consultation') || lowerTitle.includes('1:1')) {
            return 'session';
        }
        else if (lowerTitle.includes('workshop') || lowerTitle.includes('retreat') || lowerTitle.includes('group')) {
            return 'event';
        }
        else if (lowerTitle.includes('prep') || lowerTitle.includes('preparation')) {
            return 'prep';
        }
        return 'personal';
    }
    async sendSacredSessionConfirmation(event, participant) {
        // Would integrate with email service
        const template = await this.getEmailTemplate('session-confirmation', participant.primaryElement);
        const emailData = {
            to: participant.email,
            subject: `Sacred Session Confirmed - ${event.start.toLocaleDateString()}`,
            template: template.id,
            variables: {
                name: participant.name,
                date: event.start.toLocaleDateString(),
                time: event.start.toLocaleTimeString(),
                meetingLink: event.meetingLink,
                element: participant.primaryElement,
                prepSuggestions: this.getSacredPrepSuggestions(participant.primaryElement)
            }
        };
        // Send via email service
        await this.sendEmail(emailData);
    }
    getSacredPrepSuggestions(element) {
        const suggestions = {
            fire: [
                'Light a candle to invoke your inner flame',
                'Journal about your current vision',
                'Move your body to activate energy'
            ],
            water: [
                'Take a ritual bath or shower',
                'Sit with your emotions without judgment',
                'Play flowing music'
            ],
            earth: [
                'Ground yourself in nature or with crystals',
                'Prepare a sacred space',
                'Review your commitments and progress'
            ],
            air: [
                'Practice conscious breathing',
                'Clear mental space through meditation',
                'Write down questions or insights'
            ]
        };
        return suggestions[element] || suggestions.fire;
    }
    // Stub methods for full implementation
    async getFacilitatorSettings(facilitatorId) {
        const { data } = await supabase
            .from('facilitator_settings')
            .select('*')
            .eq('facilitator_id', facilitatorId)
            .single();
        return data;
    }
    async getParticipantRecentActivity(participantId) {
        // Would fetch recent activity
        return {
            transformationStage: 'integration',
            lastSessionFocus: 'shadow work',
            breakthroughs: []
        };
    }
    async getParticipantHoloflower(participantId) {
        // Would fetch holoflower state
        return {
            activeHouses: [7, 8, 12]
        };
    }
    async triggerParticipantOnboarding(participant) {
        // Would trigger onboarding sequence
    }
    async processGroupEvent(event, facilitatorId) {
        // Would process group events
    }
    async processPersonalEvent(event, facilitatorId) {
        // Would process personal time
    }
    async handleSessionCancellation(sessionId, facilitatorId) {
        // Would handle cancellations
    }
    async getEmailTemplate(type, element) {
        // Would fetch email template
        return { id: 'template-123' };
    }
    async sendEmail(emailData) {
        // Would send email via service
    }
}
export const calendarIntegrationService = new CalendarIntegrationService();
