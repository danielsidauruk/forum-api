const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'bla bla bla',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new AddReply(payload)).toThrowError(
      'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload not meet data type specifications', () => {
    // Arrange
    const payload = {
      content: 'bla bla bla',
      owner: {},
      commentId: [],
    };

    // Action & Assert
    expect(() => new AddReply(payload)).toThrowError(
      'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create newReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'bla bla bla',
      owner: 'user-123',
      commentId: 'comment-123',
    };

    // Action
    const { content, owner, commentId } = new AddReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(commentId).toEqual(payload.commentId);
  });
});
