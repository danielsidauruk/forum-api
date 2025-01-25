const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postAddCommentHandler = this.postAddCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postAddCommentHandler(req, h) {
    const { id: owner } = req.auth.credentials;
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name,
    );

    const addedComment = await addCommentUseCase.execute(
      req.payload,
      req.params,
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

  async deleteCommentHandler(req) {
    const { id: userId } = req.auth.credentials;
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name,
    );

    await deleteCommentUseCase.execute(req.params, userId);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
