import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CurationService } from './curation.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
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
  findRunById(@Param('id') id: string) {
    return this.curationService.findRunById(id);
  }
}
