class ManageCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentIsExist(commentId);

    const isCommentLiked = await this._likeRepository
      .checkIfUserLikeComment({ userId, commentId });

    if (isCommentLiked) {
      await this._likeRepository.unlikeComment({ commentId, userId });
    } else {
      await this._likeRepository.likeComment({ commentId, userId });
    }
  }
}

module.exports = ManageCommentLikeUseCase;
