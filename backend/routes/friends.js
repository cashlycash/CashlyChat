var notify = require("../functions/notify");

module.exports = (app, io, db) => {
  app.get("/friends", async (req, res) => {
    res.render("friends/dash", {
      req: req,
      user: req.session.user,
      friends: (await db.get(`friends.${req.session.user.username}`)) || [],
      pending: (await db.get(`pending.${req.session.user.username}`)) || [],
    });
  });

  app.get("/friends/find", async (req, res) => {
    res.render("friends/find", {
      req: req,
      user: req.session.user,
      users: await db.get("users"),
      pending: (await db.get(`requests.${req.session.user.username}`)) || [],
    });
  });

  app.get("/friends/accept/:username", async (req, res) => {

    var user = await db.get(`user.${req.params.username}`);
    if (!user) {
      res.redirect("/friends?error=Invalid username");
      return;
    }

    if (user === req.session.user) {
      res.redirect("/friends?error=You cannot friend yourself");
      return;
    }

    if (
      !(await db.get(`pending.${req.session.user.username}`)).includes(
        user.username
      )
    ) {
      res.redirect("/friends?error=You have not received a request");
      return;
    }

    if (
      (await db.get(`friends.${req.session.user.username}`)).includes(
        user.username
      )
    ) {
      res.redirect("/friends?error=You are already friends");
      return;
    }

    await db.push(`friends.${req.session.user.username}`, user.username);
    await db.push(`friends.${user.username}`, req.session.user.username);
    await db.delete(`pending.${req.session.user.username}`, user.username);
    await db.delete(`requests.${user.username}`, req.session.user.username);
    await notify({
      username: user.username,
      message: `${req.session.user.username} accepted your friend request`,
      type: "success",
      autoremove: 2500,
      db, io
    });
    res.redirect("/friends?success=Friend request accepted");
  });

  app.get("/friends/decline/:username", async (req, res) => {
    var user = await db.get(`user.${req.params.username}`);
    if (!user) {
      res.redirect("/friends?error=Invalid username");
      return;
    }

    if (user === req.session.user) {
      res.redirect("/friends?error=You cannot friend yourself");
      return;
    }

    if (
      !(await db.get(`pending.${req.session.user.username}`)).includes(
        user.username
      )
    ) {
      res.redirect("/friends?error=You have not received a request");
      return;
    }

    if (
      (await db.get(`friends.${req.session.user.username}`)).includes(
        user.username
      )
    ) {
      res.redirect("/friends?error=You are already friends");
      return;
    }

    await db.delete(`pending.${req.session.user.username}`, user.username);
    await db.delete(`requests.${user.username}`, req.session.user.username);
    await notify({
      username: user.username,
      message: `${req.session.user.username} declined your friend request`,
      type: "danger",
      autoremove: 2500,
      db, io
    });
    res.redirect("/friends/find?success=Friend request declined");
  });

  app.get("/friends/request/:username", async (req, res) => {
    var user = await db.get(`user.${req.params.username}`);
    if (!user) {
      res.redirect("/friends/find?error=Invalid username");
      return;
    }

    if (user === req.session.user) {
      res.redirect("/friends/find?error=You cannot friend yourself");
      return;
    }

    await db.get(`requests.${req.session.user.username}`) ? null : db.set(`requests.${req.session.user.username}`, []);
    await db.get(`friends.${req.session.user.username}`) ? null : db.set(`friends.${req.session.user.username}`, []);
    await db.get(`pending.${req.session.user.username}`) ? null : db.set(`pending.${req.session.user.username}`, []);

    await db.get(`requests.${user.username}`) ? null : db.set(`requests.${user.username}`, []);
    await db.get(`friends.${user.username}`) ? null : db.set(`friends.${user.username}`, []);
    await db.get(`pending.${user.username}`) ? null : db.set(`pending.${user.username}`, []);

    if (
      (await db.get(`pending.${req.session.user.username}`)).includes(
        user.username
      )
    ) {
      res.redirect("/friends/find?error=You already sent a request");
      return;
    }

    if (
      (await db.get(`friends.${req.session.user.username}`)).includes(
        user.username
      )
    ) {
      res.redirect("/friends/find?error=You are already friends");
      return;
    }

    await db.push(`pending.${user.username}`, req.session.user.username);
    await db.push(`requests.${req.session.user.username}`, user.username);
    await notify({
      username: user.username,
      message: `${req.session.user.username} sent you a friend request`,
      type: "info",
      autoremove: 2500,
      db, io
    });

    res.redirect("/friends/find?success=Friend request sent");
  });

  app.get("/friends/cancel/:username", async (req, res) => {
    var user = await db.get(`user.${req.params.username}`);
    if (!user) {
      res.redirect("/friends?error=Invalid username");
      return;
    }

    if (user === req.session.user) {
      res.redirect("/friends?error=You cannot friend yourself");
      return;
    }

    if (
      !(await db.get(`pending.${req.session.user.username}`)).includes(
        user.username
      )
    ) {
      res.redirect("/friends?error=You have not sent a request");
      return;
    }

    if (
      (await db.get(`friends.${req.session.user.username}`)).includes(
        user.username
      )
    ) {
      res.redirect("/friends?error=You are already friends");
      return;
    }

    await db.delete(`pending.${req.session.user.username}`, user.username);
    await db.delete(`requests.${user.username}`, req.session.user.username);
    await notify({
      username: user.username,
      message: `${req.session.user.username} canceled your friend request`,
      type: "danger",
      autoremove: 2500,
      db, io
    });

    res.redirect("/friends?success=Friend request canceled");
  })

  app.get("/friends/remove/:username", async (req, res) => {
    var user = await db.get(`user.${req.params.username}`);
    if (!user) {
      res.redirect("/friends?error=Invalid username");
      return;
    }

    if (user === req.session.user) {
      res.redirect("/friends?error=You cannot befriend yourself");
      return;
    }

    if (
      !(await db.get(`friends.${req.session.user.username}`)).includes(
        user.username
      )
    ) {
      res.redirect("/friends?error=You are not friends");
      return;
    }

    if (
      !(await db.get(`friends.${user.username}`)).includes(
        req.session.user.username
      )
    ) {
      res.redirect("/friends?error=You are not friends");
      return;
    }

    await db.delete(`friends.${req.session.user.username}`, user.username);
    await db.delete(`friends.${user.username}`, req.session.user.username);
    await notify({
      username: user.username,
      message: `${req.session.user.username} removed you as a friend`,
      type: "danger",
      autoremove: 2500,
      db, io
    });
  
    res.redirect("/friends?success=Friend removed");
  })
};
