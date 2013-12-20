CStreamer
========

A project by Tuure Savuoja and Oskar Ehnström for the course T-111.5350 Multimedia Programming at Aalto University.

This is a small node app that displays YouTube videos. The gist of it being that when watching, the videos sync across all clients that are watchin via WebRTC. The idea is to have clients play their own streams and only sync relevant information peer to peer.

You choose video by entering the ID on the fron page or by going to the http://service_url/ID. The page will show the video in fullscreen with controls on top. There is also an option to split the video into four parts in different directions to ease viewing on a table.

Notes
======

You need to run Chrome in unsafe mode:
    
    $ google-chrome --disable-web-security

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
    
In the cstreamer folder.

For local development using two tabs you can connect one tab to the localhost-address and one to the local IP-address.

Deployment
==========

To deploy to heroku:

    $ git push heroku master

To enable websockets:

    $ heroku labs:enable websockets
    
Libraries
=========

[jQuery](http://jquery.com/)

[jQuery UI](http://jqueryui.com/)

[webRTC.io](https://github.com/webRTC/webRTC.io)

[Bootstrap](http://getbootstrap.com/)

LICENSE
=======

[MIT License](http://opensource.org/licenses/MIT)
