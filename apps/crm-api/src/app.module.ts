import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Database_Module } from './database/database.module';
import { Health_Module } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    Database_Module,
    Health_Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
