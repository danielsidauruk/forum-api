class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams, userId) {
    const { id, threadId } = useCaseParams;

    await this._commentRepository.verifyCommentIsExist({ id, threadId });
    await this._commentRepository.verifyCommentOwner({ id, owner: userId });
    await this._commentRepository.deleteCommentById(id);
  }
}

module.exports = DeleteCommentUseCase;
