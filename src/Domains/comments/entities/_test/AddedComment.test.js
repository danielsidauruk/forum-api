const AddedComment = require('../AddedComment');

describe('a AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Dicoding Indonesia is the best',
    };

    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: true,
      owner: [],
    };

    // Action & Assert
    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create addedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Dicoding Indonesia is the best',
      owner: 'johndoe',
    };

    // Action
    const { id, content, owner } = new AddedComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
