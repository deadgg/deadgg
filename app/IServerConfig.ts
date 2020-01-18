export interface IServerConfig {
    discord: {
        clientId: string;
        clientSecret: string;
        serverId: string;
        scope: string;
        redirect: string;
    };
    locales: string[];
    port: number;
}
