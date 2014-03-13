musicBrowserControllers.controller('ArtistLookupCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    $scope.artist = {};
    $scope.goBack = mbCommon.goBack;
    $scope.fullBioLink = $location.absUrl() + "/full-bio";
    $scope.curTab = "Album";

    $scope.panes = [
        { title: "Albums", contentType: "Album", active: true },
        { title: "Compilations", contentType: "Compilation", active: false },
        { title: "Singles & EPs", contentType: "SingleOrEP", active: false }
    ];

    // Check if a previously saved discog tab exists, and if the artist matches the one being viewed 
    // set that tab as the active one. This way when a user views the details of a discog item, then 
    // goes back, they will return to the tab they were at. We include the artist's ID so when they
    // view some other artist it will default to the Album tab.
    var val = sessionStorage.getItem("curDiscogTab");
    var buffer;

    if (val) {
        buffer = val.split("|");

        for (var i = 0; i < $scope.panes.length; i++) {
            if ($scope.panes[i].contentType === buffer[0] && $routeParams.id === buffer[1]) {
                $scope.panes[i].active = true;
            }
            else {
                $scope.panes[i].active = false;
            }
        }
    }

    $scope.setCurTab = function (tab) {
        // Save the current discog tab along with the artist being viewed
        sessionStorage.setItem("curDiscogTab", tab + "|" + $routeParams.id);
    }

    mbData.lookupArtist($routeParams.id).then(function (val) {
        if (val.data.lookupResult) {
            $scope.artist = val.data.lookupResult;

            if ($scope.artist.active) {
                $scope.hasYears = true;
            }

            if ($scope.artist.birth.place) {
                $scope.hasBirthplace = true;
            }

            if ($scope.artist.death.date) {
                $scope.ended = true;
            }

            if ($scope.artist.headlineBioFormatted) {
                $scope.hasHeadlineBio = true;
            }

            if ($scope.artist.discography && $scope.artist.discography.length > 0) {
                $scope.hasDiscography = true;
            }
        }
        else {
            $scope.noResults = true;
        }

        $scope.ready = true;
    }, function (val) {
        if (val) {
            $scope.msg = JSON.parse(val.data);
            $scope.hasMessage = true;
        }

        $scope.ready = true;
    });
}]);
