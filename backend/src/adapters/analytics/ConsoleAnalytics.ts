import { IAnalytics } from "../../core/interfaces/IAnalytics";
export class ConsoleAnalytics implements IAnalytics {
  emit(event: string, payload: Record<string, unknown>) {
    // keep it lightweight; swap for real telemetry later
    if (process.env.LOG_ANALYTICS === 'true') {
      // eslint-disable-next-line no-console
      console.log(`[analytics] ${event}`, payload);
    }
  }
}