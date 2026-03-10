import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof HttpException ? exception.getResponse() : exception;

        try {
            const logMessage = `[${new Date().toISOString()}] ${request.method} ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}\nStack: ${exception instanceof Error ? exception.stack : 'No stack'}\n\n`;
            fs.appendFileSync('server.log', logMessage);
        } catch (e) {
            console.error('Failed to log to file:', e);
        }

        console.error('Stocks API Error:', {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error: message,
            stack: exception instanceof Error ? exception.stack : null,
        });

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message,
        });
    }
}
