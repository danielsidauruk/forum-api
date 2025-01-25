const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating delete reply correctly', async () => {
    // Arrange
    const params = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      id: 'reply-123',
    };

    const owner = 'johndoe';

    const mockReplyRepository = new ReplyRepository();

    mockReplyRepository.verifyReplyIsExist = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn().mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(params, owner);

    // Assert
    expect(mockReplyRepository.verifyReplyIsExist).toBeCalledWith({
      threadId: params.threadId,
      commentId: params.commentId,
      id: params.id,
    });

    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith({
      id: params.id,
      owner,
    });

    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(params.id);
  });
});
