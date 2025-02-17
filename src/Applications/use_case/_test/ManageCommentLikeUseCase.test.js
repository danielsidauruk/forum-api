const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ManageCommentLikeUseCase = require('../ManageCommentLikeUseCase');

describe('ManageCommentLikeUseCase', () => {
  it('should orchestrating the like action correctly', async () => {
    // Arrange
    const params = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadIsExistById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentIsExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkIfUserLikeComment = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.likeComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.unlikeComment = jest.fn(() => Promise.resolve());

    const manageCommentLikeUseCase = new ManageCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await manageCommentLikeUseCase.execute(params);

    // Assert
    expect(mockThreadRepository.verifyThreadIsExistById).toBeCalledWith(params.threadId);
    expect(mockCommentRepository.verifyCommentIsExist).toBeCalledWith({
      commentId: params.commentId,
      threadId: params.threadId,
    });
    expect(mockLikeRepository.checkIfUserLikeComment).toBeCalledWith({
      commentId: params.commentId,
      userId: params.userId,
    });
    expect(mockLikeRepository.likeComment).toBeCalledWith({
      commentId: params.commentId,
      userId: params.userId,
    });
    expect(mockLikeRepository.unlikeComment).not.toBeCalled();
  });

  it('should orchestrating the unlike action correctly', async () => {
    // Arrange
    const params = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-1234',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadIsExistById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentIsExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkIfUserLikeComment = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.likeComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.unlikeComment = jest.fn(() => Promise.resolve());

    const manageCommentLikeUseCase = new ManageCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await manageCommentLikeUseCase.execute(params);

    // Assert
    expect(mockThreadRepository.verifyThreadIsExistById).toBeCalledWith(params.threadId);
    expect(mockCommentRepository.verifyCommentIsExist).toBeCalledWith({
      commentId: params.commentId,
      threadId: params.threadId,
    });
    expect(mockLikeRepository.checkIfUserLikeComment).toBeCalledWith({
      commentId: params.commentId,
      userId: params.userId,
    });
    expect(mockLikeRepository.unlikeComment).toBeCalledWith({
      commentId: params.commentId,
      userId: params.userId,
    });
    expect(mockLikeRepository.likeComment).not.toBeCalled();
  });
});
