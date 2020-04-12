// vendor
import * as request from 'request';

// library


const DEEZER_RESOURCE_URI_TRACK = '/track';
const DEEZER_RESOURCE_URI_TRACKS = '/tracks';
const DEEZER_RESOURCE_URI_USER = '/user';
const DEEZER_RESOURCE_URI_PLAYLIST = '/playlist';
const DEEZER_RESOURCE_URI_PLAYLISTS = '/playlists';

const DEEZER_BASE_URL = 'http://api.deezer.com';

export default class DeezerLibrary {
  public constructor() {


  }

  public getPlaylist(playlistId: number) {
    return new Promise((resolve, reject) => {
      const parameters = {};

      const apiRequest = request({
        url: `${DEEZER_BASE_URL + DEEZER_RESOURCE_URI_PLAYLIST}/${playlistId}`,
        method: 'GET',
        qs: parameters,
        json: true,
      }, (error, response, body) => {
        if ('error' in body) {
          const reason = body.error;

          // error
          reject(new Error(reason));
        }

        // body:
        // checksum: string
        // data: string
        // next: string
        // total: number

        const playlist = body.data;

        resolve(playlist);
      });
    });
  }

  public getUserPlaylists(userId: number) {
    return new Promise((resolve, reject) => {
      const parameters = {};

      const apiRequest = request({
        url: `${DEEZER_BASE_URL + DEEZER_RESOURCE_URI_USER}/${userId}${DEEZER_RESOURCE_URI_PLAYLISTS}`,
        method: 'GET',
        qs: parameters,
        json: true,
      }, (error, response, body) => {
        if ('error' in body) {
          const reason = body.error;

          // error
          reject(new Error(reason));
        }

        const userPlaylists = body.data;

        resolve(userPlaylists);
      });
    });
  }

  public getPlaylistTracks(playlistId: number) {
    return new Promise((resolve, reject) => {
      const parameters = {};

      const apiRequest = request({
        url: `${DEEZER_BASE_URL + DEEZER_RESOURCE_URI_PLAYLIST}/${playlistId}${DEEZER_RESOURCE_URI_TRACKS}`,
        method: 'GET',
        qs: parameters,
        json: true,
      }, (error, response, body) => {
        if ('error' in body) {
          const reason = body.error;

          // error
          reject(new Error(reason));
        }

        const playlistTracks = body.data;

        resolve(playlistTracks);
      });
    });
  }
}
