import type { ArchetypeData } from './types';
import { aiResponseService } from './ai-response';

class OracleService {
  private userIp: string | null = null;
  private retryAttempts = 3;
  private retryDelay = 1000;

  async initialize() {
    try {
      const response = await this.retryRequest(() => fetch('/api/user-info'));
      const data = await response.json();
      this.userIp = data.ip;
    } catch (error) {
      console.error('Failed to get user IP:', error);
    }
  }

  private async retryRequest(fn: () => Promise<Response>, attempts = this.retryAttempts): Promise<Response> {
    try {
      const response = await fn();
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      if (attempts <= 1) throw error;
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      return this.retryRequest(fn, attempts - 1);
    }
  }

  async getOracleResponse(input: string, archetype: ArchetypeData, context: any): Promise<string> {
    try {
      return await aiResponseService.getIntegratedResponse(input, archetype, context);
    } catch (error) {
      console.error('Oracle response error:', error);
      throw new Error('Failed to generate Oracle response');
    }
  }

  async getUserLocation(): Promise<string | null> {
    if (!this.userIp) return null;
    
    try {
      const response = await this.retryRequest(() => fetch(`/api/geo/${this.userIp}`));
      const data = await response.json();
      return data.location;
    } catch (error) {
      console.error('Geolocation error:', error);
      return null;
    }
  }
}

export const oracleService = new OracleService();