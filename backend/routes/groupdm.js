const { getGroups, createGroup } = require("../functions/groupchat");

module.exports = (app, io, db) => {
  app.get("/chat/group/create", async (req, res) => {
    res.render("groupchat/create", {
      req: req,
      user: req.session.user,
      users: await db.get(`friends.${req.session.user.username}`) || [],
    });
  })

  app.post("/chat/group/create", async (req, res) => {
    var { name, users } = req.body;
    var id = await createGroup(db, username, name, users);
    res.redirect("/chat/group/" + id);
  })
}