/**
 * Standard server action response type.
 * success: true  → data is populated
 * success: false → error is populated
 */
export type ActionResponse<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
