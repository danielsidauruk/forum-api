const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postCommentReplyHandler(req, h) {
    const { id: owner } = req.auth.credentials;
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute(
      req.payload,
      req.params,
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

  async deleteReplyHandler(req) {
    const { id: userId } = req.auth.credentials;
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name,
    );
    await deleteReplyUseCase.execute(req.params, userId);

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
