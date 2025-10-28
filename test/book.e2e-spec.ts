import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, TestAppContext } from './utils/create-test-app';

describe('Book API (e2e)', () => {
    let app: INestApplication;
    let context: TestAppContext;

    beforeEach(async () => {
        context = await createTestApp();
        app = context.app;
    });

    afterEach(async () => {
        await app.close();
    });

    const createAuthor = async () => {
        const authorPayload = {
            firstName: 'Shahabuddin Junior',
            lastName: 'Ahmed Junior',
            bio: 'Wrote Double Standard',
            birthDate: '1797-08-30',
        };

        const response = await request(app.getHttpServer()).post('/api/v1/authors').send(authorPayload).expect(201);

        return response.body.response.id as number;
    };

    it('creates a book and retrieves it with author data', async () => {
        const authorId = await createAuthor();

        const bookPayload = {
            title: 'Double Standard',
            isbn: '978-1-56619-909-4',
            publishedDate: '2019-01-12',
            genre: 'Sunnahic Literature',
            authorId,
        };

        const createResponse = await request(app.getHttpServer()).post('/api/v1/books').send(bookPayload).expect(201);

        expect(createResponse.body).toMatchObject({
            code: 'SUCCESS',
            statusCode: 200,
            message: 'Data fetched successfully',
            response: expect.objectContaining({
                id: expect.any(Number),
                title: bookPayload.title,
                isbn: bookPayload.isbn,
                genre: bookPayload.genre,
                author: expect.objectContaining({
                    id: authorId,
                    firstName: 'Shahabuddin Junior',
                    lastName: 'Ahmed Junior',
                }),
            }),
        });

        const bookId = createResponse.body.response.id;

        const getResponse = await request(app.getHttpServer()).get(`/api/v1/books/${bookId}`).expect(200);

        expect(getResponse.body).toMatchObject({
            code: 'SUCCESS',
            statusCode: 200,
            response: expect.objectContaining({
                id: bookId,
                title: bookPayload.title,
                author: expect.objectContaining({
                    id: authorId,
                    firstName: 'Shahabuddin Junior',
                }),
            }),
        });

        const listResponse = await request(app.getHttpServer()).get('/api/v1/books').query({ authorId }).expect(200);

        expect(listResponse.body).toMatchObject({
            code: 'SUCCESS',
            statusCode: 200,
            response: expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: bookId,
                        title: bookPayload.title,
                    }),
                ]),
                total: 1,
                page: 1,
                limit: 10,
            }),
        });
    });
});
