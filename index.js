const express = require("express");
const expressip = require("express-ip");
require("ejs");

const app = express();

const { QuickDB } = require("quick.db");

const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

const glob = require("glob");
const path = require("path");

const sqlite = require("better-sqlite3");
const session = require("express-session");
const session_store = require("better-sqlite3-session-store");

const port = process.env.PORT || 3000;
const db = new QuickDB({
  filePath: `./database.db`,
});

// setting up the ip middleware

app.use(expressip().getIpInfoMiddleware);

// setting up the view engine

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "frontend"));

// parsing form data

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session

const session_db = new sqlite("sessions.db");
const SqliteStore = session_store(session);
var sessionMiddleware = session({
  store: new SqliteStore({
    client: session_db,
    expired: {
      clear: true,
      intervalMs: 900000,
    },
  }),
  secret: "eliagyjaygp923",
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
  require(`.\\${file}`)(app, io, db);
}

// preparing for first run

(async () => {
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

// starting the server

http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
