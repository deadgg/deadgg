import { Router, Request, Response } from "express";
import DiscordAuth from "discord-oauth2";
import Server from "../Server";
import User, { IUser } from "../models/User";
import { IServerConfig } from "../IServerConfig";

class MainController {
    private _router: Router;
    private _server: Server;
    private _auth: DiscordAuth;
    private _config: IServerConfig;

    public constructor(server: Server, config: IServerConfig) {
        this._server = server;
        this._router = Router();
        this._auth = new DiscordAuth();
        this._config = config;

        this._router.get("/", this.getRouteHome.bind(this));
        this._router.get("/logout", this.getRouteLogout.bind(this));
        this._router.get("/login", this.getRouteLogin.bind(this));
        this._router.get("/games", this.getRouteGames.bind(this));
        this._router.get("/about", this.getRouteAbout.bind(this));
        this._router.get("/contact", this.getRouteContact.bind(this));
        this._router.get("/discord/callback", this.getDiscordCallback.bind(this));
    }

    public get router(): Router {
        return this._router;
    }

    public async validateSession(req: Request): Promise<IUser> {
        if (req.session.discordToken) {
            const discordUser = await this._auth.getUser(req.session.discordToken);

            if (discordUser) {
                return await User.findOne({
                    discordId: discordUser.id
                }).exec();
            }
        }
    }

    private async getRouteGames(req: Request, res: Response): Promise<void> {
        const user = await this.validateSession(req);

        const success = req.session.success;
        const error = req.session.error;

        req.session.success = undefined;
        req.session.error = undefined;

        res.render("games", {
            locale: req.i18n.getLocale(),
            success: success,
            error: error,
            user: user
        });
    }

    private async getRouteAbout(req: Request, res: Response): Promise<void> {
        const user = await this.validateSession(req);

        const success = req.session.success;
        const error = req.session.error;

        req.session.success = undefined;
        req.session.error = undefined;

        res.render("about", {
            locale: req.i18n.getLocale(),
            success: success,
            error: error,
            user: user
        });
    }

    private async getRouteContact(req: Request, res: Response): Promise<void> {
        const user = await this.validateSession(req);

        const success = req.session.success;
        const error = req.session.error;

        req.session.success = undefined;
        req.session.error = undefined;

        res.render("contact", {
            locale: req.i18n.getLocale(),
            success: success,
            error: error,
            user: user
        });
    }

    private async getRouteHome(req: Request, res: Response): Promise<void> {
        const user = await this.validateSession(req);

        const success = req.session.success;
        const error = req.session.error;

        req.session.success = undefined;
        req.session.error = undefined;

        res.render("home", {
            locale: req.i18n.getLocale(),
            success: success,
            error: error,
            user: user
        });
    }

    private async getRouteLogout(req: Request, res: Response): Promise<void> {
        const user = await this.validateSession(req);

        if (!user) {
            req.session.error = "Unable to log out, not currently logged in!";
            res.redirect("/");
            return;
        }

        req.session.discordToken = undefined;

        res.redirect("/");
    }

    private async getRouteLogin(req: Request, res: Response): Promise<void> {
        const CLIENT_ID = this._config.discord.clientId;
        const REDIRECT = encodeURIComponent(this._config.discord.redirect);
        const SCOPE = encodeURIComponent(this._config.discord.scope);

        res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}&response_type=code&redirect_uri=${REDIRECT}`);
    }

    private async getDiscordCallback(req: Request, res: Response): Promise<void> {
        const CLIENT_SECRET = this._config.discord.clientSecret;
        const CLIENT_ID = this._config.discord.clientId;
        const REDIRECT = this._config.discord.redirect;
        const SCOPE = this._config.discord.scope;

        const discordToken = await this._auth.tokenRequest({
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            code: req.query.code,
            scope: SCOPE,
            grantType: "authorization_code",
            redirectUri: REDIRECT
        })

        if (discordToken) {
            const discordUser = await this._auth.getUser(discordToken.access_token);

            if (discordUser) {
                const user = await User.findOne({
                    discordId: discordUser.id
                });

                if (!user) {
                    let newUser = new User({
                        discordId: discordUser.id,
                        email: discordUser.email
                    });
        
                    await newUser.save();
                }

                req.session.discordToken = discordToken.access_token;
            }
        }

        res.redirect("/");
    }
}

export default MainController;
