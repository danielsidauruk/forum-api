const DetailThread = require('../DetailThread');

describe('a DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Dicoding Indonesia is the best',
      body: 'bla bla bla',
      date: new Date().toISOString(),
      username: 'johndoe',
      // comments: ['blabla', 'blablabla'],
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      body: 123,
      date: {},
      username: 123,
      comments: {},
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATIONS',
    );
  });

  it('should get data detail thread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Dicoding Indonesia is the best',
      body: 'bla bla bla',
      date: new Date().toISOString(),
      username: 'johndoe',
      comments: ['blabla', 'blablabla'],
    };

    // Action
    const {
      id,
      title,
      body,
      date,
      username,
      comments,
    } = new DetailThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });
});
