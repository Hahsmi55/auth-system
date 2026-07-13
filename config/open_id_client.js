async function initOpenId() {
    const { generators, Issuer } = await import('openid-client');

    const googleIssuer = await Issuer.discover('https://accounts.google.com');

    const client = new googleIssuer.Client({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uris: [process.env.REDIRECT_URI],
        response_types: ['code']
    });

    return { client, generators };
}

module.exports = initOpenId;
