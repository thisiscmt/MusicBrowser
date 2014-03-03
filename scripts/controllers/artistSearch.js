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
    });
}]);
