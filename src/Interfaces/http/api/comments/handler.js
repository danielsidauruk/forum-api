const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postAddCommentHandler = this.postAddCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postAddCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const addedComment = await addCommentUseCase.execute(
      request.payload,
      request.params,
      owner,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    }).code(201);
    return response;
  }

  async deleteCommentHandler(request) {
    const { id: userId } = request.auth.credentials;
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name,
    );

    await deleteCommentUseCase.execute(request.params, userId);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
