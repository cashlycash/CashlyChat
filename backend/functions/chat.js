module.exports = {
  getChat: async (db, username, username2) => {
    var id1 = (await db.get(`user.${username}`)).id;
    var id2 = (await db.get(`user.${username2}`)).id;
    var id = [parseInt(id1), parseInt(id2)].sort().join("_");
    var chat = await db.get(`chats.${id}`);
    if (!chat) {
      await db.set(`chats.${id}`, []);
      chat = await db.get(`chats.${id}`);
    }
    return chat;
  },
  getId: async (db, username, username2) => {
    var id1 = (await db.get(`user.${username}`)).id;
    var id2 = (await db.get(`user.${username2}`)).id;
    var id = [parseInt(id1), parseInt(id2)].sort().join("_");
    return id;
  },
  getUserById: async (db, id) => {
    var users = await db.get("user");
    for (var i in users) {
      if (users[i].id == id) {
        return users[i];
      }
    }
  },
  addMessage: async (db, roomid, username, value) => {
    var chat = (await db.get(`chats.${roomid}`)) || [];
    chat.push({
      author: username,
      content: value,
    });
    await db.set(`chats.${roomid}`, chat);
  },
};
