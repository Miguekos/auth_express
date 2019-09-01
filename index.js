const express = require('express')
var cors = require('cors')
// creating an express instance
// const publicRoot = '/absolute/path/to/dist'
// app.use(express.static(publicRoot))

const app = express()  
const cookieSession = require('cookie-session')  
const bodyParser = require('body-parser')  
const passport = require('passport')

// getting the local authentication type
const LocalStrategy = require('passport-local').Strategy
app.use(bodyParser.json())
app.use(cookieSession({  
    name: 'mysession',
    keys: ['vueauthrandomkey'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(passport.initialize());
app.use(passport.session());
var whitelist = ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://0.0.0.0:8080', 'http://172.105.17.123:3000', 'http://172.105.17.123']
app.use(cors({
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}));

let users = [  
    {
      id: 1,
      name: "Administrador",
      email: "admin@admin.com",
      password: "secret",
      role: 1
    },
    {
      id: 2,
      name: "Miguel",
      email: "asd@asd.com",
      password: "secret",
      role: 2
    }
  ];

  const authMiddleware = (req, res, next) => {  
    if (!req.isAuthenticated()) {
      res.status(200).json({
        message: false
      })
    } else {
      return next()
    }
  }

  passport.use(  
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
  
      (username, password, done) => {
        let user = users.find((user) => {
          return user.email === username && user.password === password
        })
  
        if (user) {
          done(null, user)
        } else {
          done(null, false)
          // done(null, false, { message: 'Incorrecto username or password'})
        }
      }
    )
  )

  passport.serializeUser((user, done) => {  
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {  
    let user = users.find((user) => {
      return user.id === id
    })
  
    done(null, user)
  })

//   app.get("/", (req, res, next) => {  
//     res.sendFile("index.html", { root: publicRoot })
//   })

  app.get("/", (req, res, next) => {
      res.json("Server Auth User");
  })

  app.post("/api/login", (req, res, next) => {  
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(200).json({
          message : "Incorrecto username or password"
        });
        // return 'Incorrecto username or password'
      }
      req.login(user, err => {
        res.json({
          message: true
        });
      });
    })(req, res, next);
  });

  app.get("/api/logout", function(req, res) {  
    req.logout();
    console.log("logged out")
    return res.json();
  });

  app.get("/api/user", authMiddleware, (req, res) => {  
    let user = users.find(user => {
      return user.id === req.session.passport.user
    })
    console.log([user, req.session])
    res.send({ user: user })
  })

  app.listen(3000, () => {  
    console.log("Example app listening on port 3000")
  })


  // axios.defaults.withCredentials = true; // in the frontend