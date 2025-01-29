const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'johndoe',
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
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply correctly', async () => {
      // Arrange
      const reply = new AddReply({
        content: 'bla bla bla',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await replyRepositoryPostgres.addReply(reply);

      // Assert
      const foundReply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(foundReply).toHaveLength(1);
    });

    it('should return addReply correctly', async () => {
      // Arrange
      const reply = new AddReply({
        content: 'bla bla bla',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      const expectedAddedReply = new AddedReply({
        id: 'reply-123',
        content: 'bla bla bla',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(reply);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: expectedAddedReply.id,
          content: expectedAddedReply.content,
          owner: expectedAddedReply.owner,
        }),
      );
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return all replies by threadId correctly', async () => {
      // Arrange

      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'davidlee',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        content: 'bla bla bla',
        threadId: 'thread-123',
        owner: 'user-456',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'bla bla bla',
        owner: 'user-123',
        commentId: 'comment-123',
        date: '2025-01-24T16:36:11.362Z',
        isDeleted: false,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        content: 'bla bla bla',
        owner: 'user-456',
        commentId: 'comment-456',
        date: '2025-01-24T16:37:11.362Z',
        isDeleted: false,
      });

      const expectedReplies = [
        {
          id: 'reply-123',
          content: 'bla bla bla',
          username: 'johndoe',
          commentId: 'comment-123',
          date: '2025-01-24T16:36:11.362Z',
        },

        {
          id: 'reply-456',
          content: 'bla bla bla',
          username: 'davidlee',
          commentId: 'comment-456',
          date: '2025-01-24T16:37:11.362Z',
        },
      ];

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const foundReplies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(foundReplies).toEqual(expectedReplies);
    });
  });

  describe('verifyReplyIsExist function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(() => replyRepositoryPostgres.verifyReplyIsExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      })).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply is found', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'bla bla bla',
        owner: 'user-123',
        commentId: 'comment-123',
        date: '2025-01-24T16:36:11.362Z',
        isDeleted: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyIsExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      })).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when no access to delete the reply', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'bla bla bla',
        owner: 'user-123',
        commentId: 'comment-123',
        date: '2025-01-24T16:36:11.362Z',
        isDeleted: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(replyRepositoryPostgres.verifyReplyOwner({
        replyId: 'reply-123',
        owner: 'user-456',
      })).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when have access to delete the reply', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'bla bla bla',
        owner: 'user-123',
        commentId: 'comment-123',
        date: '2025-01-24T16:36:11.362Z',
        isDeleted: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner({
          replyId: 'reply-123',
          owner: 'user-123',
        }),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should delete the reply by comment replyId correctly', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'bla bla bla',
        owner: 'user-123',
        commentId: 'comment-123',
        date: '2025-01-24T16:36:11.362Z',
        isDeleted: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const foundReply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(foundReply[0].is_deleted).toBe(true);
    });
  });
});
