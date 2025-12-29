/* eslint-disable no-undef */
jest.mock('../config/db', () => {
  return {
    pool: {
      query: jest.fn(),
    },
  };
});

jest.mock('../utils/s3', () => ({
  uploadObject: jest.fn(),
  deleteObject: jest.fn(),
  getPresignedUrl: jest.fn(),
}));

const { pool } = require('../config/db');
const s3 = require('../utils/s3');
const UsersService = require('./usersService');

describe('UsersService image methods', () => {
  let service;

  beforeEach(() => {
    service = new UsersService();
    pool.query.mockReset();
    s3.uploadObject.mockReset();
    s3.getPresignedUrl.mockReset();
    s3.deleteObject.mockReset();
  });

  test('createImage uploads and stores user_photo', async () => {
    const userId = '1';
    const file = { originalname: 'pic.jpg', buffer: Buffer.from('abc'), mimetype: 'image/jpeg' };
    const signedUrl = 'https://signed.example.com/users/1/new.jpg';

    s3.uploadObject.mockResolvedValue({});
    s3.getPresignedUrl.mockResolvedValue(signedUrl);

    pool.query.mockImplementation((sql, params) => {
      if (sql.startsWith('UPDATE users SET user_photo')) {
        return { rows: [{ id: userId, user_photo: signedUrl }] };
      }
      return { rows: [] };
    });

    const res = await service.createImage(userId, file);
    expect(s3.uploadObject).toHaveBeenCalled();
    expect(s3.getPresignedUrl).toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users SET user_photo'), [signedUrl, userId]);
    expect(res).toEqual({ id: userId, user_photo: signedUrl });
  });

  test('getImage returns presigned url when key parsed', async () => {
    const userId = '2';
    const storedUrl = 'https://example.com/users/2/existing.jpg';
    const presigned = 'https://signed.example.com/users/2/existing.jpg';

    pool.query.mockResolvedValue({ rows: [{ id: userId, user_photo: storedUrl }] });
    s3.getPresignedUrl.mockResolvedValue(presigned);

    const res = await service.getImage(userId);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM users WHERE id ='), [userId]);
    expect(s3.getPresignedUrl).toHaveBeenCalledWith('users/2/existing.jpg');
    expect(res).toEqual({ key: 'users/2/existing.jpg', url: presigned });
  });

  test('updateImage deletes previous object and uploads new one', async () => {
    const userId = '3';
    const oldUrl = 'https://example.com/users/3/old.jpg';
    const newSigned = 'https://signed.example.com/users/3/new.jpg';
    const file = { originalname: 'new.png', buffer: Buffer.from('xyz'), mimetype: 'image/png' };

    // First call: SELECT in getById
    // Second call: UPDATE inside createImage
    pool.query.mockImplementation((sql, params) => {
      if (sql.startsWith('SELECT * FROM users WHERE id')) {
        return { rows: [{ id: userId, user_photo: oldUrl }] };
      }
      if (sql.startsWith('UPDATE users SET user_photo')) {
        return { rows: [{ id: userId, user_photo: newSigned }] };
      }
      return { rows: [] };
    });

    s3.deleteObject.mockResolvedValue({});
    s3.uploadObject.mockResolvedValue({});
    s3.getPresignedUrl.mockResolvedValue(newSigned);

    const res = await service.updateImage(userId, file);
    expect(s3.deleteObject).toHaveBeenCalledWith('users/3/old.jpg');
    expect(s3.uploadObject).toHaveBeenCalled();
    expect(res).toEqual({ id: userId, user_photo: newSigned });
  });

  test('deleteImage removes s3 object and clears user_photo', async () => {
    const userId = '4';
    const oldUrl = 'https://example.com/users/4/old.jpg';

    pool.query.mockImplementation((sql, params) => {
      if (sql.startsWith('SELECT * FROM users WHERE id')) {
        return { rows: [{ id: userId, user_photo: oldUrl }] };
      }
      if (sql.startsWith('UPDATE users SET user_photo = NULL')) {
        return { rows: [{ id: userId, user_photo: null }] };
      }
      return { rows: [] };
    });

    s3.deleteObject.mockResolvedValue({});

    const res = await service.deleteImage(userId);
    expect(s3.deleteObject).toHaveBeenCalledWith('users/4/old.jpg');
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users SET user_photo = NULL'), [userId]);
    expect(res).toEqual({ id: userId, user_photo: null });
  });
});
