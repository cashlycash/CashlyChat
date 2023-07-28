const { addMessage } = require("./functions/chat");

module.exports = (app, io, db) => {
  io.on("connection", (socket) => {
    socket.on("join", async (raw) => {
      var data = JSON.parse(raw);
      socket.join(`chat.${data.id}`);
    });
    socket.on("clearNotifications", async (raw) => {
      var user = socket.request.session.user;
      var notifications = await db.get(`user.${user.username}.notifications`);
      if (!notifications) return;
      await db.set(`user.${user.username}.notifications`, []);
    });
    socket.on("msg", async (raw) => {
      var data = JSON.parse(raw);

      if (!data.id || !data.value) return;
      if (data.value.length > 1000) return;
      if (data.value.length < 1) return;

      var recipient = data.recipient;
      var user = socket.request.session.user;

      await addMessage(db, data.id, user.username, data.value);

      console.log("Sending message to " + data.id);

      var chatsockets = await io.in(`chat.${data.id}`).fetchSockets();
      var globalsockets = await io.fetchSockets();
      if (!Array.from(chatsockets).find((s) => s.handshake.auth.id == recipient)){
        for (var i = 0; i < globalsockets.length; i++) {
          if (globalsockets[i].handshake.auth.id == recipient) {
            var text = `${recipient} sent a message : ${data.value}`
            globalsockets[i].emit(
              "notification",
              JSON.stringify({
                text: text.length > 50 ? text.slice(0, 50) + "..." : text,
                type: "info",
              })
            );
          }
        }
      }

      io.to(`chat.${data.id}`).emit(`chat`, {
        author: user.username,
        content: data.value,
      });
    });
  });
};
