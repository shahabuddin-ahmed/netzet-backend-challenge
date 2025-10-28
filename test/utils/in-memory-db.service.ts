import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { IDbEntityService } from 'src/modules/db-modules/database-entity.service';
import { Author } from 'src/modules/db-modules/entities/author.entity';
import { Book } from 'src/modules/db-modules/entities/book.entity';
import {
  IAuthorQueryOptions,
  IBookQueryOptions,
  ICreateAuthorPayload,
  ICreateBookPayload,
  IPaginationResult,
  IUpdateAuthorPayload,
  IUpdateBookPayload,
} from 'src/common/interface/common.interface';
import { NotFoundException } from 'src/common/exception/not-found.exception';
import { ERROR_CODES } from 'src/common/exception/error-code';

export class InMemoryDbService implements IDbEntityService {
  private authors: Author[] = [];
  private books: Book[] = [];
  private authorIdSeq = 1;
  private bookIdSeq = 1;

  reset(): void {
    this.authors = [];
    this.books = [];
    this.authorIdSeq = 1;
    this.bookIdSeq = 1;
  }

  async createAuthor(payload: ICreateAuthorPayload): Promise<Author> {
    const now = new Date();
    const author: Author = {
      id: this.authorIdSeq++,
      firstName: payload.firstName,
      lastName: payload.lastName,
      bio: payload.bio,
      birthDate: payload.birthDate,
      createdAt: now,
      updatedAt: now,
      books: [],
    };
    this.authors.push(author);
    return this.cloneAuthor(author);
  }

  async findAuthors(
    options: IAuthorQueryOptions = {},
  ): Promise<IPaginationResult<Author>> {
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.max(options.limit ?? 10, 1);

    let filtered = [...this.authors];

    if (options.firstName) {
      const search = options.firstName.toLowerCase();
      filtered = filtered.filter((author) =>
        author.firstName.toLowerCase().includes(search),
      );
    }

    if (options.lastName) {
      const search = options.lastName.toLowerCase();
      filtered = filtered.filter((author) =>
        author.lastName.toLowerCase().includes(search),
      );
    }

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit).map((author) => {
      if (options.withBooks) {
        return this.cloneAuthorWithBooks(author);
      }
      return this.cloneAuthor(author);
    });

    return { data, total: filtered.length, page, limit };
  }

  async findAuthorById(
    id: number,
    withBooks = false,
  ): Promise<Author | null> {
    const author = this.authors.find((item) => item.id === id);
    if (!author) {
      return null;
    }
    return withBooks
      ? this.cloneAuthorWithBooks(author)
      : this.cloneAuthor(author);
  }

  async updateAuthor(
    id: number,
    payload: IUpdateAuthorPayload,
  ): Promise<Author> {
    const author = this.authors.find((item) => item.id === id);
    if (!author) {
      throw new NotFoundException(
        ERROR_CODES.E_NOT_FOUND,
        `Author with id ${id} not found`,
      );
    }

    Object.assign(author, payload ?? {});
    author.updatedAt = new Date();

    const updated = await this.findAuthorById(id, true);
    if (!updated) {
      throw new NotFoundException(
        ERROR_CODES.E_NOT_FOUND,
        `Author with id ${id} not found`,
      );
    }
    return updated;
  }

  async removeAuthor(id: number): Promise<void> {
    const authorIndex = this.authors.findIndex((item) => item.id === id);
    if (authorIndex === -1) {
      throw new NotFoundException(
        ERROR_CODES.E_NOT_FOUND,
        `Author with id ${id} not found`,
      );
    }

    const bookCount = this.books.filter((book) => book.authorId === id).length;
    if (bookCount > 0) {
      throw new ConflictException(
        'Author still has books assigned. Delete or reassign the books first.',
      );
    }

    this.authors.splice(authorIndex, 1);
  }

  async createBook(payload: ICreateBookPayload): Promise<Book> {
    const author = this.authors.find(
      (existing) => existing.id === payload.authorId,
    );

    if (!author) {
      throw new BadRequestException('Author does not exist');
    }

    if (this.books.some((book) => book.isbn === payload.isbn)) {
      throw new ConflictException('ISBN already exists');
    }

    const now = new Date();
    const book: Book = {
      id: this.bookIdSeq++,
      title: payload.title,
      isbn: payload.isbn,
      publishedDate: payload.publishedDate,
      genre: payload.genre,
      createdAt: now,
      updatedAt: now,
      author: this.cloneAuthor(author),
      authorId: author.id,
    };

    this.books.push(book);
    return this.cloneBook(book);
  }

  async findBooks(
    options: IBookQueryOptions = {},
  ): Promise<IPaginationResult<Book>> {
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.max(options.limit ?? 10, 1);

    let filtered = [...this.books];

    if (options.title) {
      const search = options.title.toLowerCase();
      filtered = filtered.filter((book) =>
        book.title.toLowerCase().includes(search),
      );
    }

    if (options.isbn) {
      const search = options.isbn.toLowerCase();
      filtered = filtered.filter((book) =>
        book.isbn.toLowerCase().includes(search),
      );
    }

    if (typeof options.authorId === 'number') {
      filtered = filtered.filter(
        (book) => book.authorId === options.authorId,
      );
    }

    const start = (page - 1) * limit;
    const data = filtered
      .slice(start, start + limit)
      .map((book) => this.cloneBook(book));

    return { data, total: filtered.length, page, limit };
  }

  async findBookById(id: number): Promise<Book | null> {
    const book = this.books.find((item) => item.id === id);
    return book ? this.cloneBook(book) : null;
  }

  async updateBook(id: number, payload: IUpdateBookPayload): Promise<Book> {
    const book = this.books.find((item) => item.id === id);
    if (!book) {
      throw new NotFoundException(
        ERROR_CODES.E_NOT_FOUND,
        `Book with id ${id} not found`,
      );
    }

    if (
      typeof payload.authorId === 'number' &&
      payload.authorId !== book.authorId
    ) {
      const author = this.authors.find(
        (existing) => existing.id === payload.authorId,
      );
      if (!author) {
        throw new BadRequestException('Author does not exist');
      }
      book.authorId = author.id;
      book.author = this.cloneAuthor(author);
    }

    Object.assign(book, {
      title: payload.title ?? book.title,
      isbn: payload.isbn ?? book.isbn,
      publishedDate: payload.publishedDate ?? book.publishedDate,
      genre: payload.genre ?? book.genre,
    });

    book.updatedAt = new Date();
    const updated = await this.findBookById(id);
    if (!updated) {
      throw new NotFoundException(
        ERROR_CODES.E_NOT_FOUND,
        `Book with id ${id} not found`,
      );
    }
    return updated;
  }

  async removeBook(id: number): Promise<void> {
    const index = this.books.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(
        ERROR_CODES.E_NOT_FOUND,
        `Book with id ${id} not found`,
      );
    }
    this.books.splice(index, 1);
  }

  private cloneAuthor(author: Author): Author {
    return {
      id: author.id,
      firstName: author.firstName,
      lastName: author.lastName,
      bio: author.bio,
      birthDate: author.birthDate,
      createdAt: new Date(author.createdAt),
      updatedAt: new Date(author.updatedAt),
      books: [],
    };
  }

  private cloneAuthorWithBooks(author: Author): Author {
    const cloned = this.cloneAuthor(author);
    cloned.books = this.books
      .filter((book) => book.authorId === author.id)
      .map((book) => this.cloneBook(book));
    return cloned;
  }

  private cloneBook(book: Book): Book {
    return {
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      publishedDate: book.publishedDate,
      genre: book.genre,
      createdAt: new Date(book.createdAt),
      updatedAt: new Date(book.updatedAt),
      author: this.cloneAuthor(book.author),
      authorId: book.authorId,
    };
  }
}
