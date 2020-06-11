const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const { v4: uuid } = require('uuid');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca/",
  "9sm5xK": "http://www.google.com/"
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

  //check if email already exists
  let foundUser;
  
  if (!email || !password) {
    res.status(400)
    res.send("400 Error")
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
    password
  }
  users[id] = newUser;
  console.log(id, 'ID')
  res.cookie('user_id', id)
  //redirect
  return res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls')
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  let foundUser;
  console.log(users, 'users')
  for (const userId in users) {
    console.log(userId, 'userId')
    if (users[userId].email === email) {
      console.log('users[userId].email === email')
      foundUser = users[userId];
    }
  }
  console.log(foundUser, 'foundUser')
  res.cookie("user_id", foundUser.id)
  console.log(foundUser.id, 'foundUser.id')

  let templateVars = {
    username: req.cookies["user_id"],
    urls: urlDatabase
  };
  return res.redirect('/urls');
});

//POST route that updates longURL
app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls/' + req.params.shortURL);
})

//POST route that removes URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/:${shortURL}`); 
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  }
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("login", templateVars);
})

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("register", templateVars);
})

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      urls: urlDatabase,
      user: users[req.cookies["user_id"]],
      username: users[req.cookies["user_id"]]
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

//redirects to long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

//shows URL pair
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  
  let templateVars = { 
    shortURL, 
    longURL,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() { //creates random 6 random alphanumeric characters
 return Math.random().toString(36).slice(2,8);
};