musicBrowserControllers.controller('AlbumLookupCtrl', ['$scope', '$routeParams', '$location', 'mbData', function ($scope, $routeParams, $location, mbData) {
    $scope.album = {};
    $scope.fullReviewLink = $location.absUrl() + "/full-review";

    mbData.lookupAlbum($routeParams.id).then(function (val) {
        if (val.data.lookupResult) {
            $scope.album = val.data.lookupResult;

            if ($scope.album.headlineReviewFormatted) {
                $scope.hasHeadlineReview = true;
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
