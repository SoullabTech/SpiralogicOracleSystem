const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oracle-backend-1.onrender.com';

export interface HoloflowerState {
  houses: any[];
  centerIntegration: number;
  overallBalance: number;
  activeTransformations: string[];
}

export interface TransformationEvent {
  timestamp: Date;
  type: 'intensity' | 'transformation' | 'integration' | 'lunar';
  details: any;
}

class HoloflowerAPI {
  private baseUrl = `${API_BASE_URL}/api/holoflower`;

  async getState(): Promise<HoloflowerState> {
    const response = await fetch(`${this.baseUrl}/state`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch holoflower state');
    }

    const data = await response.json();
    return data.data.state;
  }

  async updateHouseIntensity(houseId: string, intensity: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/house/${houseId}/intensity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ intensity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update house intensity');
    }
  }

  async activateTransformation(fromHouseId: string, toHouseId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/transformation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ fromHouseId, toHouseId }),
    });

    if (!response.ok) {
      throw new Error('Failed to activate transformation');
    }
  }

  async integrateAether(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/integrate-aether`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to integrate aether');
    }
  }

  async getTransformationHistory(): Promise<TransformationEvent[]> {
    const response = await fetch(`${this.baseUrl}/transformations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transformation history');
    }

    const data = await response.json();
    return data.data;
  }

  async getCollectiveField(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/collective-field`);

    if (!response.ok) {
      throw new Error('Failed to fetch collective field');
    }

    const data = await response.json();
    return data.data;
  }

  async createGroupPattern(groupId: string, participantIds: string[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/group/${groupId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ participantIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to create group pattern');
    }

    const data = await response.json();
    return data.data;
  }
}

export const holoflowerAPI = new HoloflowerAPI();