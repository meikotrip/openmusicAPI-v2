const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationsError = require('../../../exceptions/AuthorizationsError');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist(name, owner) {
    const type = 'playlist-';
    const id = type.concat(nanoid(12));

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        LEFT JOIN users ON users.id = playlists.owner
        WHERE playlists.owner = $1 OR collaborations.user_id = $1
        GROUP BY playlists.id, users.username`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async addSongOnPlaylist(playlistId, songId, userId) {
    const type1 = 'PL-song-';
    const type2 = 'PL-activity-';
    const playlistSongId = type1.concat(nanoid(12));
    const playlistActivityId = type2.concat(nanoid(12));

    await this._pool.query('BEGIN');
    const addSongQuery = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [playlistSongId, playlistId, songId],
    };
    const playlistActivityQuery = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [playlistActivityId, playlistId, songId, userId, 'add'],
    };

    const addSongResult = await this._pool.query(addSongQuery);
    const playlistActivityResult = await this._pool.query(playlistActivityQuery);

    if (!addSongResult.rows[0].id || !playlistActivityResult.rows[0].id) {
      await this._pool.query('ROLLBACK');
      throw new InvariantError('Lagu gagal ditambahkan kedalam Playlist');
    }

    await this._pool.query('COMMIT');
  }

  async getPlaylistById(id) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };
    const songsQuery = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
      LEFT JOIN songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1`,
      values: [id],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    const songsResult = await this._pool.query(songsQuery);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = playlistResult.rows[0];
    return {
      ...playlist,
      songs: songsResult.rows,
    };
  }

  async deleteSongOnPlaylist(playlistId, songId, userId) {
    const type = 'PL-activity-';
    const playlistActivityId = type.concat(nanoid(12));

    await this._pool.query('BEGIN');

    const deleteSongQuery = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const playlistActivityQuery = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [playlistActivityId, playlistId, songId, userId, 'delete'],
    };

    const deleteSongResult = await this._pool.query(deleteSongQuery);
    const playlistActivityResult = await this._pool.query(playlistActivityQuery);

    if (!deleteSongResult.rows.length) {
      await this._pool.query('ROLLBACK');
      throw new NotFoundError('Playlist gagal dihapus, Id tidak ditemukan');
    }

    if (!playlistActivityResult.rows[0].id) {
      await this._pool.query('ROLLBACK');
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }
  }

  async getPlaylistActivitiesById(id) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities
      JOIN songs ON songs.id = playlist_song_activities.song_id
      JOIN users ON users.id = playlist_song_activities.user_id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows;
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationsError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
