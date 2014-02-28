Music Browser
============
This web application is designed to browse through music metadata maintained in a third-party database. Its current incarnation uses data from [Rovi](http://www.rovicorp.com), who maintains the [All Music Guide](http://www.allmusic.com). At one point Rovi released a native iOS app for the All Music Guide that was easy to use and had a nice UI. The problem is the searching was wonky and it had a tendency to crash. Eventually they updated the main web site to be more mobile-friendly, and have essentially abandoned the native app. The UI of the mobile site isn't as good, IMHO, so I decided to create a mobile-optimized web app that was like the native one but with more straightforward searching. It was also a way to learn some new web tools.

The app has the following features:

* Search for an artist, song, or album.
* View artist biographies as well as their discography and other detailed information.
* View album reviews.

It uses the following open source libraries:

* [AngularJS](http://angularjs.org)
* [Bootstrap](http://getbootstrap.com)
* [Angular-Cache](http://github.com/jmdobry/angular-cache)
* [DateJS](http://www.datejs.com)

It includes a [Web API](http://www.asp.net/web-api)-based service that wraps calls to Rovi's RESTful service. This API could be easily modified to support different metadata sources.

Future work includes being able to look up info on music styles, look up releases that a song appears on, and various other sundry improvements to better utilize Angular and provide a great UI.
