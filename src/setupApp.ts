import { Reflector } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import morgan from 'morgan';
import { FormHandlerValidationPipe } from './common/validator/form-handler.validator';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { LoggerService } from './shared/logger-service/logger.service';
import { AllExceptionsFilter } from './common/exception/all-exception.filter';

export const setupAPP = (app: INestApplication) => {
    app.enableCors();
    app.use(morgan('short'));

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.useGlobalPipes(new FormHandlerValidationPipe());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: false,
            forbidNonWhitelisted: false,
            transform: true,
        }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

    const configSvc = app.get(ConfigService);
    const centralLogger = new LoggerService();
    app.useGlobalFilters(new AllExceptionsFilter(configSvc, centralLogger));

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

    app.setGlobalPrefix('api/v1');
};
