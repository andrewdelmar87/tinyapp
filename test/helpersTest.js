const { assert } = require('chai');

const { urlsForUser } = require('../helpers.js');

const testUsers = {
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
};

const urlDatabase = {
  b2xVn2: {longURL: "http://www.lighthouselabs.ca/", userID: "userRandomID"}
};

describe('urlsForUser', function() {
  it('Return urlDatabase to correct ID', function() {
    const actual = urlsForUser("userRandomID", urlDatabase);
    const expected = {
      b2xVn2: {longURL: "http://www.lighthouselabs.ca/", userID: "userRandomID"}
    };
    
    assert.deepEqual(actual, expected);
  });
  it('Return empty object when wrong ID used', function() {
    const actual = urlsForUser("uude672v", urlDatabase);
    const expected = {}
    
    assert.deepEqual(actual, expected);
  });
});