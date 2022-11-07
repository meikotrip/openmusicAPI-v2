/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    year: {
      type: 'INT',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(150)',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    duration: {
      type: 'INT',
    },
    album_id: {
      type: 'VARCHAR(50)',
      references: '"albums"',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
