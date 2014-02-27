musicBrowserControllers.controller('SongSearchCtrl', ['$scope', '$routeParams', 'mbData', function ($scope, $routeParams, mbData) {
    $scope.songs = [];

    mbData.searchForSong($routeParams.searchTerm).then(function (val) {
        if (val.data.searchResult) {
            $scope.songs = val.data.searchResult;
        }
        else {
            $scope.noResults = true;
        }

        $scope.ready = true;
    });
}]);
