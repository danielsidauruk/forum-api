const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating delete comment correctly', async () => {
    // Arrange
    const params = {
      commentId: 'comment-123',
      threadId: 'thread-123',
    };
    const owner = 'user-123';

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.verifyCommentIsExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    await deleteCommentUseCase.execute(params, owner);

    // Assert
    expect(mockCommentRepository.verifyCommentIsExist).toBeCalledWith({
      commentId: params.commentId,
      threadId: params.threadId,
    });
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith({
      commentId: params.commentId,
      owner,
    });
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(
      params.commentId,
    );
  });
});
