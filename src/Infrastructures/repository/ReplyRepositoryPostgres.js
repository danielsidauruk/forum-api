const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../Domains/replies/entities/DetailReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply({ content, owner, commentId }) {
    const replyId = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: `INSERT INTO
              replies (id, content, owner, comment_id, date)
            VALUES
              ($1, $2, $3, $4, $5)
            RETURNING
              id, content, owner`,
      values: [replyId, content, owner, commentId, date],
    };

    const { rows } = await this._pool.query(query);
    return new AddedReply({ ...rows[0] });
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT
              replies.id,
              replies.content,
              users.username,
              replies.comment_id,
              replies.date,
              replies.is_deleted
            FROM 
              replies
            INNER JOIN
              comments
            ON
              replies.comment_id = comments.id
            INNER JOIN
              users ON replies.owner = users.id
            WHERE
              comments.thread_id = $1
            ORDER BY
              replies.date ASC`,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);
    return rows.map(
      (reply) => new DetailReply({
        ...reply,
        commentId: reply.comment_id,
        isDeleted: reply.is_deleted,
      }),
    );
  }

  async verifyReplyIsExist({ threadId, commentId, replyId }) {
    const query = {
      text: `SELECT
              1
            FROM
              replies
            INNER JOIN
              comments
            ON
              replies.comment_id = comments.id
            INNER JOIN
              threads
            ON
              comments.thread_id = threads.id
            WHERE
              threads.id = $1
            AND
              comments.id = $2
            AND
              replies.id = $3`,
      values: [threadId, commentId, replyId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) throw new NotFoundError('reply not found');
  }

  async verifyReplyOwner({ replyId, owner }) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new AuthorizationError(
        'you are not authorized to delete the reply',
      );
    }
  }
}

module.exports = ReplyRepositoryPostgres;
