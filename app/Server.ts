import MainController from "./controllers/MainController";
import { Application } from "express";
import * as requestIp from "request-ip";
import * as bodyParser from "body-parser";
import express from "express";
import session from "express-session";
import { IServerConfig } from "./IServerConfig";
import i18n from "i18n-x";

require("http").globalAgent.maxSockets = Infinity;

class Server {
    private _ip: string;
    private _app: Application;
    private _port: number;
    private _config: IServerConfig;

    public get app(): Application {
        return this._app;
    }

    public start(): void {
        this._app.set("views", "views");
        this._app.set("view engine", "pug");

        this._app.use(express.static("public"));
        this._app.use(bodyParser.json());
        this._app.use(bodyParser.urlencoded({extended: true}));
        this._app.use(requestIp.mw());
        this._app.use(i18n({
            locales: this._config.locales
        }));
        this._app.use(session({
            saveUninitialized: true,
            resave: false,
            secret: "4631019a2f11ab7ce68ae80f4fb6d89c"
        }));
        this._app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        let controller = new MainController(this, this._config);

        this._app.use("/", controller.router);

		this._app.use(function(req, res) {
			res.status(404).render("404");
		});
		
        this._app.listen(this._port, () => {
            console.log("Listening at http://localhost:" + this._port + "/");
        });
    }

    public constructor(app: Application, port: number, config: IServerConfig) {
        this._app = app;
        this._port = port;
        this._config = config;
    }
}

export default Server;
