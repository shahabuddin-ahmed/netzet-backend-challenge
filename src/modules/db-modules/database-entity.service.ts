import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Author } from './entities/author.entity';
import { Book } from './entities/book.entity';
import {
    IAuthorQueryOptions,
    IBookQueryOptions,
    ICreateAuthorPayload,
    ICreateBookPayload,
    IPaginationResult,
    IUpdateAuthorPayload,
    IUpdateBookPayload,
} from '../../common/interface/common.interface';
import { NotFoundException } from '../../common/exception/not-found.exception';
import { ERROR_CODES } from '../../common/exception/error-code';

export abstract class IDbEntityService {
    abstract createAuthor(payload: ICreateAuthorPayload): Promise<Author>;
    abstract findAuthors(options?: IAuthorQueryOptions): Promise<IPaginationResult<Author>>;
    abstract findAuthorById(id: number, withBooks?: boolean): Promise<Author | null>;
    abstract updateAuthor(id: number, payload: IUpdateAuthorPayload): Promise<Author>;
    abstract removeAuthor(id: number): Promise<void>;

    abstract createBook(payload: ICreateBookPayload): Promise<Book>;
    abstract findBooks(options?: IBookQueryOptions): Promise<IPaginationResult<Book>>;
    abstract findBookById(id: number): Promise<Book | null>;
    abstract updateBook(id: number, payload: IUpdateBookPayload): Promise<Book>;
    abstract removeBook(id: number): Promise<void>;
}

@Injectable()
export class DbEntityService implements IDbEntityService {
    constructor(
        @InjectRepository(Author)
        private readonly authorRepository: Repository<Author>,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
    ) {}

    async createAuthor(payload: ICreateAuthorPayload): Promise<Author> {
        const author = this.authorRepository.create(payload);
        await this.authorRepository.save(author);
        return author;
    }

    async findAuthors(options: IAuthorQueryOptions = {}): Promise<IPaginationResult<Author>> {
        const qb = this.buildAuthorQuery(options);
        const { page, limit } = this.normalizePagination(options.page, options.limit);

        qb.skip((page - 1) * limit)
            .take(limit)
            .orderBy('author.createdAt', 'DESC');

        const [data, total] = await qb.getManyAndCount();

        return { data, total, page, limit };
    }

    async findAuthorById(id: number, withBooks = false): Promise<Author | null> {
        const qb = this.authorRepository.createQueryBuilder('author').where('author.id = :id', { id });

        if (withBooks) {
            qb.leftJoinAndSelect('author.books', 'book');
        }

        return qb.getOne();
    }

    async updateAuthor(id: number, payload: IUpdateAuthorPayload): Promise<Author> {
        const author = await this.authorRepository.findOne({ where: { id } });

        if (!author) {
            throw new NotFoundException(ERROR_CODES.E_NOT_FOUND, `Author with id ${id} not found`);
        }

        Object.assign(author, payload);
        await this.authorRepository.save(author);

        const updatedAuthor = await this.findAuthorById(id, true);
        if (!updatedAuthor) {
            throw new NotFoundException(ERROR_CODES.E_NOT_FOUND, `Author with id ${id} not found`);
        }

        return updatedAuthor;
    }

    async removeAuthor(id: number): Promise<void> {
        const author = await this.authorRepository.findOne({ where: { id } });

        if (!author) {
            throw new NotFoundException(ERROR_CODES.E_NOT_FOUND, `Author with id ${id} not found`);
        }

        const bookCount = await this.bookRepository.count({
            where: { author: { id } },
        });

        if (bookCount > 0) {
            throw new ConflictException('Author still has books assigned. Delete or reassign the books first.');
        }

        await this.authorRepository.remove(author);
    }

    async createBook(payload: ICreateBookPayload): Promise<Book> {
        const author = await this.authorRepository.findOne({
            where: { id: payload.authorId },
        });

        if (!author) {
            throw new BadRequestException('Author does not exist');
        }

        const { authorId, ...bookData } = payload;
        const book = this.bookRepository.create({
            ...bookData,
            author,
        });

        await this.bookRepository.save(book);

        const createdBook = await this.findBookById(book.id);
        if (!createdBook) {
            throw new NotFoundException(ERROR_CODES.E_NOT_FOUND, `Book with id ${book.id} not found`);
        }

        return createdBook;
    }

    async findBooks(options: IBookQueryOptions = {}): Promise<IPaginationResult<Book>> {
        const qb = this.bookRepository
            .createQueryBuilder('book')
            .leftJoinAndSelect('book.author', 'author')
            .orderBy('book.createdAt', 'DESC');

        if (options.title) {
            qb.andWhere('LOWER(book.title) LIKE :title', {
                title: `%${options.title.toLowerCase()}%`,
            });
        }

        if (options.isbn) {
            qb.andWhere('LOWER(book.isbn) LIKE :isbn', {
                isbn: `%${options.isbn.toLowerCase()}%`,
            });
        }

        if (typeof options.authorId === 'number') {
            qb.andWhere('book.authorId = :authorId', {
                authorId: options.authorId,
            });
        }

        const { page, limit } = this.normalizePagination(options.page, options.limit);

        qb.skip((page - 1) * limit).take(limit);

        const [data, total] = await qb.getManyAndCount();

        return { data, total, page, limit };
    }

    async findBookById(id: number): Promise<Book | null> {
        return this.bookRepository
            .createQueryBuilder('book')
            .leftJoinAndSelect('book.author', 'author')
            .where('book.id = :id', { id })
            .getOne();
    }

    async updateBook(id: number, payload: IUpdateBookPayload): Promise<Book> {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: { author: true },
        });

        if (!book) {
            throw new NotFoundException(ERROR_CODES.E_NOT_FOUND, `Book with id ${id} not found`);
        }

        const { authorId, ...bookPayload } = payload;

        if (typeof authorId === 'number' && authorId !== book.author.id) {
            const author = await this.authorRepository.findOne({
                where: { id: authorId },
            });

            if (!author) {
                throw new BadRequestException('Author does not exist');
            }

            book.author = author;
        }

        Object.assign(book, bookPayload);

        await this.bookRepository.save(book);

        const updatedBook = await this.findBookById(id);
        if (!updatedBook) {
            throw new NotFoundException(ERROR_CODES.E_NOT_FOUND, `Book with id ${id} not found`);
        }

        return updatedBook;
    }

    async removeBook(id: number): Promise<void> {
        const book = await this.bookRepository.findOne({ where: { id } });

        if (!book) {
            throw new NotFoundException(ERROR_CODES.E_NOT_FOUND, `Book with id ${id} not found`);
        }

        await this.bookRepository.remove(book);
    }

    private buildAuthorQuery(options: IAuthorQueryOptions): SelectQueryBuilder<Author> {
        const qb = this.authorRepository.createQueryBuilder('author');

        if (options.withBooks) {
            qb.leftJoinAndSelect('author.books', 'book');
        }

        if (options.firstName) {
            qb.andWhere('LOWER(author.firstName) LIKE :firstName', {
                firstName: `%${options.firstName.toLowerCase()}%`,
            });
        }

        if (options.lastName) {
            qb.andWhere('LOWER(author.lastName) LIKE :lastName', {
                lastName: `%${options.lastName.toLowerCase()}%`,
            });
        }

        return qb;
    }

    private normalizePagination(page?: number, limit?: number): { page: number; limit: number } {
        const normalizedLimit = Math.max(limit ?? 10, 1);
        const normalizedPage = Math.max(page ?? 1, 1);

        return { page: normalizedPage, limit: normalizedLimit };
    }
}
