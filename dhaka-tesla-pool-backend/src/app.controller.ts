import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  health() {
    return { status: 'ok', service: 'dhaka-tesla-pool-api' };
  }
}
