'use strict';

// The name of the module for the main app must match the ng-app attribute of the <html> tag in the 
// startup page. The contents of the array are dependencies for the app:
//   ngRoute:                  Provides routing support
//   ngAnimate:                Provides animation support
//   ngSanitize:               Sanitizes text that contains markup before binding it to a view, needed
//                             for artist bios and album reviews which need to have line breaks and
//                             possibly hyperlinks to other views
//   jmdobry.angular-cache:    Custom caching implementation for use with the $http service
//   musicBrowserControllers:  Module which will hold all controllers for the app
var musicBrowserApp = angular.module('MusicBrowserApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'jmdobry.angular-cache',
  'musicBrowserControllers'
]);

var musicBrowserControllers = angular.module('musicBrowserControllers', []);

// /                            Home page, currently redirected to the search page
// /search                      Page that shows the search UI
// /search/artist/<query>       Shows the results of an artist search for <query>
// /search/album/<query>        Shows the results of an album search for <query>
// /search/song/<query>         Shows the results of a song search for <query>
// /artist/<id>                 Shows the details for the artist represented by <id>
// /album/<id>                  Shows the details for the album represented by <id>
// /options                     Page for changing app options
musicBrowserApp.config(['$routeProvider', '$provide', function ($routeProvider, $provide) {
    $routeProvider.when('/', { templateUrl: 'views/search.html', controller: 'SearchCtrl', title: "Search" });
    $routeProvider.when('/search', { templateUrl: 'views/search.html', controller: 'SearchCtrl', title: "Search" });
    $routeProvider.when('/search/artist/:searchTerm', { templateUrl: 'views/artistSearch.html', controller: 'ArtistSearchCtrl', title: "Artist Search" });
    $routeProvider.when('/search/album/:searchTerm', { templateUrl: 'views/albumSearch.html', controller: 'AlbumSearchCtrl', title: "Album Search" });
    $routeProvider.when('/search/song/:searchTerm', { templateUrl: 'views/songSearch.html', controller: 'SongSearchCtrl', title: "Song Search" });
    $routeProvider.when('/artist/:id', { templateUrl: 'views/artist.html', controller: 'ArtistLookupCtrl', title: "Artist" });
    $routeProvider.when('/artist/:id/full-bio', { templateUrl: 'views/artistBio.html', controller: 'ArtistLookupCtrl', title: "Artist Bio" });
    $routeProvider.when('/album/:id', { templateUrl: 'views/album.html', controller: 'AlbumLookupCtrl', title: "Album" });
    $routeProvider.when('/album/:id/full-review', { templateUrl: 'views/albumReview.html', controller: 'AlbumLookupCtrl', title: "Album Review" });
    $routeProvider.when('/style/:id', { templateUrl: 'views/style.html', controller: 'StyleLookupCtrl', title: "Style" });
    $routeProvider.when('/genre/:id', { templateUrl: 'views/genre.html', controller: 'GenreLookupCtrl', title: "Genre" });
    $routeProvider.when('/options', { templateUrl: 'views/options.html', controller: 'OptionsCtrl', title: "Options" });
    $routeProvider.otherwise({ redirectTo: '/' });
}]);

// Any startup code needed by the app should go here
musicBrowserApp.run(['$rootScope', '$http', '$angularCacheFactory', function ($rootScope, $http, $angularCacheFactory) {
    $http.defaults.headers.common["Accept-Encoding"] = "gzip,deflate";
    
    $rootScope.$on("$routeChangeSuccess", function (event, currentRoute, previousRoute) {
        // Change page title based on the current route
        $rootScope.title = currentRoute.title;
    });

    // Create a custom cache for our data, and set the $http service to use it for its caching
    $angularCacheFactory('dataCache', {
        // Items added to this cache expire after 60 minutes
        maxAge: 3600000,
        // This cache will clear itself every two hours
        cacheFlushInterval: 12000000,
        // Items will be deleted from this cache right when they expire
        deleteOnExpire: 'aggressive'
    });

    $http.defaults.cache = $angularCacheFactory.get('dataCache');
}]);
