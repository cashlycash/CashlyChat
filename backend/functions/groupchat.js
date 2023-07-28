module.exports = {
  createGroup: async (db, username, name, users) => {
    var groupid = await db.get(`totalgroups`).length + 1
    db.push(`totalgroups`,{
      name: name,
      id: groupid,
      owner: username,
      members: users,
    });
  },
  getGroups: async (db, username) => {
    var groups = await db.get(`groups.${username}`);
    if (!groups) {
      await db.set(`groups.${username}`, []);
      groups = await db.get(`groups.${username}`);
    }
    return groups;
  },
  getChat: async (db, roomid) => {
    var chat = await db.get(`grpchats.${id}`);
    if (!chat) {
      await db.set(`grpchats.${id}`, []);
      chat = await db.get(`grpchats.${id}`);
    }
    return chat;
  },
  addMessage: async (db, roomid, username, value) => {
    var chat = (await db.get(`grpchats.${roomid}`)) || [];
    chat.push({
      author: username,
      content: value,
    });
    await db.set(`grpchats.${roomid}`, chat);
  },
};
