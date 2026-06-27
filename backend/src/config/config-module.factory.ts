import { ConfigModuleOptions } from '@nestjs/config';
import appConfig from './app.config';
import { envValidationSchema } from './env.validation';

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  load: [appConfig],
  validationSchema: envValidationSchema,
  validationOptions: {
    abortEarly: false,
  },
};
