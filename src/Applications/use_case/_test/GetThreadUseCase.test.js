const GetThreadUseCase = require('../GetThreadUseCase');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrating get detail thread action correctly', async () => {
    // Arrange
    const params = {
      threadId: 'thread-123',
    };

    const thread = {
      id: 'thread-123',
      title: 'Dicoding Indonesia is the best',
      body: 'bla bla bla',
      date: '2025-01-25T14:03:49.915Z',
      username: 'johndoe',
    };

    const comments = [
      new DetailComment({
        id: 'comment-123',
        username: 'johndoe',
        date: '2025-01-25T14:03:49.915Z',
        content: 'bla bla bla',
        isDeleted: false,
      }),

      new DetailComment({
        id: 'comment-456',
        username: 'davidlee',
        date: '2025-01-25T14:03:49.915Z',
        content: 'bla bla bla',
        isDeleted: true,
      }),
    ];

    const replies = [
      new DetailReply({
        id: 'reply-123',
        content: 'bla bla bla',
        date: '2025-01-25T14:03:49.915Z',
        username: 'johndoe',
        commentId: 'comment-123',
        isDeleted: false,
      }),

      new DetailReply({
        id: 'reply-456',
        content: 'bla bla bla',
        date: '2025-01-25T14:03:49.915Z',
        username: 'davidlee',
        commentId: 'comment-456',
        isDeleted: true,
      }),
    ];

    const expectedCommentsAndReplies = {
      id: 'thread-123',
      title: 'Dicoding Indonesia is the best',
      username: 'johndoe',
      date: '2025-01-25T14:03:49.915Z',
      body: 'bla bla bla',
      comments: [
        {
          id: 'comment-123',
          date: '2025-01-25T14:03:49.915Z',
          content: 'bla bla bla',
          username: 'johndoe',
          likeCount: 1,
          replies: replies
            .filter((reply) => reply.commentId === 'comment-123')
            .map((reply) => ({
              id: reply.id,
              content: reply.isDeleted ? '**balasan telah dihapus**' : reply.content,
              date: reply.date,
              username: reply.username,
            })),
        },
        {
          id: 'comment-456',
          content: '**komentar telah dihapus**',
          date: '2025-01-25T14:03:49.915Z',
          username: 'davidlee',
          likeCount: 1,
          replies: replies
            .filter((reply) => reply.commentId === 'comment-456')
            .map((reply) => ({
              id: reply.id,
              content: reply.isDeleted ? '**balasan telah dihapus**' : reply.content,
              date: reply.date,
              username: reply.username,
            })),
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(thread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(replies));
    mockLikeRepository.countCommentLikes = jest.fn()
      .mockImplementation(() => Promise.resolve(1));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(params);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(params.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(params.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(params.threadId);
    expect(mockLikeRepository.countCommentLikes).toBeCalledWith(comments[0].id);

    expect(detailThread).toEqual(expectedCommentsAndReplies);
  });
});
