import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';


@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'check health' })
  @ApiResponse({ status: 200, description: 'We co_0l'})
  check() {
    return { status: 'ok', version: '1' };
  }
}
