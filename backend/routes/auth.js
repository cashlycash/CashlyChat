module.exports = (app, io, db) => {
  app.get("/auth/logout", async (req, res) => {
    if (req.session && req.session.token && req.session.user) {
      await db.delete(`tokenvalue.${req.session.token}`);
      var tokendevice = (
        await db.get(`devices.${req.session.user.username}`)
      ).find((d) => d.token === req.session.token);
      await db.pull(`devices.${req.session.user.username}`, tokendevice);
    }
    req.session.destroy();
    res.redirect("/auth/login");
  });

  app.get("/auth/login", (req, res) => {
    res.render("login", {
      error: req.query.error,
      req: req,
    });
  });

  app.post("/auth/login", async (req, res) => {
    req.body.username = req.body.username.toLowerCase();

    if (!req.body.username || !req.body.password) {
      res.redirect("/auth/login?error=Invalid username or password");
      return;
    }

    var user = await db.get(`user.${req.body.username}`);
    if (!user) {
      res.redirect("/auth/login?error=Invalid username or password");
      return;
    }

    if (user.password !== req.body.password) {
      res.redirect("/auth/login?error=Invalid username or password");
      return;
    }

    req.session.token = Math.random().toString(36).substring(7);
    await db.set(`tokenvalue.${req.session.token}`, user);
    await db.push(`devices.${user.username}`, {
      token: req.session.token,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    });

    res.redirect("/");
  });

  app.get("/auth/register", (req, res) => {
    res.render("register", {
      error: req.query.error,
      req: req,
    });
  });

  app.post("/auth/register", async (req, res) => {
    req.body.username = req.body.username.toLowerCase();

    if (!/^[a-zA-Z0-9]+$/.test(req.body.username)) {
      res.redirect(
        "/register?error=Username can only contain letters and numbers"
      );
      return;
    }

    if (req.body.username.length < 3 || req.body.username.length > 16) {
      res.redirect(
        "/register?error=Username must be between 3 and 16 characters"
      );
      return;
    }

    if (req.body.password.length < 8 || req.body.password.length > 32) {
      res.redirect(
        "/register?error=Password must be between 8 and 32 characters"
      );
      return;
    }

    if (!req.body.username || !req.body.password) {
      res.redirect("/register?error=Invalid username or password");
      return;
    }

    var user = await db.get(`user.${req.body.username}`);
    var users = await db.get("users");
    if (user || users.includes(req.body.username)) {
      res.redirect("/register?error=Username already exists");
      return;
    }

    var userid = ((await db.get(`userid`)) || 0).toString();

    await db.set(`user.${req.body.username}`, {
      id: userid,
      username: req.body.username,
      password: req.body.password,
    });

    await db.add(`userid`, 1);

    req.session.token = Math.random().toString(36).substring(7);

    await db.set(`tokenvalue.${req.session.token}`, {
      username: req.body.username,
      password: req.body.password,
    });
    await db.push(`users`, req.body.username);
    await db.set(`devices.${req.body.username}`, [
      {
        id: userid,
        useragent: req.headers["user-agent"],
        token: req.session.token,
        ipinfo: req.ipInfo,
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      },
    ]);

    res.redirect("/");
  });
};
