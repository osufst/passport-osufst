/**
 * Module dependencies.
 */
const InternalOAuthError = require('passport-oauth').InternalOAuthError;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const parse = require('./profile').parse;
const uri = require('url');
const util = require('util');

/**
 * `Strategy` constructor.
 *
 * The OSUFST authentication strategy authenticates requests by delegating to
 * OSUFST using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `returnURL`  URL to which OSUFST will redirect the user after authentication
 *   - `realm`      the part of URL-space for which an OpenID authentication request is valid
 *   - `profile`    enable profile exchange, defaults to _true_
 *
 * Examples:
 *
 *     passport.use(new OsufstStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/example-oauth2orize/callback'
 *       },
 *       function (accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || options.authorizationUrl || 'https://auth.osufst.org/dialog/authorize';
    options.tokenURL = options.tokenURL || options.tokenUrl || 'https://auth.osufst.org/oauth/token';

    OAuth2Strategy.call(this, options, verify);

    // must be called after prototype is modified
    this.name = 'osufst';
    this._clientSecret = options.clientSecret;
    this._profileURL = options.profileURL || options.profileUrl || 'https://auth.osufst.org/api/userinfo';
    this._profileFields = options.profileFields || null;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from example-oauth2orize.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `example-oauth2orize`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
    let me = this;
    const url = uri.parse(this._profileURL);

    me._oauth2.get(url, accessToken, function (err, body, res) {
        let json;

        if (err) {
            return done(new InternalOAuthError('Failed to fetch user profile', err));
        }

        try {
            json = JSON.parse(body);
        } catch (ex) {
            return done(new Error('Failed to parse user profile'));
        }

        let profile = parse(json);
        profile.provider = me.name;
        profile._raw = body;
        profile._json = json;

        return done(null, profile);
    });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
