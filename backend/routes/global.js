module.exports = (app, io, db) => {

  app.get("/", async (req, res) => {
    res.render("index", {
      req: req,
      user: req.session.user,
    });
  });

  app.get("/home", async (req, res) => {
    res.render("home", {
      req: req,
      user: req.session.user,
    });
  });

  app.get("/chat", async (req, res) => {
    res.render("dashboard", {
      users: await db.get(`friends.${req.session.user.username}`) || [],
      req: req,
      user: req.session.user,
    });
  });

}