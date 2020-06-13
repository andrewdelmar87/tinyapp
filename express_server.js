const express = require("express");
const app = express();
const PORT = 8080; 
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(bodyParser());
app.use(cookieSession({
  name: 'session',
  keys: [
    'vcywevcyuvcwvcv',
    'jhqvcyqwcvuyqwvcuywecvwqkyecv'
  ],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const { 
  generateRandomString,
  urlsForUser 
} = require('./helpers');

const urlDatabase = {
  b2xVn2: {longURL: "http://www.lighthouselabs.ca/", userID: "userRandomID"}
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: bcrypt.hashSync("1", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("1", 10)
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
  req.session.userid = id

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
        
        req.session.userid = users[userId].id
        res.redirect('/urls')
        return;
      }    
      const foundUser = users[userId];
  }
  }
  res.status('403')
  res.send('Error: Sign in details incorrect')
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = {
    longURL:req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect('/urls/' + req.params.shortURL);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.userid };
  res.redirect(`/urls/${shortURL}`);
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

  const userUrls = urlsForUser(req.session.userid, urlDatabase);

  if (req.session.userid) {
    let templateVars = {
      urls: userUrls,
      user: users[req.session.userid],
      username: users[req.session.userid]
    };
    
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
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
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const username = users[req.session.userid]
  // console.log("req.params.shortURL", req.params.shortURL)
  // console.log("req.session.userid", req.session.userid);
  console.log("urlDatabase[shortURL].userID", urlDatabase[shortURL].userID)
  if (req.session.userid === urlDatabase[shortURL].userID) {
    let templateVars = {
      shortURL,
      longURL,
      username
    };
    res.render("urls_show", templateVars);
  } else {
    return res.status(401).send("Unauthorized"); 
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

