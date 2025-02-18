const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'johndoe',
        password: 'supersecretpassword',
        fullname: 'John Doe',
      });

      await ThreadsTableTestHelper.addThread({
        title: 'Dicoding Indonesia is the best',
        body: 'bla bla bla',
      });

      const comment = new AddComment({
        content: 'bla bla bla',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await commentRepositoryPostgres.addComment(comment);

      // Assert
      const foundComment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(foundComment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'johndoe',
        password: 'supersecretpassword',
        fullname: 'John Doe',
      });

      await ThreadsTableTestHelper.addThread({
        title: 'Dicoding Indonesia is the best',
        body: 'bla bla bla',
      });

      const comment = new AddComment({
        content: 'bla bla bla',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(comment);

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'bla bla bla',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('deleteComment function', () => {
    it('should delete comment by id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'johndoe',
        password: 'supersecretpassword',
        fullname: 'John Doe',
      });

      await ThreadsTableTestHelper.addThread({
        title: 'Dicoding Indonesia is the best',
        body: 'bla bla bla',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      const comment = {
        id: 'comment-123',
        threadId: 'thread-123',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById(comment.id);
      const foundComment = await CommentsTableTestHelper.findCommentById(comment.id);

      // Assert
      expect(foundComment[0].is_deleted).toEqual(true);
    });
  });

  describe('verifyCommentIsExist function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(() => commentRepositoryPostgres.verifyCommentIsExist({
        commentId: 'comment-123',
        threadId: 'thread-123',
      })).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'johndoe',
        password: 'supersecretpassword',
        fullname: 'John Doe',
      });

      await ThreadsTableTestHelper.addThread({
        title: 'Dicoding Indonesia is the best',
        body: 'bla bla bla',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentIsExist({
        commentId: 'comment-123',
        threadId: 'thread-123',
      })).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when you are not authorized to delete the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'johndoe',
        password: 'supersecretpassword',
        fullname: 'John Doe',
      });

      await ThreadsTableTestHelper.addThread({
        title: 'Dicoding Indonesia is the best',
        body: 'bla bla bla',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(() => commentRepositoryPostgres.verifyCommentOwner({
        commentId: 'comment-123',
        owner: 'user-122',
      })).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when you are authorized to delete the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'johndoe',
        password: 'supersecretpassword',
        fullname: 'John Doe',
      });

      await ThreadsTableTestHelper.addThread({
        title: 'Dicoding Indonesia is the best',
        body: 'bla bla bla',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner({
          commentId: 'comment-123',
          owner: 'user-123',
        }),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return all comments from a thread correctly', async () => {
      // Arrange
      const user = {
        id: 'user-123',
        username: 'johndoe',
      };

      const thread = {
        id: 'thread-123',
      };

      const firstComment = {
        id: 'comment-123',
        date: '2025-01-24T16:36:10.362Z',
        content: 'bla bla bla',
        owner: 'user-123',
        isDeleted: false,
        likeCount: 2,
      };

      const secondComment = {
        id: 'comment-456',
        date: '2025-01-24T16:36:11.362Z',
        content: 'bla bla bla',
        owner: 'user-123',
        isDeleted: false,
        likeCount: 2,
      };

      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(thread);

      await CommentsTableTestHelper.addComment(firstComment);
      await CommentsTableTestHelper.addComment(secondComment);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toEqual([
        new DetailComment({ ...firstComment, username: 'johndoe' }),
        new DetailComment({ ...secondComment, username: 'johndoe' }),
      ]);
    });
  });
});
