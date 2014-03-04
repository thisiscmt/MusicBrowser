﻿musicBrowserControllers.controller('AlbumSearchCtrl', ['$scope', '$routeParams', 'mbData', function ($scope, $routeParams, mbData) {
    $scope.albums = [];
    $scope.searchTerm = $routeParams.searchTerm;

    mbData.searchForAlbum($routeParams.searchTerm).then(function (val) {
        if (val.data.searchResult) {
            $scope.albums = val.data.searchResult;
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
