const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthenticationTestHelper = require('../../../../tests/AutheticationsTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response with 401 when no access token provided', async () => {
      // Arrange
      const server = await createServer(container);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const requestPayload = {
        content: 'sebuah balasan',
      };

      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: 'user-123',
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: requestParams.threadId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response with 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await AuthenticationTestHelper.getAccessTokenHelper(server);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const requestPayload = {};

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: requestParams.threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response with 400 when payload not meet data specifications', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await AuthenticationTestHelper.getAccessTokenHelper(server);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const requestPayload = {
        content: [],
      };

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: requestParams.threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response with 201 and persisted comment', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await AuthenticationTestHelper.getAccessTokenHelper(server);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const requestPayload = {
        content: 'sebuah balasan',
      };

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: requestParams.threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      const {
        data: { addedReply },
      } = responseJson;
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(typeof responseJson.data).toBe('object');
      expect(typeof addedReply).toBe('object');
      expect(addedReply.id).toBeDefined();
      expect(addedReply.content).toBeDefined();
      expect(addedReply.owner).toBeDefined();
    });
  });

  describe('when DELETE when POST /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response with 401 when no access token provided', async () => {
      // Arrange
      const server = await createServer(container);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };

      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: 'user-123',
      });

      await CommentTableTestHelper.addComment({
        id: requestParams.commentId,
        threadId: requestParams.threadId,
      });

      await RepliesTableTestHelper.addReply({
        id: requestParams.replyId,
        commentId: requestParams.commentId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies/${requestParams.replyId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response with 404 when reply not found', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await AuthenticationTestHelper.getAccessTokenHelper(server);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: requestParams.commentId,
        threadId: requestParams.threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies/${requestParams.replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response with 403 when no access to delete the reply', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await AuthenticationTestHelper.getAccessTokenHelper(server);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };

      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'davidlee',
      });

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: requestParams.commentId,
        threadId: requestParams.threadId,
        owner: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: requestParams.replyId,
        commentId: requestParams.commentId,
        owner: 'user-456',
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies/${requestParams.replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response with 200 when delete reply correctly', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await AuthenticationTestHelper.getAccessTokenHelper(server);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: requestParams.commentId,
        threadId: requestParams.threadId,
        owner: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: requestParams.replyId,
        commentId: requestParams.commentId,
        owner: userId,
      });

      // Actions
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies/${requestParams.replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
