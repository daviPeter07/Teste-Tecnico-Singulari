import { HttpException, HttpStatus } from '@nestjs/common';

type AppExceptionParams = {
  status: HttpStatus;
  message: string;
  errorCode: string;
  details?: unknown;
};

export class AppException extends HttpException {
  readonly errorCode: string;
  readonly details?: unknown;

  constructor(params: AppExceptionParams) {
    super(params.message, params.status);

    this.errorCode = params.errorCode;
    this.details = params.details;
  }
}
