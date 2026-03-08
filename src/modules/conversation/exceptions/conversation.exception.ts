// conversation.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class ConversationException extends HttpException {
  constructor(
    message: string = 'Conversation error occurred',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}