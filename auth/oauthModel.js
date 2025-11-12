// auth/oauthModel.js
// Minimal in-memory OAuth2 model for oauth2-server (development / testing only)

const crypto = require('crypto');

// In-memory stores
const tokens = {}; // accessToken -> token object
const clients = [
  {
    id: process.env.OAUTH_DEFAULT_CLIENT_ID || 'demo-client',
    clientSecret: process.env.OAUTH_DEFAULT_CLIENT_SECRET || 'demo-secret',
    grants: ['client_credentials', 'password'],
    redirectUris: []
  }
];
const users = [
  {
    id: '1',
    username: process.env.RO_USER_USERNAME || 'alice',
    password: process.env.RO_USER_PASSWORD || 'alicepass'
  }
];

module.exports = {
  getClient: async (clientId, clientSecret) => {
    const client = clients.find(c => c.id === clientId && (clientSecret ? c.clientSecret === clientSecret : true));
    if (!client) return null;
    return {
      id: client.id,
      grants: client.grants,
      redirectUris: client.redirectUris
    };
  },

  getUser: async (username, password) => {
    const u = users.find(user => user.username === username && user.password === password);
    if (!u) return null;
    return { id: u.id, username: u.username };
  },

  saveToken: async (token, client, user) => {
    const accessToken = token.accessToken || token.access_token || (crypto.randomBytes(32).toString('hex'));
    const accessTokenExpiresAt = token.accessTokenExpiresAt || token.access_token_expires_at || token.expiresAt || token.expires_in;
    tokens[accessToken] = {
      accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt || token.access_token_expires_at || token.expiresAt || new Date(Date.now() + (3600 * 1000)),
      client: client ? { id: client.id } : null,
      user: user ? { id: user.id, username: user.username } : null,
      scope: token.scope
    };
    return tokens[accessToken];
  },

  getAccessToken: async (bearerToken) => {
    const stored = tokens[bearerToken];
    if (!stored) return null;
    return {
      accessToken: stored.accessToken,
      accessTokenExpiresAt: stored.accessTokenExpiresAt,
      client: stored.client,
      user: stored.user
    };
  },

  revokeToken: async (token) => {
    // For refresh tokens - not implemented here
    return true;
  },

  getUserFromClient: async (client) => {
    // For client_credentials grant - represent client as user-like object
    return { id: client.id };
  },

  validateScope: async (user, client, scope) => {
    // Accept any scope (dev)
    return scope;
  },

  verifyScope: async (token, scope) => {
    // Accept any scope (dev)
    return true;
  }
};
