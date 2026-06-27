import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import { RequestLoggingInterceptor } from '../../../common/interceptors/request-logging.interceptor';
import { RunCurationDto } from './dto/run-curation.dto';
import { CurationService } from './curation.service';

@ApiTags('Curation')
@ApiBearerAuth('jwt')
@UseInterceptors(RequestLoggingInterceptor)
@Controller('curation')
export class CurationController {
  constructor(private readonly curationService: CurationService) {}

  @Post('run')
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start a curation run',
  })
  @ApiOkResponse({
    description: 'Curation run created and jobs published to the queue',
  })
  run(@Body() body: RunCurationDto) {
    return this.curationService.run(body);
  }

  @Get('runs/:id')
  @ApiOperation({
    summary: 'Get curation run status',
  })
  @ApiParam({
    name: 'id',
    description: 'Curation run id',
  })
  @ApiOkResponse({
    description: 'Current curation run state and counters',
  })
  findRunById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.curationService.findRunById(id);
  }
}
