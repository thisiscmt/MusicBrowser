musicBrowserControllers.controller('ArtistSearchCtrl', ['$scope', '$routeParams', 'mbData', function ($scope, $routeParams, mbData) {
    $scope.artists = [];
    $scope.searchTerm = $routeParams.searchTerm;

    mbData.searchForArtist($routeParams.searchTerm).then(function(val) {
        if (val.data.searchResult) {
            $scope.artists = val.data.searchResult;
        }
        else {
            $scope.noResults = true;
        }

        $scope.ready = true;
    }, function (val) {
        if (val) {
            // The argument passed to the error handler will be JSON, so we need to parse it in 
            // order to get the exact strikng value we want (versus one wrapped in double quotes)
            $scope.msg = JSON.parse(val.data);
            $scope.hasMessage = true;
        }

        $scope.ready = true;
    });
}]);
