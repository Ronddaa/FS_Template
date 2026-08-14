import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public_Route } from './auth/decorators/public_route.decorator';

@Public_Route()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
