import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthorController } from 'src/modules/author/author.controller';
import { AuthorService } from 'src/modules/author/services/author.service';
import { BookController } from 'src/modules/book/book.controller';
import { BookService } from 'src/modules/book/services/book.service';
import { IDbEntityService } from 'src/modules/db-modules/database-entity.service';
import { FormHandlerValidationPipe } from 'src/common/validator/form-handler.validator';
import { ResponseInterceptor } from 'src/common/interceptor/response.interceptor';
import { AllExceptionsFilter } from 'src/common/exception/all-exception.filter';
import { LoggerService } from 'src/shared/logger-service/logger.service';
import { InMemoryDbService } from './in-memory-db.service';

export interface TestAppContext {
    app: INestApplication;
    dbService: InMemoryDbService;
}

export const createTestApp = async (): Promise<TestAppContext> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        controllers: [AuthorController, BookController],
        providers: [
            AuthorService,
            BookService,
            LoggerService,
            {
                provide: IDbEntityService,
                useClass: InMemoryDbService,
            },
            {
                provide: InMemoryDbService,
                useExisting: IDbEntityService,
            },
        ],
    }).compile();

    const app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new FormHandlerValidationPipe());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: false,
            forbidNonWhitelisted: false,
            transform: true,
        }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());

    const reflector = app.get(Reflector, { strict: false }) ?? new Reflector();
    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

    const loggerService = app.get(LoggerService);

    let configService: ConfigService;
    try {
        configService = app.get(ConfigService);
    } catch (error) {
        configService = new ConfigService();
    }

    app.useGlobalFilters(new AllExceptionsFilter(configService, loggerService));

    app.setGlobalPrefix('api/v1');

    await app.init();

    const dbService = moduleFixture.get(InMemoryDbService);

    return { app, dbService };
};
