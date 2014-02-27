musicBrowserControllers.controller('ArtistLookupCtrl', ['$scope', '$routeParams', '$location', 'mbData', function ($scope, $routeParams, $location, mbData) {
    $scope.artist = {};
    $scope.fullBioLink = $location.absUrl() + "/full-bio";

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
        }
        else {
            $scope.noResults = true;
        }

        $scope.ready = true;
    });
}]);
