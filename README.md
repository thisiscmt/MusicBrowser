Music Browser
============
This web application is designed to browse through music metadata maintained in a third-party database. My inspiration for it came from the
[All Music Guide](http://www.allmusic.com), maintained by Rovi which merged with [Tivo](https://business.tivo.com) a few years back. Many years
ago Rovi released a native iOS app for the All Music Guide that was easy to use and had a nice UI. The problem was the searching was wonky, and it had
a tendency to crash. Eventually they updated the main web site to be mobile-friendly and the native app is no more. I didn't like the new incarnation 
of the site so I decided to create a mobile-optimized web app that was like the native one but a bit simplified. 

Version 1.0 was built on AngularJS and used an ASP.NET [Web API](https://dotnet.microsoft.com/apps/aspnet/apis) back end that wrapped calls 
to Rovi's RESTful service for getting metadata. Sadly, that service was shut down at the end of 2020.

Version 2.0 uses new Angular for the front end and a Node.js back end that talks to [MusicBrainz](https:///musicbrainz.org) to retrieve music 
metadata. It is currently a work in progress.

The new version will have the following features:

* Search for an artist, album, or song
* View artist details as well as their discography, plus related artists
* View album details and the track listing
* View other releases like EPs and collections

I'm making the back end such that MusicBrainz could be swapped out for some other service. They seem to have the data that I want, but I might end
up changing gears at some point.
