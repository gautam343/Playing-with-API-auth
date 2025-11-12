// auth/oauthRoutes.js
const express = require('express');
const OAuth2Server = require('oauth2-server');
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const oauthModel = require('./oauthModel');

const oauth = new OAuth2Server({
  model: oauthModel,
  accessTokenLifetime: 60 * 60, // 1 hour
  allowBearerTokensInQueryString: true
});

const router = express.Router();

// Token endpoint - supports password and client_credentials grants
router.post('/token', async (req, res) => {
  const request = new Request(req);
  const response = new Response(res);

  try {
    const token = await oauth.token(request, response);
    // oauth.token writes to the response wrapper; mirror that to express
    res.set(response.headers);
    return res.status(response.status).json(response.body);
  } catch (err) {
    return res.status(err.code || 500).json({ error: err.message, name: err.name });
  }
});

// Middleware to protect resource routes using oauth.authenticate()
const authenticate = async (req, res, next) => {
  const request = new Request(req);
  const response = new Response(res);
  try {
    const token = await oauth.authenticate(request, response);
    // attach token and user info to req.oauth
    req.oauth = token;
    return next();
  } catch (err) {
    return res.status(err.code || 401).json({ error: err.message });
  }
};

module.exports = { router, authenticate, oauth };
