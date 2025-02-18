const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const AuthenticationTestHelper = require('../../../../tests/AutheticationTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
    await AuthenticationTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should return 200 when liking comment', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await AuthenticationTestHelper.getAccessTokenHelper(server);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: userId,
      });

      await CommentsTableTestHelper.addComment({
        id: requestParams.commentId,
        threadId: requestParams.threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(await LikesTableTestHelper.countCommentLikes(requestParams.commentId)).toBe(1);
    });

    it('should respond 401 when request does not include access token', async () => {
      // Arrange
      const server = await createServer(container);
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
      };

      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });

      await ThreadsTableTestHelper.addThread({
        id: requestParams.threadId,
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: requestParams.commentId,
        threadId: requestParams.threadId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
