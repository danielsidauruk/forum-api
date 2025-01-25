const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating delete comment correctly', async () => {
    // Arrange
    const params = {
      id: 'comment-123',
      threadId: 'thread-123',
    };
    const owner = 'user-123';

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.verifyCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Act
    await deleteCommentUseCase.execute(params, owner);

    // Assert
    expect(mockCommentRepository.verifyCommentIsExist).toBeCalledWith({
      id: params.id,
      threadId: params.threadId,
    });

    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith({
      id: params.id,
      owner,
    });

    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(
      params.id,
    );
  });
});
