module.exports = (app, io, db) => {
  app.get("/account", async (req, res) => {
    res.render("account/account", {
      devices: (await db.get(`devices.${req.session.user.username}`)) || [],
      tokens: (await db.get(`tokens.${req.session.user.username}`)) || [],
      req: req,
      user: req.session.user,
    });
  });

  app.get("/account/change-password", async (req, res) => {
    res.render("account/change-password", {
      req: req,
      user: req.session.user,
    });
  });

  app.post("/account/change-password", async (req, res) => {
    if (req.body.oldpassword !== req.session.user.password) {
      res.redirect("/account/change-password?error=Invalid password");
      return;
    }
    if (!req.body.password) {
      res.redirect("/account/change-password?error=Please enter a password");
      return;
    }
    if (req.body.password.length < 8) {
      res.redirect(
        "/account/change-password?error=Password must be at least 8 characters long"
      );
      return;
    }
    if (req.body.password.length > 32) {
      res.redirect(
        "/account/change-password?error=Password must be less than 64 characters long"
      );
      return;
    }
    if (req.body.password !== req.body.password2) {
      res.redirect("/account/change-password?error=Passwords do not match");
      return;
    }
    await db.set(`user.${req.session.user.username}.password`, req.body.password);
    res.redirect("/account");
  });

  app.get("/account/logout/:id", async (req, res) => {
    var device = (await db.get(`devices.${req.session.user.username}`))[
      parseInt(req.params.id)
    ];
    if (!device) {
      res.redirect("/account?error=Invalid device");
      return;
    }
    await db.delete(`tokenvalue.${device.token}`);
    await db.pull(`devices.${req.session.user.username}`, device);
    res.redirect("/account");
  });
};
