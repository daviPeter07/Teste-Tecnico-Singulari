import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class InvalidCredentialsException extends AppException {
  constructor() {
    super({
      status: HttpStatus.UNAUTHORIZED,
      message: 'Invalid email or password.',
      errorCode: 'INVALID_CREDENTIALS',
    });
  }
}
