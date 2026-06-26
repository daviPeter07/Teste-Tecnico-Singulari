import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class UserNotFoundException extends AppException {
  constructor(userId: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      message: 'User was not found.',
      errorCode: 'USER_NOT_FOUND',
      details: { userId },
    });
  }
}
