import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get api and database status' })
  @ApiOkResponse({ description: 'API and database status' })
  check() {
    return this.healthService.check();
  }
}
