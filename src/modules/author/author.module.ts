import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { DatabaseModule } from '../db-modules/database.module';
import { AuthorController } from './author.controller';
import { AuthorService } from './services/author.service';

@Module({
  imports: [SharedModule, DatabaseModule],
  controllers: [AuthorController],
  providers: [AuthorService],
})
export class AuthorModule {}
