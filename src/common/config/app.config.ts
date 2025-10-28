import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';
dotenv.config();

export const APP_CONFIG = {
  APP_ENV: process.env.APP_ENV || 'development',
  APP_PORT: parseInt(process.env.APP_PORT || '3000', 10),
  TYPE_ORM: {
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    USER_NAME: process.env.DB_USERNAME,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_DATABASE,
    MIGRATIONS_TABLE_NAME: 'migration',
    ENTITIES: [__dirname + '/../../modules/db-modules/**/*.entity.{js,ts}'],
    CLI: {
      MIGRATIONS_DIR: 'src/migration',
    },
    SYNCHRONIZE: true,
    DEBUG: process.env.DB_DEBUG || false,
  },
};

export const DATA_SOURCE_OPTIONS: DataSourceOptions = {
  type: 'mysql',
  host: APP_CONFIG.TYPE_ORM.HOST,
  port: APP_CONFIG.TYPE_ORM.PORT
    ? (APP_CONFIG.TYPE_ORM.PORT as unknown as number)
    : 3306,
  username: APP_CONFIG.TYPE_ORM.USER_NAME,
  password: APP_CONFIG.TYPE_ORM.PASSWORD,
  database: APP_CONFIG.TYPE_ORM.DATABASE,
  entities: APP_CONFIG.TYPE_ORM.ENTITIES,
  migrationsTableName: APP_CONFIG.TYPE_ORM.MIGRATIONS_TABLE_NAME,
  migrations: [],
  synchronize: APP_CONFIG.TYPE_ORM.SYNCHRONIZE,
  debug: APP_CONFIG.TYPE_ORM.DEBUG as boolean,
  extra: {
    connectionLimit: 10,
    connectTimeout: 10000, // 10 seconds
  },
};

export const VALIDATION_PIPE_OPTIONS = {
  transform: true,
  whitelist: true,
  disableErrorMessages: false,
  forbidNonWhitelisted: true,
} as const;
