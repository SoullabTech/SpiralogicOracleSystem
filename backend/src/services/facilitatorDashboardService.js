"use strict";
/**
 * Sacred Facilitator Command Center Service
 * The ADHD-Friendly Consciousness Facilitator's Dream Dashboard Backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.facilitatorDashboardService = exports.FacilitatorDashboardService = void 0;
const supabaseClient_1 = require("../lib/supabaseClient");
const ws_1 = require("ws");
// Service Implementation
class FacilitatorDashboardService {
    constructor() {
        this.wsServer = null;
        this.facilitators = new Map();
        this.activeReminders = new Map();
        this.initializeWebSocketServer();
        this.startAutomationEngine();
    }
    initializeWebSocketServer() {
        this.wsServer = new ws_1.WebSocketServer({ port: 5005 });
        this.wsServer.on('connection', (ws, req) => {
            const facilitatorId = req.url?.split('/').pop();
            if (!facilitatorId)
                return;
            ws.on('message', async (message) => {
                const data = JSON.parse(message.toString());
                await this.handleDashboardMessage(facilitatorId, data);
            });
            // Send initial dashboard state
            this.sendDashboardState(facilitatorId, ws);
        });
    }
    async handleDashboardMessage(facilitatorId, data) {
        switch (data.type) {
            case 'create-event':
                await this.createSacredEvent(facilitatorId, data.event);
                break;
            case 'update-participant':
                await this.updateParticipant(facilitatorId, data.participant);
                break;
            case 'process-recording':
                await this.processSessionRecording(data.recording);
                break;
            case 'send-communication':
                await this.sendCommunication(facilitatorId, data.message);
                break;
            case 'update-priorities':
                await this.updateDailyPriorities(facilitatorId, data.priorities);
                break;
        }
    }
    // Create Sacred Event with full automation setup
    async createSacredEvent(facilitatorId, eventData) {
        const event = {
            id: `event-${Date.now()}`,
            facilitatorId,
            name: eventData.name,
            type: eventData.type,
            startDate: new Date(eventData.startDate),
            endDate: new Date(eventData.endDate),
            location: eventData.location,
            sacredContainer: eventData.sacredContainer,
            participants: [],
            automations: this.setupEventAutomations(eventData),
            prepStatus: this.initializePrepStatus(),
            materials: []
        };
        // Save to database
        await supabaseClient_1.supabase.from('sacred_events').insert(event);
        // Create group holoflower
        if (eventData.createGroupHoloflower) {
            event.groupHoloflowerId = await this.createGroupHoloflower(event);
        }
        // Schedule automations
        await this.scheduleEventAutomations(event);
        // Broadcast update
        this.broadcastDashboardUpdate(facilitatorId, {
            type: 'event-created',
            event
        });
        return event;
    }
    // Setup event automations based on type and preferences
    setupEventAutomations(eventData) {
        const automations = [];
        const startDate = new Date(eventData.startDate);
        // Welcome email automation
        automations.push({
            type: 'welcome-email',
            scheduled: new Date(), // Immediate
            completed: false,
            template: 'sacred-welcome'
        });
        // Reminder sequence
        const reminderDays = [30, 14, 7, 3, 1];
        reminderDays.forEach(days => {
            const reminderDate = new Date(startDate);
            reminderDate.setDate(reminderDate.getDate() - days);
            automations.push({
                type: 'reminder',
                scheduled: reminderDate,
                completed: false,
                template: `reminder-${days}day`
            });
        });
        // Oracle Guide assignment
        automations.push({
            type: 'oracle-assignment',
            scheduled: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
            completed: false
        });
        // Post-event follow-up
        const followUpDate = new Date(eventData.endDate);
        followUpDate.setDate(followUpDate.getDate() + 1);
        automations.push({
            type: 'follow-up',
            scheduled: followUpDate,
            completed: false,
            template: 'post-event-integration'
        });
        return automations;
    }
    // Process session recording with AI transcription and sacred summary
    async processSessionRecording(recordingData) {
        // Create transcription job
        const job = {
            id: `job-${Date.now()}`,
            recordingId: recordingData.sessionId,
            status: 'queued',
            service: 'assembly-ai'
        };
        await supabaseClient_1.supabase.from('transcription_jobs').insert(job);
        // Start transcription (would integrate with Assembly AI)
        const transcript = await this.transcribeRecording(recordingData.recordingUrl);
        // Generate sacred summary
        const summary = await this.generateSacredSummary(transcript, recordingData.participantId);
        // Update session record
        await supabaseClient_1.supabase
            .from('session_records')
            .update({
            transcript,
            aiSummary: summary,
            breakthroughMoments: summary.keyMoments
        })
            .eq('id', recordingData.sessionId);
        // Check for breakthrough moments
        await this.checkForBreakthroughs(summary, recordingData.participantId);
        return summary;
    }
    // Generate sacred summary with elemental breakdown
    async generateSacredSummary(transcript, participantId) {
        // This would use AI to analyze transcript
        // For now, returning example structure
        return {
            elements: {
                fire: ['Expressed vision for new project', 'Breakthrough moment at 14:32'],
                water: ['Emotional release around mother relationship', 'Tears of joy at realization'],
                earth: ['Committed to daily practice', 'Set concrete action steps'],
                air: ['New perspective on old pattern', 'Clear communication with partner']
            },
            keyMoments: [
                { timestamp: '14:32', description: 'Major realization about repeating pattern' },
                { timestamp: '27:45', description: 'Commitment to new way of being' }
            ],
            suggestedFollowUp: [
                'Check on mother relationship progress',
                'Support new project manifestation',
                'Celebrate breakthrough in next session'
            ],
            emotionalTone: 'Breakthrough and integration',
            transformationIndicators: ['Pattern recognition', 'Emotional release', 'Clear commitment']
        };
    }
    // Smart inbox management with AI categorization
    async processInboxItem(email) {
        const participantId = await this.matchEmailToParticipant(email.from);
        const sentiment = await this.analyzeSentiment(email.content);
        const category = this.categorizeEmail(email, sentiment);
        const inboxItem = {
            id: `inbox-${Date.now()}`,
            from: email.from,
            participantId,
            subject: email.subject,
            preview: email.content.substring(0, 100),
            receivedAt: new Date(),
            category,
            responseStatus: category === 'urgent' ? 'needed' : 'not-needed',
            sentiment
        };
        // Generate suggested response if needed
        if (inboxItem.responseStatus === 'needed') {
            inboxItem.suggestedResponse = await this.generateSuggestedResponse(email, participantId, sentiment);
        }
        // Save to inbox
        await supabaseClient_1.supabase.from('facilitator_inbox').insert(inboxItem);
        // Alert facilitator if urgent
        if (category === 'urgent') {
            await this.sendUrgentAlert(inboxItem);
        }
        return inboxItem;
    }
    // ADHD-friendly daily priority management
    async generateDailyPriorities(facilitatorId) {
        const facilitator = await this.getFacilitator(facilitatorId);
        // Get all tasks from various sources
        const sessionPrep = await this.getSessionPrepTasks(facilitatorId);
        const emailReplies = await this.getUrgentEmails(facilitatorId);
        const eventTasks = await this.getEventPrepTasks(facilitatorId);
        const followUps = await this.getFollowUpTasks(facilitatorId);
        // Categorize by urgency and sacred timing
        const priorities = [];
        // Must do today
        [...sessionPrep, ...emailReplies].forEach(task => {
            priorities.push({
                id: `priority-${Date.now()}-${Math.random()}`,
                task: task.description,
                category: 'must-do',
                deadline: task.deadline,
                completed: false,
                participant: task.participant,
                estimatedTime: task.estimatedTime,
                sacredTiming: this.getSacredTiming(task)
            });
        });
        // Can wait
        eventTasks.forEach(task => {
            if (!this.isUrgent(task)) {
                priorities.push({
                    id: `priority-${Date.now()}-${Math.random()}`,
                    task: task.description,
                    category: 'can-wait',
                    deadline: task.deadline,
                    completed: false,
                    estimatedTime: task.estimatedTime
                });
            }
        });
        // Delegated to system
        const automatedTasks = await this.getAutomatedTasks(facilitatorId);
        automatedTasks.forEach(task => {
            priorities.push({
                id: `priority-${Date.now()}-${Math.random()}`,
                task: task.description,
                category: 'delegated',
                completed: task.completed
            });
        });
        return priorities;
    }
    // Continuous sacred support monitoring
    async monitorParticipantWellbeing() {
        // Run every hour
        setInterval(async () => {
            const allParticipants = await this.getAllActiveParticipants();
            for (const participant of allParticipants) {
                // Check holoflower for concerning patterns
                const holoflowerAlert = await this.checkHoloflowerPatterns(participant.id);
                // Check journal entries for support needs
                const journalAlert = await this.checkJournalSentiment(participant.id);
                // Check for missed sessions or communications
                const engagementAlert = await this.checkEngagement(participant.id);
                if (holoflowerAlert || journalAlert || engagementAlert) {
                    await this.createSupportAlert(participant, {
                        holoflowerAlert,
                        journalAlert,
                        engagementAlert
                    });
                }
            }
        }, 3600000); // Every hour
    }
    // Smart reminder system with ADHD support
    async scheduleSmartReminder(reminder) {
        const adaptedTime = await this.getOptimalReminderTime(reminder);
        const timeout = setTimeout(async () => {
            await this.triggerReminder(reminder);
            // If snoozed, reschedule
            if (reminder.snoozedUntil) {
                reminder.scheduledTime = reminder.snoozedUntil;
                await this.scheduleSmartReminder(reminder);
            }
        }, adaptedTime.getTime() - Date.now());
        this.activeReminders.set(reminder.id, timeout);
    }
    // Helper methods would continue...
    async sendDashboardState(facilitatorId, ws) {
        const dashboard = await this.getDashboardState(facilitatorId);
        ws.send(JSON.stringify({
            type: 'dashboard-state',
            data: dashboard
        }));
    }
    broadcastDashboardUpdate(facilitatorId, update) {
        if (!this.wsServer)
            return;
        const message = JSON.stringify({
            type: 'dashboard-update',
            facilitatorId,
            update,
            timestamp: new Date()
        });
        this.wsServer.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(message);
            }
        });
    }
    startAutomationEngine() {
        // Check for scheduled automations every minute
        setInterval(async () => {
            await this.runScheduledAutomations();
            await this.checkBreakthroughAlerts();
            await this.updatePriorityReminders();
        }, 60000);
    }
    cleanup() {
        if (this.wsServer) {
            this.wsServer.close();
        }
        // Clear all active reminders
        this.activeReminders.forEach(timeout => clearTimeout(timeout));
        this.activeReminders.clear();
    }
}
exports.FacilitatorDashboardService = FacilitatorDashboardService;
exports.facilitatorDashboardService = new FacilitatorDashboardService();
