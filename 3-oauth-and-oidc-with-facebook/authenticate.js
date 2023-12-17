const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/user')

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const config = require('./config')

const FacebookTokenStrategy = require('passport-facebook-token')

exports.getToken = user => {
    return jwt.sign(user, config.SECRET_KEY, { expiresIn: "1h" })
}

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.SECRET_KEY
}

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('jwt payload', jwt_payload)
            User.findOne({ _id: jwt_payload._id }).then(user => {
                if(!user) return done(null, false)
                return done(null, user)
            }).catch(err => done(err, null))
        }
    )
)

exports.verifyUser = passport.authenticate('jwt', { session: false })

exports.verifyAdmin = (req, res, next) => {
    if(req.user.isAdmin) return next()

    const err = new Error('You are not authorized to perform this operation')
    err.status = 403
    res.setHeader('Content-Type', 'text/plain')
    return next(err)
}

exports.local = passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


const parseAuthHeader = authHeader => {
    const usernamePasswordPartEncoded = authHeader.split(" ")[1]
    const usernamePasswordPart = Buffer.from(usernamePasswordPartEncoded, "base64").toString()
    const [username, password] = usernamePasswordPart.split(":")
    return {
        username,
        password
    }
}

const createUnauthencatedResponse = (res, next) => {
    const err = new Error('You are not authenticated!')
    err.status = 401
    res.setHeader('WWW-Authenticate', 'Basic')
    return next(err)
}

exports.authorizeUsers = (req, res, next) => {
    if(req.user && req.user.username === 'john') {
        return next()
    }

    const err = new Error("You need to login first!")
    err.status = 401
    return next(err)
}

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);