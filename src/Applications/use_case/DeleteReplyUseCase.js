class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams, userId) {
    const { threadId, commentId, id } = useCaseParams;
    await this._replyRepository.verifyReplyIsExist({
      threadId,
      commentId,
      id,
    });
    await this._replyRepository.verifyReplyOwner({ id, owner: userId });
    await this._replyRepository.deleteReplyById(id);
  }
}

module.exports = DeleteReplyUseCase;
