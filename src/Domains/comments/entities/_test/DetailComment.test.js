const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'johndoe',
      date: new Date().toISOString(),
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: 123,
      date: 123,
      content: 123,
      isDeleted: 'true',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATIONS');
  });

  it('should get data detail comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'johndoe',
      date: new Date().toISOString(),
      content: 'bla bla bla',
      isDeleted: false,
    };
    // Action
    const {
      id,
      username,
      date,
      content,
    } = new DetailComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
  });

  it('should get data detail comment with deleted comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'johndoe',
      date: new Date().toISOString(),
      content: 'bla bla bla',
      isDeleted: true,
    };
    // Action
    const {
      id,
      username,
      date,
      content,
    } = new DetailComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**komentar telah dihapus**');
  });
});
