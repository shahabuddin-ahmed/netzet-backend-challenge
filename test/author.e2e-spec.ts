import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, TestAppContext } from './utils/create-test-app';

describe('Author API (e2e)', () => {
  let app: INestApplication;
  let context: TestAppContext;

  beforeEach(async () => {
    context = await createTestApp();
    app = context.app;
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates, fetches, and filters authors', async () => {
    const payload = {
      firstName: 'Shahabuddin',
      lastName: 'Ahmed',
      bio: 'Author of islamic novels',
      birthDate: '1993-12-20',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/authors')
      .send(payload)
      .expect(201);

    expect(createResponse.body).toMatchObject({
      code: 'SUCCESS',
      statusCode: 200,
      message: 'Data fetched successfully',
      response: expect.objectContaining({
        id: expect.any(Number),
        firstName: payload.firstName,
        lastName: payload.lastName,
        bio: payload.bio,
        birthDate: payload.birthDate,
      }),
    });

    const authorId = createResponse.body.response.id;

    const getResponse = await request(app.getHttpServer())
      .get(`/api/v1/authors/${authorId}`)
      .expect(200);

    expect(getResponse.body).toMatchObject({
      code: 'SUCCESS',
      statusCode: 200,
      message: 'Data fetched successfully',
      response: expect.objectContaining({
        id: authorId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        bio: payload.bio,
        birthDate: payload.birthDate,
        books: [],
      }),
    });

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/authors')
      .query({ page: 1, limit: 10, firstName: 'Shahabuddin' })
      .expect(200);

    expect(listResponse.body).toMatchObject({
      code: 'SUCCESS',
      statusCode: 200,
      response: expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: authorId,
            firstName: payload.firstName,
          }),
        ]),
        total: 1,
        page: 1,
        limit: 10,
      }),
    });
  });
});
