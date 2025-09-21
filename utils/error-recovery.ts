/**
 * Error Recovery and Fallback System for Maya Beta
 * Ensures smooth experience even when things go wrong
 */

interface ErrorContext {
  type: 'network' | 'ai' | 'audio' | 'session' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  handled: boolean;
}

export class ErrorRecovery {
  private static retryAttempts = new Map<string, number>();
  private static maxRetries = 3;

  /**
   * Main error handler with graceful fallbacks
   */
  static async handleError(
    error: Error,
    context: Partial<ErrorContext>
  ): Promise<void> {
    const errorContext: ErrorContext = {
      type: context.type || 'unknown',
      severity: this.assessSeverity(error),
      timestamp: new Date(),
      handled: false,
      ...context
    };

    // Log anonymized error
    await this.logError(errorContext);

    // Apply recovery strategy
    await this.applyRecoveryStrategy(error, errorContext);
  }

  /**
   * Assess error severity
   */
  private static assessSeverity(error: Error): ErrorContext['severity'] {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'medium';
    }
    if (error.message.includes('session') || error.message.includes('auth')) {
      return 'high';
    }
    if (error.message.includes('critical') || error.message.includes('panic')) {
      return 'critical';
    }
    return 'low';
  }

  /**
   * Apply appropriate recovery strategy
   */
  private static async applyRecoveryStrategy(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    switch (context.type) {
      case 'network':
        await this.handleNetworkError(error, context);
        break;
      case 'ai':
        await this.handleAIError(error, context);
        break;
      case 'audio':
        await this.handleAudioError(error, context);
        break;
      case 'session':
        await this.handleSessionError(error, context);
        break;
      default:
        await this.handleGenericError(error, context);
    }
  }

  /**
   * Network error recovery
   */
  private static async handleNetworkError(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    const retryKey = `network_${context.sessionId}`;
    const attempts = this.retryAttempts.get(retryKey) || 0;

    if (attempts < this.maxRetries) {
      // Exponential backoff
      const delay = Math.pow(2, attempts) * 1000;
      setTimeout(() => {
        this.retryAttempts.set(retryKey, attempts + 1);
        // Trigger retry logic
        window.dispatchEvent(new CustomEvent('maya:retry:network'));
      }, delay);
    } else {
      // Max retries reached - show user message
      this.showUserMessage(
        "Connection interrupted. Maya is still here - shall we try reconnecting?"
      );
    }
  }

  /**
   * AI error recovery
   */
  private static async handleAIError(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    // Fallback to simpler response
    const fallbackResponses = [
      "I'm here with you. Tell me more about that.",
      "That sounds important. How does it feel to share this?",
      "I hear you. What comes up when you sit with that?"
    ];

    const randomFallback = fallbackResponses[
      Math.floor(Math.random() * fallbackResponses.length)
    ];

    window.dispatchEvent(new CustomEvent('maya:fallback:response', {
      detail: { message: randomFallback }
    }));
  }

  /**
   * Audio error recovery
   */
  private static async handleAudioError(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    // Switch to text mode automatically
    window.dispatchEvent(new CustomEvent('maya:fallback:textmode', {
      detail: {
        message: "Voice seems to be having trouble. Let's continue in text for now."
      }
    }));
  }

  /**
   * Session error recovery
   */
  private static async handleSessionError(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    // Try to recover from local storage
    if (context.sessionId && typeof window !== 'undefined') {
      const backup = localStorage.getItem(`maya_session_${context.sessionId}`);
      if (backup) {
        window.dispatchEvent(new CustomEvent('maya:session:recovered', {
          detail: { session: JSON.parse(backup) }
        }));
        return;
      }
    }

    // Can't recover - apologize and restart
    this.showUserMessage(
      "I lost track of our conversation for a moment. Shall we continue from here?"
    );
  }

  /**
   * Generic error recovery
   */
  private static async handleGenericError(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    if (context.severity === 'critical') {
      this.showUserMessage(
        "Something unexpected happened. Maya needs a moment to reset. Your conversation is safe."
      );
      // Trigger full reload after 3 seconds
      setTimeout(() => window.location.reload(), 3000);
    } else {
      // Silent recovery for low severity
      console.warn('Recovered from error:', error.message);
    }
  }

  /**
   * Show user-friendly message
   */
  private static showUserMessage(message: string): void {
    window.dispatchEvent(new CustomEvent('maya:show:message', {
      detail: { message, type: 'recovery' }
    }));
  }

  /**
   * Log error (anonymized)
   */
  private static async logError(context: ErrorContext): Promise<void> {
    // Only log metadata, never content
    const safeLog = {
      type: context.type,
      severity: context.severity,
      timestamp: context.timestamp,
      userHash: context.userId ?
        Buffer.from(context.userId).toString('base64').substring(0, 8) :
        'anonymous',
      handled: context.handled
    };

    // Send to analytics (implement based on your analytics service)
    console.error('Maya Error:', safeLog);
  }
}

/**
 * Global error boundary for React components
 */
export class MayaErrorBoundary {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  static componentDidCatch(error: Error, errorInfo: any) {
    ErrorRecovery.handleError(error, {
      type: 'unknown',
      severity: 'high'
    });
  }
}

/**
 * Automatic session backup
 */
export class SessionBackup {
  static startAutoBackup(sessionId: string, interval: number = 60000): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      const event = new CustomEvent('maya:backup:request', {
        detail: { sessionId }
      });
      window.dispatchEvent(event);
    }, interval);
  }

  static async createBackup(sessionId: string, data: any): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Store in localStorage
      localStorage.setItem(
        `maya_session_${sessionId}`,
        JSON.stringify({
          ...data,
          backedUpAt: new Date().toISOString()
        })
      );

      // Also store in IndexedDB for larger data
      if ('indexedDB' in window) {
        const db = await this.openDB();
        const tx = db.transaction(['sessions'], 'readwrite');
        await tx.objectStore('sessions').put({
          id: sessionId,
          data,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.warn('Backup failed:', error);
    }
  }

  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MayaBackup', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Network resilience utilities
 */
export class NetworkResilience {
  private static isOnline = true;
  private static queue: any[] = [];

  static init(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineMessage();
    });
  }

  static async makeResilientRequest(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    if (!this.isOnline) {
      // Queue for later
      this.queue.push({ url, options, timestamp: new Date() });
      throw new Error('Network offline - request queued');
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - Maya is thinking...');
      }
      throw error;
    }
  }

  private static async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      try {
        await fetch(request.url, request.options);
      } catch (error) {
        console.warn('Queued request failed:', error);
      }
    }
  }

  private static showOfflineMessage(): void {
    window.dispatchEvent(new CustomEvent('maya:network:offline', {
      detail: {
        message: "Connection lost. Maya will remember our conversation when we reconnect."
      }
    }));
  }
}