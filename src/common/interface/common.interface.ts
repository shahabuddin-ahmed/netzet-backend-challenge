import { ERROR_CODES } from '../exception/error-code';

export interface IErrorResponse {
  code: ERROR_CODES;
  statusCode: number;
  message: string;
  traceId: string;
  errors: string[];
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
}

export interface IPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IAuthorQueryOptions extends IPaginationQuery {
  firstName?: string;
  lastName?: string;
  withBooks?: boolean;
}

export interface IBookQueryOptions extends IPaginationQuery {
  title?: string;
  isbn?: string;
  authorId?: number;
}

export interface ICreateAuthorPayload {
  firstName: string;
  lastName: string;
  bio?: string;
  birthDate?: string | Date;
}

export type IUpdateAuthorPayload = Partial<ICreateAuthorPayload>;

export interface ICreateBookPayload {
  title: string;
  isbn: string;
  publishedDate?: string | Date;
  genre?: string;
  authorId: number;
}

export type IUpdateBookPayload = Partial<
  Omit<ICreateBookPayload, 'authorId'>
> & {
  authorId?: number;
};
