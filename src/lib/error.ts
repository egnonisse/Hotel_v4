import { toast } from 'react-hot-toast';
import { PostgrestError } from '@supabase/supabase-js';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorLog {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  hotelId?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorLog[] = [];
  private readonly MAX_ERRORS = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!this.instance) {
      this.instance = new ErrorHandler();
    }
    return this.instance;
  }

  handle(error: unknown, context?: Record<string, any>) {
    const errorLog = this.parseError(error, context);
    this.logError(errorLog);
    this.notifyUser(errorLog);
    this.storeError(errorLog);
  }

  private parseError(error: unknown, context?: Record<string, any>): ErrorLog {
    if (error instanceof Error) {
      return {
        message: error.message,
        severity: this.determineSeverity(error),
        timestamp: new Date(),
        stack: error.stack,
        context,
      };
    }

    if (this.isSupabaseError(error)) {
      return {
        message: error.message,
        code: error.code,
        severity: 'medium',
        timestamp: new Date(),
        context: { ...context, details: error.details, hint: error.hint },
      };
    }

    return {
      message: String(error),
      severity: 'low',
      timestamp: new Date(),
      context,
    };
  }

  private isSupabaseError(error: any): error is PostgrestError {
    return 'code' in error && 'message' in error && 'details' in error;
  }

  private determineSeverity(error: Error): ErrorSeverity {
    if (error instanceof TypeError || error instanceof ReferenceError) {
      return 'high';
    }
    if (error instanceof URIError || error instanceof SyntaxError) {
      return 'medium';
    }
    return 'low';
  }

  private notifyUser(error: ErrorLog) {
    const messages: Record<ErrorSeverity, string> = {
      low: 'Something went wrong. Please try again.',
      medium: 'An error occurred. Our team has been notified.',
      high: 'A serious error occurred. Please contact support if the issue persists.',
      critical: 'Critical system error. Please try again later.',
    };

    toast.error(messages[error.severity], {
      duration: error.severity === 'critical' ? 6000 : 4000,
    });
  }

  private logError(error: ErrorLog) {
    console.error('[ErrorHandler]', {
      ...error,
      timestamp: error.timestamp.toISOString(),
    });
  }

  private async storeError(error: ErrorLog) {
    this.errors.unshift(error);
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors.pop();
    }
  }

  getRecentErrors(): ErrorLog[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();

export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handle(error, { ...context, args });
      throw error;
    }
  }) as T;
}