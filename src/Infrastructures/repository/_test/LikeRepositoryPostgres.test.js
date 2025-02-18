const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'johndoe',
    });

    await UsersTableTestHelper.addUser({
      id: 'user-456',
      username: 'davidlee',
    });

    await ThreadsTableTestHelper.addThread({
      threadId: 'thread-123',
      title: 'Dicoding Indonesia is the best',
      body: 'bla bla bla',
      owner: 'user-123',
    });

    await CommentsTableTestHelper.addComment({
      commentId: 'comment-123',
      content: 'bla bla bla',
      threadId: 'thread-123',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('checkIfUserLikeComment function', () => {
    it('should return true if user like the comment', async () => {
      // Arrange
      const payload = {
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
        date: new Date(),
      };

      await LikesTableTestHelper.addLike({ payload });

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const result = await likeRepositoryPostgres.checkIfUserLikeComment({
        commentId: 'comment-123',
        userId: 'user-123',
      });

      // Assert
      expect(result).toBe(true);
    });

    it("should return false if user didn't like the comment", async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const result = await likeRepositoryPostgres.checkIfUserLikeComment({
        commentId: 'comment-123',
        userId: 'user-123',
      });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('likeComment function', () => {
    it('should persist new like correctly', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-123',
        userId: 'user-123',
      };

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeRepositoryPostgres.likeComment(payload);

      // Assert
      const like = await LikesTableTestHelper.findLikeById('like-123');
      expect(like).toHaveLength(1);
    });
  });

  describe('unlikeComment function', () => {
    it('should delete like correctly', async () => {
      // Arrange
      const payload = {
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
        date: new Date(),
      };

      await LikesTableTestHelper.addLike(payload);

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeRepositoryPostgres.unlikeComment(payload);

      // Assert
      const like = await LikesTableTestHelper.findLikeById(payload.id);
      expect(like).toHaveLength(0);
    });
  });

  describe('countCommentLikes function', () => {
    it('should count likes correctly', async () => {
      // Arrange
      const payload01 = {
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
        date: new Date(),
      };

      const payload02 = {
        id: 'like-1234',
        commentId: 'comment-123',
        userId: 'user-456',
        date: new Date(),
      };

      await LikesTableTestHelper.addLike(payload01);
      await LikesTableTestHelper.addLike(payload02);

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const count = await likeRepositoryPostgres.countCommentLikes('comment-123');

      // Assert
      expect(count).toBe(2);
    });
  });
});
