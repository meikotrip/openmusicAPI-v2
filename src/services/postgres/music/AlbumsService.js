const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const type = 'album-';
    const id = type.concat(nanoid(12));

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal dalam menambahkan Album');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM  albums WHERE id = $1',
      values: [id],
    };
    const querySong = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    };

    const albumResult = await this._pool.query(queryAlbum);
    const songResult = await this._pool.query(querySong);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = albumResult.rows.map(mapDBToModel.albums)[0];
    return {
      ...album,
      songs: songResult.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal ditambahkan, Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus, Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
