import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { DatabaseModule } from '../db-modules/database.module';
import { BookController } from './book.controller';
import { BookService } from './services/book.service';

@Module({
    imports: [SharedModule, DatabaseModule],
    controllers: [BookController],
    providers: [BookService],
})
export class BookModule {}
