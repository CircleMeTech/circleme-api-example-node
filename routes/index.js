var express = require('express');
var router = express.Router();
var http = require('http');

// Put here your app codes
var clientId = 'YOUR_CLIENT_SECRET';
var clientSecret = 'YOUR_CLIENT_SECRET';
var callbackUrl = 'YOUR_CALLBACK_URL';

// Oauth 2.0 module
var oauth2 = require('simple-oauth2')({
  clientID: clientId,
  clientSecret: clientSecret,
  site: 'https://www.circleme.com',
  authorizationPath: '/oauth/authorize',
  tokenPath: '/oauth/token'
});

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: callbackUrl,
  scope: '',
  state: ''
});

// Home path
router.get('/', function(req, res) {
  if (req.session.token) {
    res.render('index', { title: 'CircleMe Node Test App', links: true });
  } else {
    res.render('index', { title: 'CircleMe Node Test App - Authorize' });
  }
});

// Authorization path
router.get('/auth', function (req, res) {
  res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
router.get('/callback', function (req, res) {
  var code = req.query.code;
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: callbackUrl
  }, saveToken);

  function saveToken(error, result) {
    if (error) { 
      console.log('Access Token Error', error.message); 
    }
    req.session.token = oauth2.accessToken.create(result);
    req.session.save();
  }
  // Redirect path after Oauth flow
  res.redirect('/');
});

// Get CircleMe profile infos
router.get('/me', function (req, res) {
  var me;

  var options = {
      host: 'api.circleme.com',
      path: '/v201410/me.json?access_token='+req.session.token.token.access_token,
      method: 'GET'
  };
  
  http.get(options, function(httpRes) {
    console.log("Got response: " + httpRes.statusCode);

    var data = '';

    httpRes.on('data', function (chunk){
        data += chunk;
    });

    httpRes.on('end',function(){
      var me = JSON.parse(data);
      res.render('me', { title: 'Profile', me: me});
    });
  }).on('error',function(e){
     console.log("Error: " + e.message); 
     console.log( e.stack );
  });
});

// Get CircleMe likes
router.get('/likes', function (req, res) {
	var likes;

  var options = {
      host: 'api.circleme.com',
      path: '/v201410/liked.json?access_token='+req.session.token.token.access_token,
      method: 'GET'
  };
  
  http.get(options, function(httpRes) {
    console.log("Got response: " + httpRes.statusCode);

    var data = '';

    httpRes.on('data', function (chunk){
        data += chunk;
    });

    httpRes.on('end',function(){
      var likes = JSON.parse(data);
      res.render('likes', { title: 'Likes', likes: likes});
    });
  })
  .on('error',function(e){
     console.log("Error: " + e.message); 
     console.log( e.stack );
  });
});

// Get CircleMe todos
router.get('/todos', function (req, res) {
  var todos;

  var options = {
      host: 'api.circleme.com',
      path: '/v201410/tobedone.json?access_token='+req.session.token.token.access_token,
      method: 'GET'
  };
  
  http.get(options, function(httpRes) {
    console.log("Got response: " + httpRes.statusCode);
    
    var data = '';

    httpRes.on('data', function (chunk){
        data += chunk;
    });

    httpRes.on('end',function(){
      var todos = JSON.parse(data);
      res.render('todos', { title: 'Todos', todos: todos});
    });
  })
  .on('error',function(e){
     console.log("Error: " + e.message); 
     console.log( e.stack );
  });
});

module.exports = router;
