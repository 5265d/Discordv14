const fs = require('node:fs');
const path = require('node:path');
const readline = require('readline');

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

function banUser(userId, bannedDays) {
  const bannedAt = getCurrentDate();
  const banInfo = `${userId}, ${bannedDays}, ${bannedAt}`;

  fs.appendFileSync('./logs/banned-users.txt', `${banInfo}\n`);
}

function updateBanInfo(userId, bannedDays) {
  const bannedUsersFile = './logs/banned-users.txt';
  if (fs.existsSync(bannedUsersFile)) {
    const bannedUsers = fs
      .readFileSync(bannedUsersFile, 'utf-8')
      .split('\n')
      .map(line => line.trim());

    const updatedBanList = bannedUsers.map(line => {
      const [id, oldBannedDays, bannedAt] = line.split(',').map(item => item.trim());
      if (id === userId) {
        return `${id}, ${bannedDays}, ${bannedAt}`;
      }
      return line;
    });

    fs.writeFileSync(bannedUsersFile, updatedBanList.join('\n'));
  }
}

function unbanUser(userId) {
  const bannedUsersFile = './logs/banned-users.txt';
  if (fs.existsSync(bannedUsersFile)) {
    const bannedUsers = fs
      .readFileSync(bannedUsersFile, 'utf-8')
      .split('\n')
      .map(line => line.trim());

    const updatedBanList = bannedUsers.filter(line => {
      const [id] = line.split(',').map(item => item.trim());
      return id !== userId;
    });

    if (bannedUsers.length === updatedBanList.length) {
      return false;
    }

    fs.writeFileSync(bannedUsersFile, updatedBanList.join('\n'));
    return true;
  }

  return false;
}

function removeUserFromBanList(userId) {
  const bannedUsersFile = './logs/banned-users.txt';
  if (fs.existsSync(bannedUsersFile)) {
    const bannedUsers = fs
      .readFileSync(bannedUsersFile, 'utf-8')
      .split('\n')
      .map(line => {
        const [id] = line.split(',').map(item => item.trim());
        return id;
      });

    const updatedBanList = bannedUsers.filter(id => id !== userId);

    fs.writeFileSync(bannedUsersFile, updatedBanList.join('\n'));
  }
}

function clearCommands() {
  fs.unlinkSync('./logs/message-log.txt');
  console.log('Registro de comandos limpo com sucesso.');
}

module.exports = {
  getCurrentDate,
  banUser,
  updateBanInfo,
  unbanUser,
  removeUserFromBanList,
  clearCommands,
};

