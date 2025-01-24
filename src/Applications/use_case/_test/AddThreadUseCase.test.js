const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadUseCase', () => {
  it('should orchestrating add thread function correctly', async () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Dicoding Indonesia is the best',
      body: 'bla bla bla',
    };
    const owner = 'user-123';

    const expectedAddedThread = new AddedThread({
      id: payload.id,
      title: payload.title,
      owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(
      new AddedThread({
        id: payload.id,
        title: payload.title,
        owner,
      }),
    ));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(payload, owner);

    // Assert
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread({
        title: payload.title,
        body: payload.body,
        owner,
      }),
    );
    expect(addedThread).toStrictEqual(expectedAddedThread);
  });
});
