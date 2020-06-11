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

  //check if email already exists
  let foundUser;

  if (!email || !password) {
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
    password
  }
  users[id] = newUser;
  // console.log(id, 'ID')
  // console.log(id)
  res.cookie("user_id", id)

  return res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls')
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  
  const password = req.body.password;
  
  
  for (const userId in users) {
    console.log( 'userId', userId, users[userId])
    if (users[userId].email === email && users[userId].password === password) {
      const foundUser = users[userId];
      console.log("user_id", userId )
      res.cookie("user_id", foundUser.id)
    }
    // return false
  }

  console.log("req.cookies[user_id]", req.cookies["user_id"])
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
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  // console.log("urlDatabase[shortURL]", urlDatabase)
  res.redirect(`/urls/:${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      urls: urlDatabase,
      user: users[req.cookies["user_id"]],
      username: users[req.cookies["user_id"]]
    };
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    username: req.cookies["user_id"],
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
  const longURL = urlDatabase[shortURL]["longURL"]
  res.redirect(longURL);
});

//shows URL pair
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];

  let templateVars = {
    shortURL,
    longURL,
    username: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() { //creates random 6 random alphanumeric characters
 return Math.random().toString(36).slice(2,8);
};