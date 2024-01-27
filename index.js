const express = require("express");
const expressip = require("express-ip");
require("ejs");

const app = express();

const { Database } = require("quickmongo");
var mongoLink = require("./webdata.js").mongoLink;

const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

const glob = require("glob");
const path = require("path");

const cookieParser = require("cookie-parser");

const session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);

const port = process.env.PORT || 3000;
const db = new Database(mongoLink);
db.on("ready", () => {
  console.log("Connected to the database");
});

// setting up the ip middleware

app.use(expressip().getIpInfoMiddleware);

// setting up the view engine

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "frontend"));

// parsing form data

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// cookies 

app.use(cookieParser());

// session

var sessionMiddleware = session({
  store: new MongoDBStore({
    uri: mongoLink,
    collection: 'mySessions'
  }),
  secret: "hottiecutiepootieredvelvetkake",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

// setting up the static files

app.use("/assets", express.static(path.join(__dirname, "assets")));

// handling backend files

var backend_files = glob.sync("./backend/*.js");
for (const file of backend_files) {
  require(`./${file}`)(app, io, db);
}

// preparing for first run

(async () => {
  await db.connect();

  if (!(await db.get("users"))) {
    await db.set("users", []);
  }
  if (!(await db.get("groups"))) {
    await db.set("groups", {});
  }
  if (!(await db.get("totalgroups"))) {
    await db.set("totalgroups", {});
  }
})();

// global messages handling

process.on("uncaughtException", (err) => {
  console.log(err);
});

process.on("beforeExit", () => {
  console.log(`Exiting Code`)
})

// starting the server

http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
