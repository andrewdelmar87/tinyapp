const express = require("express");
const app = express();
const PORT = 8080; 
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// app.use(cookieParser());
app.use(bodyParser());
app.use(cookieSession({
  name: 'session',
  keys: [
    'vcywevcyuvcwvcv',
    'jhqvcyqwcvuyqwvcuywecvwqkyecv'
  ],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

function urlsForUser(id) {
  
  let output = {};
  for (let url in urlDatabase) {
    console.log("urlDatabase[url]", urlDatabase[url])
    if (urlDatabase[url].userID === id) {
      output[url] = urlDatabase[url]
    }
  }
  return output;
}

function generateRandomString() {
 return Math.random().toString(36).slice(2,8);
}

//
// req.session.userid -> req.session.userid // this must be checking/reading the cookie
// req.session.userid = "userid" is setting cookies and needs to be replaced with req.session.userid = "userid";
// and clearing a cookie is req.session.userid = null; and needs to be replaced with req.session.userid = null;

const urlDatabase = {
  b2xVn2: {longURL: "http://www.lighthouselabs.ca/", userID: "aJ48lw"},
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //check if email already exists
  let foundUser;

  if (!email || !hashedPassword) {
    return res.status(400).send("400 Error")
  }

  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }

  if (foundUser) {
    return res.status(400).send('That email is already in use');
  }

  //create uuid and new user obj
  let id = uuid().split('-')[0];
  const newUser = {
    id,
    email,
    hashedPassword
  }
  users[id] = newUser;
  console.log(newUser)
  // console.log(id, 'ID')
  // console.log(id)
  req.session.userid = "userid"

  return res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  req.session.userid = null;
  res.redirect('/urls')
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  
  const password = req.body.password;
  
  
  for (const userId in users) {
    // console.log( 'userId', userId, users[userId])
    if (users[userId].email === email) {
      //&& users[userId].password === password)
      const result = bcrypt.compareSync(password, users[userId].hashedPassword);
      
      //starting point foundUser.id
      if (result) {
        res.cookie("user_id", userId)
        res.redirect('/urls')
        return;
      }    
      const foundUser = users[userId];
  }
  }
  res.status('403')
  res.send('Error: Sign in details incorrect')
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls/' + req.params.shortURL);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.userid };
  // console.log("urlDatabase[shortURL]", urlDatabase)
  res.redirect(`/urls/:${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (req.session.userid) {
    let templateVars = {
      urls: urlDatabase,
      user: users[req.session.userid],
      username: users[req.session.userid]
    };
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    username: req.session.userid,
    urls: urlDatabase
  };
  res.render("login", templateVars);
})

app.get("/register", (req, res) => {

  let templateVars = {
    username: req.session.userid,
    urls: urlDatabase
  };
  res.render("register", templateVars);
})

app.get("/urls", (req, res) => {

  if (req.session.userid) {
    let templateVars = {
      urls: urlsForUser(req.session.userid),
      user: users[req.session.userid],
      username: users[req.session.userid]
    };

    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/", (req, res) => {
  res.send("Hello! This is the home page.");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"]
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];

  let templateVars = {
    shortURL,
    longURL,
    username: req.session.userid
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

