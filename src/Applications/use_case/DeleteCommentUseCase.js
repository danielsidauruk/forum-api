class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams, userId) {
    const { commentId, threadId } = useCaseParams;

    await this._commentRepository.verifyCommentIsExist({ commentId, threadId });
    await this._commentRepository.verifyCommentOwner({ commentId, owner: userId });
    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
