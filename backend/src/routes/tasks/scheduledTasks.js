import { analyzeFeedbackTrends, updatePersonalityWeights } from '../services/monitoringService';
const ANALYSIS_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
export async function runScheduledAnalysis() {
    try {
        // Analyze last 24 hours of feedback
        const end = new Date();
        const start = new Date(end.getTime() - ANALYSIS_INTERVAL);
        const metrics = await analyzeFeedbackTrends({ start, end });
        // Update personality weights based on analysis
        await updatePersonalityWeights(Object.entries(metrics.confidenceScores).map(([element, confidence]) => ({
            element,
            weight: metrics.elementalDistribution[element] / 100,
            confidence,
        })));
        console.log('Scheduled analysis completed:', {
            date: new Date().toISOString(),
            metrics,
        });
    }
    catch (error) {
        console.error('Error in scheduled analysis:', error);
    }
}
// Initialize scheduled tasks
export function initializeScheduledTasks() {
    // Run initial analysis
    runScheduledAnalysis().catch(console.error);
    // Schedule periodic analysis
    setInterval(runScheduledAnalysis, ANALYSIS_INTERVAL);
}
