import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'crypto';
import { ZodValidationException } from 'nestjs-zod';
import { ErrorResponse } from '../types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Extract or generate x-request-id
    const requestId =
      (request.headers['x-request-id'] as string) || (request.id as string) || randomUUID();

    response.header('x-request-id', requestId);

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] =
      'We encountered an unexpected issue. Please try again in a moment.';

    if (exception instanceof ZodValidationException) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Bad Request';
      const zodError = exception.getZodError() as
        { issues?: Array<{ message: string; path: (string | number)[] }> } | undefined;
      if (zodError?.issues && Array.isArray(zodError.issues)) {
        message = zodError.issues.map(
          (issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`,
        );
      } else {
        message = 'Please check your submitted data and try again.';
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string | string[]) || exception.message;
        error = (resObj.error as string) || this.getDefaultErrorName(statusCode);
      } else {
        message = exception.message;
      }
    } else {
      // Unhandled error (e.g. database error, unexpected runtime exception)
      // Log internally with requestId, never expose SQL or stack trace to client
      this.logger.error(
        `[${requestId}] Unhandled exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const payload: ErrorResponse = {
      statusCode,
      error,
      message,
      requestId,
    };

    response.status(statusCode).send(payload);
  }

  private getDefaultErrorName(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      default:
        return 'Internal Server Error';
    }
  }
}
