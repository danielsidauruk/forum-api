const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(thread) {
    const { title, body, owner } = thread;
    const threadId = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: `INSERT INTO
              threads (id, title, body, owner, date)
            VALUES
              ($1, $2, $3, $4, $5)
            RETURNING
              id, title, owner`,
      values: [threadId, title, body, owner, date],
    };

    const { rows } = await this._pool.query(query);
    return new AddedThread({ ...rows[0] });
  }

  async getThreadById(id) {
    const query = {
      text: `SELECT
              threads.id,
              threads.title,
              threads.body,
              threads.date,
              users.username
            FROM
              threads
            INNER JOIN
              users
            ON
              threads.owner = users.id
            WHERE 
              threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Thread not found');
    }

    return result.rows[0];
  }

  async verifyThreadIsExistById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Thread not found');
    }
  }

  async deleteThreadById(id) {
    const query = {
      text: 'DELETE FROM threads WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = ThreadRepositoryPostgres;
