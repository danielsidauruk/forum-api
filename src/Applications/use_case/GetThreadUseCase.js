/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

class GetThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParams) {
    const { id } = useCaseParams;
    const thread = await this._threadRepository.getThreadById(id);
    const comments = await this._commentRepository.getCommentsByThreadId(id);
    const replies = await this._replyRepository.getRepliesByThreadId(id);

    thread.comments = this._getRepliesForComment(comments, replies);

    return thread;
  }

  _getRepliesForComment(comments, replies) {
    comments.forEach((comment) => {
      const filteredReplies = replies
        .filter((reply) => reply.commentId === comment.id)
        .map((reply) => {
          delete reply.commentId;

          return reply;
        });

      comment.replies = filteredReplies;
    });

    return comments;
  }
}

module.exports = GetThreadUseCase;
