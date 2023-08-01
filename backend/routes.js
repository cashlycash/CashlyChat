const fs = require("fs");

module.exports = (app, io, db) => {
  app.use(async (req, res, next) => {

    if (req.query.error || req.query.success) {
      req.session.error = req.query.error;
      req.session.success = req.query.success;
      res.redirect(req.url.split("?")[0]);
      return;
    }

    if (req.session.msgread === true) {
      req.session.error = null;
      req.session.success = null;
      req.session.msgread = null;
    }

    if (req.session.error || req.session.success) {
      req.session.msgread = true;
    }

    if (req.url.startsWith("/auth")) {
      req.webdata = require("../webdata.js");
      next();
      return;
    }
    if (req.session.token) {
      var user = await db.get(`tokenvalue.${req.session.token}`);
      if (user) {
        req.webdata = require("../webdata.js");
        req.session.user = user;
        req.notifications =
          (await db.get(`user.${req.session.user.username}.notifications`)) ||
          [];
        next();

        return;
      }
    }
    req.user = null;
    res.redirect("/auth/logout");
  });

  fs.readdirSync("./backend/routes").forEach((file) => {
    require(`./routes/${file}`)(app, io, db);
  });
};
