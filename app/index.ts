import { Application } from "express";
import express from "express";
import Server from "./Server";
import mongoose from "mongoose";
import * as fs from "fs";
import { IServerConfig } from "./IServerConfig";

mongoose.connect("mongodb://localhost:27017/deadgg", {
    useNewUrlParser: true
});

let config = <IServerConfig>JSON.parse(fs.readFileSync("config.json").toString());
let app: Application = express();

let server = new Server(app, config.port, config);

if (server) {
    server.start();
}
