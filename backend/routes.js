const fs = require("fs");

module.exports = (app, io, db) => {
  app.use(async (req, res, next) => {
    if (req.url.startsWith("/auth")) {
      req.webdata = require("../webdata.js");
      next();
      return;
    }
    if (req.session.token) {
      var user = await db.get(`tokenvalue.${req.session.token}`);
      if (user) {
        
        req.session.user = user;
        req.webdata = require("../webdata.js");
        req.notifications = await db.get(`user.${req.session.user.username}.notifications`) || [];

        if (req.query.error) {
          req.session.error = req.query.error;
          res.redirect(req.url.split("?")[0]);
          return;
        } else {
          req.session.error = null;
        }
        if (req.query.success) {
          req.session.success = req.query.success;
          res.redirect(req.url.split("?")[0]);
          return;
        } else { 
          req.session.success = null;
        }

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
