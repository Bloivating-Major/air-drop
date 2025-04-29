export interface ClerkAPIError {
  errors: Array<{
    code: string;
    message: string;
    longMessage?: string;
    meta?: Record<string, unknown>;
  }>;
  status: number;
  clerkError: boolean;
}