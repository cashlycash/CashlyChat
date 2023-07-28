const { getChat, getId } = require("../functions/chat");

module.exports = (app, io, db) => {
  app.get("/", async (req, res) => {
    res.render("index", {
      req: req,
      user: req.session.user,
    });
  });

  app.get("/dashboard", async (req, res) => {
    res.render("dashboard", {
      users: await db.get(`friends.${req.session.user.username}`) || [],
      req: req,
      user: req.session.user,
    });
  });

  app.get("/chat/:username", async (req, res) => {
    var user = await db.get(`user.${req.params.username}`);
    if (!user) {
      res.redirect("/dashboard?error=Invalid username");
      return;
    }

    if (user === req.session.user) {
      res.redirect("/dashboard?error=You cannot DM yourself");
      return;
    }

    if (!(await db.get(`friends.${user.username}`))) {
      res.redirect("/dashboard?error=You are not friends with this user");
      return;
    }

    if (!(await db.get(`friends.${req.session.user.username}`)).includes(user.username)) {
      res.redirect("/dashboard?error=You are not friends with this user");
      return;
    }

    res.render("chat", {
      msgs: await getChat(db, req.session.user.username, user.username),
      req: req,
      chatid: await getId(db, req.session.user.username, user.username),
      user: req.session.user,
    });
  });
};
