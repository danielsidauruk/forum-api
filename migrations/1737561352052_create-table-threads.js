exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      referencesConstraintName: 'fk_threads.owner_users.id',
      onDelete: 'CASCADE',
    },
    date: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('threads', 'fk_threads.owner_users.id');
  pgm.dropTable('threads');
};
