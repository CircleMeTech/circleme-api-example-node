var express = require('express');
var router = express.Router();
var request = require('request');
var oauth2 = require('simple-oauth2')({
  clientID: 'c136e939911f2336a54aa3d32c22dd27cea7f39585fd1332bb1c9632144d96d3',
  clientSecret: 'cd2f661175f4b07bf247f11c65b5eebb40d52660f15aee0c4f767ac1378dd5a3',
  site: 'https://api.circleme.com/oauth',
  authorizationPath: '/authorize',
  tokenPath: '/token'
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
  res.render('index', { title: 'Express' });
});

// Initial page redirecting to Github
router.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
router.get('/callback', function (req, res) {
  var code = req.query.code;
  console.log('/callback');
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:3000/callback'
  }, saveToken);

  function saveToken(error, result) {
    if (error) { console.log('Access Token Error', error.message); }
    token = oauth2.accessToken.create(result);
    console.log(token)
  }

  res.render('index', { title: 'Authorization successful' });
});

router.get('/likes', function (req, res) {
	var autHeader = String('Bearer ' + token.token.access_token);
	// console.log(autHeader);
	// var options = {
 //   	    url: 'http://circleme-api-consumer.herokuapp.com/explore/liked.json',
	//     headers: {
	//         'Authorization': autHeader
	//     }
	// };

    function callback(error, response, body) {
	    if (!error && response.statusCode == 200) {
	        console.log(body);
	    }
	}

	// request(options, callback);

	request.get('http://circleme-api-consumer.herokuapp.com/explore/liked.json', {
	  'auth': {
	    'bearer': autHeader
	  }
	}, callback);
});


module.exports = router;
