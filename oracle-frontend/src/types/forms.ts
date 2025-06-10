/**
 * Form state interfaces for the Oracle frontend application
 */

/**
 * Generic form field state
 */
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched?: boolean;
}

/**
 * Form submission state
 */
export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Oracle query form data
 */
export interface OracleQueryForm {
  prompt: string;
  archetype?: string;
  context?: {
    journalSummary?: string;
    holoflowerState?: Record<string, unknown>;
  };
}

/**
 * User profile form data
 */
export interface ProfileForm {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
  crystal_focus: string;
  voice_profile: string;
  guide_voice: string;
  guide_name: string;
}

/**
 * Journal entry form data
 */
export interface JournalEntryForm {
  title?: string;
  content: string;
  mood?: string;
  tags?: string[];
  isPrivate?: boolean;
}

/**
 * Authentication form data
 */
export interface AuthForm {
  email: string;
  password: string;
  confirmPassword?: string;
  rememberMe?: boolean;
}