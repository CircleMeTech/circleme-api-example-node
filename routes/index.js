'use strict';

var express = require('express');
var router = express.Router();
var http = require('http');
var oauth2 = require('simple-oauth2')({
  clientID: 'c136e939911f2336a54aa3d32c22dd27cea7f39585fd1332bb1c9632144d96d3',
  clientSecret: 'cd2f661175f4b07bf247f11c65b5eebb40d52660f15aee0c4f767ac1378dd5a3',
  site: 'https://api.circleme.com',
  authorizationPath: '/oauth/authorize',
  tokenPath: '/oauth/token'
});

var token;

// Authorization uri definition
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
  scope: '',
  state: ''
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'CircleMe Node Test App - Authorize' });
});
router.get('/home', function(req, res) {
  res.render('index', { title: 'CircleMe Node Test App', links: true });
});

// Initial page redirecting to Github
router.get('/auth', function (req, res) {
  res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
router.get('/callback', function (req, res) {
  var code = req.query.code;
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:3000/callback'
  }, saveToken);

  function saveToken(error, result) {
    if (error) { 
      console.log('Access Token Error', error.message); 
    }
    token = oauth2.accessToken.create(result);
  }
  res.redirect('/home');
});

router.get('/me', function (req, res) {
  var me;

  // Set up the request
  var options = {
      host: 'api.circleme.com',
      path: '/v201410/me.json?access_token='+token.token.access_token,
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
      res.render('me', { title: 'Profile',me: me });
    })
  }).on('error',function(e){
     console.log("Error: " + e.message); 
     console.log( e.stack );
  });
});

router.get('/likes', function (req, res) {
	var likes;

  // Set up the request
  var options = {
      host: 'api.circleme.com',
      path: '/v201410/liked.json?access_token='+token.token.access_token,
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
      res.render('likes', { title: 'Likes',likes: likes });
    })
  }).on('error',function(e){
     console.log("Error: " + e.message); 
     console.log( e.stack );
  });
});

module.exports = router;
