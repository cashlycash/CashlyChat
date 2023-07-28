module.exports = async ({ username, message, type, autoremove, db, io }) => {
  if (!(await db.get(`user.${username}.notifications`))) {
    await db.set(`user.${username}.notifications`, []);
  }

  sockets = await io.fetchSockets();
  var socket = sockets.find((s) => s.handshake.auth.id == username);
  if (socket) {
    socket.emit(
      "notification",
      JSON.stringify({
        text: message,
        type: type,
        autoremove: autoremove || false,
      })
    );
  } else {
    db.push(`user.${username}.notifications`, {
      message: message,
      type: type,
      time: Date.now(),
    });
  }
};
