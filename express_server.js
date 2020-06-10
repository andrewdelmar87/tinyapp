const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca/",
  "9sm5xK": "http://www.google.com/"
};

app.post("/urls/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect('/urls')
})

app.post("/urls/login", (req, res) => {
  res.cookie("username", req.body.username)
  console.log('Username is: ', req.body.username)

  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.redirect('/urls');
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

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/:${shortURL}`); 
});

//create new URL
app.get("/urls/new", (req, res) => {
  let templateVars = {
  username: req.cookies["username"],
    urls: urlDatabase
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  
  let templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});

//My URL's
app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello! This is the home page.");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() { //creates random 6 random alphanumeric characters
 return Math.random().toString(36).slice(2,8);
};