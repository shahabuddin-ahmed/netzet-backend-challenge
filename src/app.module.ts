import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_CONFIG, DATA_SOURCE_OPTIONS } from './common/config/app.config';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './modules/db-modules/database.module';
import { AuthorModule } from './modules/author/author.module';
import { BookModule } from './modules/book/book.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [() => ({ ...APP_CONFIG, isGlobal: true })],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => DATA_SOURCE_OPTIONS,
    }),
    SharedModule,
    DatabaseModule,
    AuthorModule,
    BookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
