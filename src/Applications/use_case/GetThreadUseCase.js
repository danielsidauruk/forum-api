/* eslint-disable no-param-reassign */
class GetThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    thread.comments = comments.map((comment) => {
      const filteredReplies = replies
        .filter((reply) => reply.commentId === comment.id)
        .map((reply) => {
          delete reply.commentId;
          return reply;
        });

      return {
        ...comment,
        replies: filteredReplies,
      };
    });
    return thread;
  }
}

module.exports = GetThreadUseCase;
