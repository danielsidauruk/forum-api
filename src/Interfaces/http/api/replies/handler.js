const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postCommentReplyHandler = this.postCommentReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postCommentReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute(
      request.payload,
      request.params,
      owner,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    }).code(201);

    return response;
  }

  async deleteReplyHandler(request) {
    const { id: userId } = request.auth.credentials;
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name,
    );
    await deleteReplyUseCase.execute(request.params, userId);

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
