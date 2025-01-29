const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'supersecretpassword',
        fullname: 'Dicoding Indonesia',
      });

      const thread = new AddThread({
        title: 'Dicoding Indonesia Is the best',
        body: 'bla bla bla',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await threadRepositoryPostgres.addThread(thread);

      // Assert
      const foundThread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(foundThread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'supersecretpassword',
        fullname: 'Dicoding Indonesia',
      });

      const thread = new AddThread({
        title: 'Dicoding Indonesia Is the best',
        body: 'bla bla bla',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(thread);

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'Dicoding Indonesia Is the best',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('verifyThreadIsExistById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      expect(() => threadRepositoryPostgres.verifyThreadIsExistById('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadIsExistById('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should return NotFoundError when thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      expect(() => {
        threadRepositoryPostgres.getThreadById('thread-123').rejects.toThrowError(NotFoundError);
      });
    });

    it('should return thread correctly', async () => {
      // Arrange
      const thread = {
        id: 'thread-123',
        title: 'Dicoding Indonesia Is the best',
        body: 'bla bla bla',
        date: new Date().toISOString(),
        owner: 'user-123',
      };

      const expectedThread = {
        id: 'thread-123',
        title: 'Dicoding Indonesia Is the best',
        body: 'bla bla bla',
        date: new Date().toISOString(),
        username: 'dicoding',
      };

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'supersecretpassword',
        fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread(thread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const foundThread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(foundThread).toEqual(expectedThread);
    });
  });
});
