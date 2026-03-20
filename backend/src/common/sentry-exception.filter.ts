import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

/**
 * Filtro global que repassa exceções não-tratadas ao Sentry.
 * Erros HTTP 4xx (erros de cliente) são ignorados — só captura 5xx e erros inesperados.
 */
@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const isClientError =
      exception instanceof HttpException && exception.getStatus() < 500;

    if (!isClientError) {
      Sentry.captureException(exception);
    }

    super.catch(exception, host);
  }
}
