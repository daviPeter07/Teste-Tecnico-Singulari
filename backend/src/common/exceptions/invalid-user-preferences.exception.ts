import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class InvalidUserPreferencesException extends AppException {
  constructor(categoryIds: string[]) {
    super({
      status: HttpStatus.BAD_REQUEST,
      message: 'One or more selected preferences are invalid.',
      errorCode: 'INVALID_USER_PREFERENCES',
      details: { categoryIds },
    });
  }
}
