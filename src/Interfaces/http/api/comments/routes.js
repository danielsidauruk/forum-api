const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    // path: '/threads/{id}/comments',
    handler: handler.postAddCommentHandler,
    options: {
      auth: 'forum_api_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
    options: {
      auth: 'forum_api_jwt',
    },
  },
];

module.exports = routes;
