import { Test, TestingModule } from '@nestjs/testing';
import { AuthorService } from './author.service';
import { IDbEntityService } from '../../db-modules/database-entity.service';
import {
  IAuthorQueryOptions,
  ICreateAuthorPayload,
  IPaginationResult,
  IUpdateAuthorPayload,
} from '../../../common/interface/common.interface';
import { Author } from '../../db-modules/entities/author.entity';
import { NotFoundException } from '../../../common/exception/not-found.exception';

describe('AuthorService', () => {
  let service: AuthorService;
  let dbEntityService: jest.Mocked<IDbEntityService>;

  const authorFactory = (overrides: Partial<Author> = {}): Author => ({
    id: 1,
    firstName: 'Shahabuddin',
    lastName: 'Ahmed',
    bio: 'Author bio',
    birthDate: '1993-12-20',
    createdAt: new Date(),
    updatedAt: new Date(),
    books: [],
    ...overrides,
  });

  beforeEach(async () => {
    const dbEntityServiceMock: jest.Mocked<IDbEntityService> = {
      createAuthor: jest.fn(),
      findAuthors: jest.fn(),
      findAuthorById: jest.fn(),
      updateAuthor: jest.fn(),
      removeAuthor: jest.fn(),
      createBook: jest.fn(),
      findBooks: jest.fn(),
      findBookById: jest.fn(),
      updateBook: jest.fn(),
      removeBook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: IDbEntityService,
          useValue: dbEntityServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthorService>(AuthorService);
    dbEntityService =
      module.get<jest.Mocked<IDbEntityService>>(IDbEntityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new author', async () => {
      const payload: ICreateAuthorPayload = {
        firstName: 'Shahabuddin Junior',
        lastName: 'Ahmed Junior',
        bio: 'Writer',
      };
      const createdAuthor = authorFactory({ id: 10, ...payload });

      dbEntityService.createAuthor.mockResolvedValue(createdAuthor);

      const result = await service.create(payload);

      expect(dbEntityService.createAuthor).toHaveBeenCalledWith(payload);
      expect(result).toEqual(createdAuthor);
    });
  });

  describe('findAll', () => {
    it('should return paginated authors', async () => {
      const query: IAuthorQueryOptions = { page: 2, limit: 5, firstName: 'Shahabuddin' };
      const authors = [authorFactory({ id: 2 }), authorFactory({ id: 3 })];
      const paginationResult: IPaginationResult<Author> = {
        data: authors,
        total: 2,
        page: 2,
        limit: 5,
      };

      dbEntityService.findAuthors.mockResolvedValue(paginationResult);

      const result = await service.findAll(query);

      expect(dbEntityService.findAuthors).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginationResult);
    });
  });

  describe('findOne', () => {
    it('should return an author when found', async () => {
      const author = authorFactory({ id: 5 });
      dbEntityService.findAuthorById.mockResolvedValue(author);

      const result = await service.findOne(5, true);

      expect(dbEntityService.findAuthorById).toHaveBeenCalledWith(5, true);
      expect(result).toEqual(author);
    });

    it('should throw NotFoundException when author does not exist', async () => {
      dbEntityService.findAuthorById.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(dbEntityService.findAuthorById).toHaveBeenCalledWith(99, false);
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      const payload: IUpdateAuthorPayload = { bio: 'Updated bio' };
      const updatedAuthor = authorFactory({ bio: 'Updated bio' });

      dbEntityService.updateAuthor.mockResolvedValue(updatedAuthor);

      const result = await service.update(1, payload);

      expect(dbEntityService.updateAuthor).toHaveBeenCalledWith(1, payload);
      expect(result).toEqual(updatedAuthor);
    });
  });

  describe('remove', () => {
    it('should remove an author', async () => {
      dbEntityService.removeAuthor.mockResolvedValue(undefined);

      await service.remove(1);

      expect(dbEntityService.removeAuthor).toHaveBeenCalledWith(1);
    });
  });
});
