const ManageCommentLikeUseCase = require('../../../../Applications/use_case/ManageCommentLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;

    const manageCommentLikeUseCase = this._container.getInstance(
      ManageCommentLikeUseCase.name,
    );
    await manageCommentLikeUseCase.execute({ threadId, commentId, userId });

    const response = h.response({
      status: 'success',
    }).code(200);

    return response;
  }
}

module.exports = LikesHandler;
