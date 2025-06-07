import express from 'express';
import { getOAuth2Client } from '../services/GoogleCalendar';
import UserGoogleToken from '../models/UserGoogleToken';

const router = express.Router();

router.get('/auth', (req, res) => {
  const oauth2Client = getOAuth2Client();
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const oauth2Client = getOAuth2Client();
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code as string);

  // TODO: Replace with actual userId from session or JWT
  const userId = 'some-user-id';
  await UserGoogleToken.upsert({
    userId,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    scope: tokens.scope,
    tokenType: tokens.token_type,
    expiryDate: tokens.expiry_date,
  });

  res.json(tokens);
});

export default router; 