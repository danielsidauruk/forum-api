const AddReplyUseCase = require('../AddReplyUseCase');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrating AddReply action correctly', async () => {
    // Arrange
    const payload = {
      content: 'bla bla bla',
    };

    const params = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const owner = 'user-123';

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'bla bla bla',
      owner,
    });

    // create dependency use case
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // mocking
    mockCommentRepository.verifyCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.addReply = jest.fn().mockImplementation(() => Promise.resolve(
      new AddedReply({
        id: 'reply-123',
        content: payload.content,
        owner,
      }),
    ));

    // creating use case instance
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Acction
    const addedReply = await addReplyUseCase.execute(payload, params, owner);

    // Assert
    expect(mockCommentRepository.verifyCommentIsExist).toBeCalledWith({
      commentId: params.commentId,
      threadId: params.threadId,
    });

    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply({
        content: payload.content,
        owner,
        commentId: params.commentId,
      }),
    );

    expect(addedReply).toStrictEqual(expectedAddedReply);
  });
});
