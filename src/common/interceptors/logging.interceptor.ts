import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    // Ensure requestId is attached to request and response
    let requestId = (request.headers['x-request-id'] as string) || (request.id as string);

    if (!requestId) {
      requestId = randomUUID();
      request.headers['x-request-id'] = requestId;
    }

    response.header('x-request-id', requestId);

    const startTime = Date.now();
    const { method, url } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          // Clean logging with zero PII (no query parameters that could contain PII, no body)
          const sanitizedUrl = url.split('?')[0];
          this.logger.log(`[${requestId}] ${method} ${sanitizedUrl} ${statusCode} +${duration}ms`);
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          const sanitizedUrl = url.split('?')[0];
          const status = err?.status || err?.statusCode || 500;
          this.logger.warn(`[${requestId}] ${method} ${sanitizedUrl} ${status} +${duration}ms`);
        },
      }),
    );
  }
}
