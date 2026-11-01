export interface AuthenticatedUser {
  userId: string;
  email?: string;
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  requestId: string;
}
