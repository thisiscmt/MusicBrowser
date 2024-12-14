Music Browser
============
This web application is designed to browse through music metadata from a third-party database. My inspiration for it came from the [All Music Guide](https://www.allmusic.com), which is an amazing resource if you are a music fan of any kind. The site has had a [colorful history](https://en.wikipedia.org/wiki/AllMusic). For a long time it was maintained by RoviCorp, and they had a native iOS app for accessing all the music info available on the site. It was fast, easy to use, and had a nice UI. The problem was the searching was wonky and had a tendency to crash the app. Eventually they updated the main web site to be mobile-friendly and the native app was taken away. I didn't like the new mobile incarnation of the site, so I decided to create a mobile-optimized web app that was like the native app (i.e. uncluttered and fast).

Version 1.0 was built on AngularJS and used an ASP.NET [Web API](https://dotnet.microsoft.com/apps/aspnet/apis) back end that wrapped calls to Rovi's RESTful service for getting metadata. Sadly, that service was shut down at the end of 2020, after Rovi merged with [Tivo](https://www.tivo.com) and then with a company called [Xperi](https://xperi.com/), and the APIs eventually got consolidated and modernized. I would love to keep using their services, but they cost far more than I can spend.

Version 2.0 will have a new React-based front end and a Python back end that talks to [MusicBrainz](https:///musicbrainz.org) to retrieve music metadata. It is currently a work in progress.

The new version will have the following features:

* Search for an artist, album, or song
* View artist details as well as their discography, members, and related artists
* View album details and the track listing
* Include artist images and album cover art
* View other artist releases like EPs and collections

I'm making the back end such that MusicBrainz is just one provider that could easily be swapped out for a different one. They seem to have the data that I want, though I might end up changing gears at some point.
