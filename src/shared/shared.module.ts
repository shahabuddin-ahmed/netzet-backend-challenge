import { Module } from '@nestjs/common';
import { LoggerService } from './logger-service/logger.service';

@Module({
  exports: [LoggerService],
  providers: [LoggerService],
})
export class SharedModule {}
