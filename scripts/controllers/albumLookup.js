musicBrowserControllers.controller('AlbumLookupCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    $scope.album = {};
    $scope.goBack = mbCommon.goBack;
    $scope.fullReviewLink = $location.absUrl() + "/full-review";
    $scope.hasReleaseDate = false;
    $scope.maxShortDescriptionLength = mbData.maxShortDescriptionLength;

    mbData.lookupAlbum($routeParams.id).then(function (val) {
        if (val.data.lookupResult) {
            $scope.album = val.data.lookupResult;

            if ($scope.album.headlineReviewFormatted) {
                $scope.hasHeadlineReview = true;
            }

            if ($scope.album.originalReleaseDate) {
                $scope.hasReleaseDate = true;
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
