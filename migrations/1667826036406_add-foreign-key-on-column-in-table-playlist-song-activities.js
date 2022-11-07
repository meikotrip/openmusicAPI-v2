/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id');
  pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.song_id_songs.id');
  pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.user_id_users.id');
};
