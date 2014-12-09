This is a simple Node.js app that can be deployed to heroku or any other rack-compatible service.

Get the required Node modules doing

    npm install

Add your Client ID and Client Secret in routes/index.js, then fire up the server with:

    node app

Be sure to register an app that uses the correct port and address as the ones you actually have in this app, or the oauth process won't work.