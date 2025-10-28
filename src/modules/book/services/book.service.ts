import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../common/exception/not-found.exception';
import { ERROR_CODES } from '../../../common/exception/error-code';
import {
  IBookQueryOptions,
  ICreateBookPayload,
  IPaginationResult,
  IUpdateBookPayload,
} from '../../../common/interface/common.interface';
import { IDbEntityService } from '../../db-modules/database-entity.service';
import { Book } from '../../db-modules/entities/book.entity';

@Injectable()
export class BookService {
  constructor(private readonly dbEntityService: IDbEntityService) {}

  create(payload: ICreateBookPayload): Promise<Book> {
    return this.dbEntityService.createBook(payload);
  }

  findAll(query: IBookQueryOptions = {}): Promise<IPaginationResult<Book>> {
    return this.dbEntityService.findBooks(query);
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.dbEntityService.findBookById(id);

    if (!book) {
      throw new NotFoundException(
        ERROR_CODES.E_NOT_FOUND,
        `Book with id ${id} not found`,
      );
    }

    return book;
  }

  update(id: number, payload: IUpdateBookPayload): Promise<Book> {
    return this.dbEntityService.updateBook(id, payload);
  }

  remove(id: number): Promise<void> {
    return this.dbEntityService.removeBook(id);
  }
}
