
'use strict';

// vendor
import * as request from 'request';

// library


const DEEZER_RESOURCE_URI_TRACK: string = '/track';
const DEEZER_RESOURCE_URI_TRACKS: string = '/tracks';
const DEEZER_RESOURCE_URI_USER: string = '/user';
const DEEZER_RESOURCE_URI_PLAYLIST: string = '/playlist';
const DEEZER_RESOURCE_URI_PLAYLISTS: string = '/playlists';

const DEEZER_BASE_URL: string = 'http://api.deezer.com';

export default class DeezerLibrary {

    public constructor() {


    }

    public getPlaylist(playlistId: number) {

        return new Promise((resolve, reject) => {

            let parameters = {};

            let apiRequest = request({
                url: DEEZER_BASE_URL + DEEZER_RESOURCE_URI_PLAYLIST + '/' + playlistId,
                method: 'GET',
                qs: parameters,
                json: true
            }, (error, response, body) => {

                if ('error' in body) {

                    let reason = body.error;

                    // error
                    reject(new Error(reason));

                }

                // body:
                // checksum: string
                // data: string
                // next: string
                // total: number

                let playlist = body.data;

                resolve(playlist);

            });

        });

    }

    public getUserPlaylists(userId: number) {

        return new Promise((resolve, reject) => {

            let parameters = {};

            let apiRequest = request({
                url: DEEZER_BASE_URL + DEEZER_RESOURCE_URI_USER + '/' + userId + DEEZER_RESOURCE_URI_PLAYLISTS,
                method: 'GET',
                qs: parameters,
                json: true
            }, (error, response, body) => {

                if ('error' in body) {

                    let reason = body.error;

                    // error
                    reject(new Error(reason));

                }

                let userPlaylists = body.data;

                resolve(userPlaylists);

            });

        });

    }

    public getPlaylistTracks(playlistId: number) {

        return new Promise((resolve, reject) => {

            let parameters = {};

            let apiRequest = request({
                url: DEEZER_BASE_URL + DEEZER_RESOURCE_URI_PLAYLIST + '/' + playlistId + DEEZER_RESOURCE_URI_TRACKS,
                method: 'GET',
                qs: parameters,
                json: true
            }, (error, response, body) => {

                if ('error' in body) {

                    let reason = body.error;

                    // error
                    reject(new Error(reason));

                }

                let playlistTracks = body.data;

                resolve(playlistTracks);

            });

        });
    }

}
