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
      if (sql.startsWith('UPDATE users SET user_photo_key')) {
        return { rows: [{ id: userId, user_photo_key: 'users/1/new.jpg' }] };
      }
      return { rows: [] };
    });

    const res = await service.createImage(userId, file);
    expect(s3.uploadObject).toHaveBeenCalled();
    expect(s3.getPresignedUrl).toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users SET user_photo_key'), [expect.any(String), userId]);
    expect(res).toEqual({ id: userId, user_photo_key: 'users/1/new.jpg', user_photo: signedUrl });
  });

  test('getImage returns presigned url from stored key', async () => {
    const userId = '2';
    const storedKey = 'users/2/existing.jpg';
    const presigned = 'https://signed.example.com/users/2/existing.jpg';

    pool.query.mockResolvedValue({ rows: [{ id: userId, user_photo_key: storedKey }] });
    s3.getPresignedUrl.mockResolvedValue(presigned);

    const res = await service.getImage(userId);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM users WHERE id ='), [userId]);
    expect(s3.getPresignedUrl).toHaveBeenCalledWith(storedKey);
    expect(res).toEqual({ key: storedKey, url: presigned });
  });

  test('updateImage deletes previous object and uploads new one', async () => {
    const userId = '3';
    const oldKey = 'users/3/old.jpg';
    const newKey = 'users/3/new.jpg';
    const newSigned = 'https://signed.example.com/users/3/new.jpg';
    const file = { originalname: 'new.png', buffer: Buffer.from('xyz'), mimetype: 'image/png' };

    // First call: SELECT in getById
    // Second call: UPDATE inside createImage
    pool.query.mockImplementation((sql, params) => {
      if (sql.startsWith('SELECT * FROM users WHERE id')) {
        return { rows: [{ id: userId, user_photo_key: oldKey }] };
      }
      if (sql.startsWith('UPDATE users SET user_photo_key')) {
        return { rows: [{ id: userId, user_photo_key: newKey }] };
      }
      return { rows: [] };
    });

    s3.deleteObject.mockResolvedValue({});
    s3.uploadObject.mockResolvedValue({});
    s3.getPresignedUrl.mockResolvedValue(newSigned);

    const res = await service.updateImage(userId, file);
    expect(s3.deleteObject).toHaveBeenCalledWith(oldKey);
    expect(s3.uploadObject).toHaveBeenCalled();
    expect(res).toEqual({ id: userId, user_photo_key: newKey, user_photo: newSigned });
  });

  test('deleteImage removes s3 object and clears user_photo_key', async () => {
    const userId = '4';
    const oldKey = 'users/4/old.jpg';

    pool.query.mockImplementation((sql, params) => {
      if (sql.startsWith('SELECT * FROM users WHERE id')) {
        return { rows: [{ id: userId, user_photo_key: oldKey }] };
      }
      if (sql.startsWith('UPDATE users SET user_photo_key = NULL')) {
        return { rows: [{ id: userId, user_photo_key: null }] };
      }
      return { rows: [] };
    });

    s3.deleteObject.mockResolvedValue({});

    const res = await service.deleteImage(userId);
    expect(s3.deleteObject).toHaveBeenCalledWith(oldKey);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users SET user_photo_key = NULL'), [userId]);
    expect(res).toEqual({ id: userId, user_photo_key: null });
  });
});
