var data = {
  backend: {
    smtp: {
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: "hello@euph.live",
        pass: process.env.SMTP_PASS
      }
    }
  },
  "sitename": "CashlyChat",
  "version": "1.0.0",
  "account": "CashlyChat",
  "keywords": "live chat, chating, social media, friends",
  "description": "CashlyChat is a chat application that allows you to chat with your friends and family.",
  "author": {
    "name": "CashlyCash",
    "link": "https://discord.com/users/1056591132739506248"
  },
  "todo": {
    "enabled": true,
    "data": [
      {
        "completed": true,
        "text": "Password Change"
      },
      {
        "completed": true,
        "text": "Notifications"
      },
      {
        "completed": true,
        "text": "Friends System"
      },
      {
        "completed": false,
        "text": "Email Verification"
      },
      {
        "completed": false,
        "text": "Password Reset"
      },
      {
        "completed": false,
        "text": "Group DMs"
      },
    ]
  },
  "changelog": {
    "enabled": true,
    "data": [
      {
        "header": "CashlyChat v1.0.0",
        "text": [
          "Initial Release"
        ],
        "sent": "08/07/2023"
      }
    ]
  },
  "logo": "delete the current logo.png and put your logo in the assets folder and rename it to logo.png"
}

module.exports = data;