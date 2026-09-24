const { discovery } = require('openid-client');

async function initOpenId() {

    const config = await discovery(
        new URL('https://accounts.google.com'),
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET
    );

    return config;
}

module.exports = initOpenId;