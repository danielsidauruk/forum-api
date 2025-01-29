const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload, params, owner) {
    const { threadId } = params;
    await this._threadRepository.verifyThreadIsExistById(threadId);
    const comment = new AddComment({
      ...payload,
      owner,
      threadId,
    });

    return this._commentRepository.addComment(comment);
  }
}

module.exports = AddCommentUseCase;
