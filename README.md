README
======

Note: You need to run Chrome in unsafe mode:
google-chrome --disable-web-security

On Ubuntu you may need to use chromium.

Installation
============

###1. Install [node.js](http://nodejs.org/)

###2. Install dependencies

In project root:

    $ npm install

Usage
=====

Start the application with:

    $ node app.js

For local development using two tabs you can connect one tab to the localhost-address and one to the local IP-address.

Deployment
==========

To deploy to heroku:

    $ git push heroku master

To enable websockets:

    $ heroku labs:enable websockets

LICENSE
=======

[MIT License](http://opensource.org/licenses/MIT)
