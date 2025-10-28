import { Injectable } from '@nestjs/common';
import { Author } from '../../db-modules/entities/author.entity';
import { IDbEntityService } from '../../db-modules/database-entity.service';
import {
  IAuthorQueryOptions,
  ICreateAuthorPayload,
  IPaginationResult,
  IUpdateAuthorPayload,
} from '../../../common/interface/common.interface';
import { NotFoundException } from '../../../common/exception/not-found.exception';
import { ERROR_CODES } from '../../../common/exception/error-code';

@Injectable()
export class AuthorService {
  constructor(private readonly dbEntityService: IDbEntityService) {}

  create(payload: ICreateAuthorPayload): Promise<Author> {
    return this.dbEntityService.createAuthor(payload);
  }

  findAll(query: IAuthorQueryOptions = {}): Promise<IPaginationResult<Author>> {
    return this.dbEntityService.findAuthors(query);
  }

  async findOne(id: number, withBooks = false): Promise<Author> {
    const author = await this.dbEntityService.findAuthorById(id, withBooks);
    if (!author) {
      throw new NotFoundException(
        ERROR_CODES.E_NOT_FOUND,
        `Author with id ${id} not found`,
      );
    }
    return author;
  }

  update(id: number, payload: IUpdateAuthorPayload): Promise<Author> {
    return this.dbEntityService.updateAuthor(id, payload);
  }

  remove(id: number): Promise<void> {
    return this.dbEntityService.removeAuthor(id);
  }
}
