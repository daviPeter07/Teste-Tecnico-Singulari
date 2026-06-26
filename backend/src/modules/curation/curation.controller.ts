import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurationService } from './curation.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RunCurationDto } from './dto/run-curation.dto';

@ApiTags('Curation')
@ApiBearerAuth('jwt')
@Controller('curation')
export class CurationController {
  constructor(private readonly curationService: CurationService) {}

  @Post('run')
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
}
