import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class EmailAlreadyInUseException extends AppException {
  constructor(email: string) {
    super({
      status: HttpStatus.CONFLICT,
      message: 'Email is already in use.',
      errorCode: 'EMAIL_ALREADY_IN_USE',
      details: { email },
    });
  }
}
