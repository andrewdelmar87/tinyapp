function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
};

function urlsForUser(id, data) {
  
  let output = {};
  for (let url in data) {
    // console.log("urlDatabase[url].userID", urlDatabase[url].userID)
    if (data[url].userID === id) {
      output[url] = data[url];
    }
  }
  return output;
};

module.exports = { 
generateRandomString,
urlsForUser
};