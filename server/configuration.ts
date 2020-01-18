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

        this.clientID = 111111111111;
        this.clientSecret = '111111111111aaaaaaaaaaa111111111111';
        this.deezerProfileId = 111111111111;

    }

}
