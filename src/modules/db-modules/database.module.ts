import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbEntityService, IDbEntityService } from './database-entity.service';
import { Author } from './entities/author.entity';
import { Book } from './entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Author, Book])],
  providers: [
    DbEntityService,
    {
      provide: IDbEntityService,
      useExisting: DbEntityService,
    },
  ],
  exports: [TypeOrmModule, IDbEntityService],
})
export class DatabaseModule {}
