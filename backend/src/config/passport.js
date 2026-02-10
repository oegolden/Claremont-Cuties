const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || 'https://claremont-cuties-34c7fbefb585.herokuapp.com/auth/google/callback';
console.log('Google Callback URL:', googleCallbackURL);
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const { pool } = require('./db');

const allowedDomains = {
  google: ['g.hmc.edu', 'pitzer.edu', 'scrippscollege.edu', 'cmc.edu'],
  microsoft: ['mymail.pomona.edu']
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: googleCallbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        const domain = email.split('@')[1];

        if (!allowedDomains.google.includes(domain)) {
          return done(null, false, { message: 'Email domain not authorized' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
          // user exists
          return done(null, result.rows[0]);
        } else {
          // create new user
          const newUser = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [profile.displayName, email]
          );
          return done(null, newUser.rows[0]);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Microsoft OAuth Strategy
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'https://claremont-cuties-34c7fbefb585.herokuapp.com/auth/microsoft/callback',
      scope: ['user.read'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        const domain = email.split('@')[1];

        if (!allowedDomains.microsoft.includes(domain)) {
          return done(null, false, { message: 'Email domain not authorized' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length > 0) {
          return done(null, result.rows[0]);
        } else {
          // create new user
          const newUser = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [profile.displayName, email]
          );
          return done(null, newUser.rows[0]);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;