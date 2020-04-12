export interface IConfiguration {
    clientID: number;
    clientSecret: string;
    deezerProfileId: number;
}

export class Configuration implements IConfiguration {
    readonly clientID: number;

    readonly clientSecret: string;

    readonly deezerProfileId: number;

    constructor() {
      // on deezer this is the "Application ID"
      this.clientID = 111111111111;
      // on deezer this is the "Secret Key"
      this.clientSecret = '7d247d41381cdff7817253a710a6ac06';
      // the ID of the profile from which you want to fetch the playlists
      // only public playlists will get fetched
      this.deezerProfileId = 111111111111;
    }
}
