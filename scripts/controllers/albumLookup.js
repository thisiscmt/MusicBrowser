musicBrowserControllers.controller('AlbumLookupCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    mbCommon.setPageTitle("Album - " + mbCommon.currentAlbum);

    $scope.album = {};
    $scope.goBack = mbCommon.goBack;
    $scope.fullReviewLink = $location.absUrl() + "/full-review";
    $scope.hasReleaseDate = false;
    $scope.hasDuration = false;
    $scope.maxShortDescriptionLength = mbData.maxShortDescriptionLength;

    var url = $location.url();

    if (!mbData.isCached(url) && url.indexOf("full-review") === -1) {
        mbCommon.showLoadingDialog("Retrieving album ...");
    }

    $scope.setCurrentArtist = function (name) {
        mbCommon.currentArtist = name;
    }

    $scope.setCurrentStyle = function (name) {
        mbCommon.currentStyle = name;
    }

    mbData.lookupAlbum($routeParams.id).then(function (val) {
        if (val.data.lookupResult) {
            $scope.album = val.data.lookupResult;

            if ($scope.album.originalReleaseDate) {
                $scope.hasReleaseDate = true;
            }

            if ($scope.album.durationFormatted) {
                $scope.hasDuration = true;
            }

            if ($scope.album.headlineReviewFormatted) {
                $scope.hasHeadlineReview = true;
            }
        }
        else {
            $scope.noResults = true;
        }

        mbCommon.closeLoadingDialog();
        $scope.ready = true;
    }, function (val) {
        if (val) {
            $scope.msg = JSON.parse(val.data);
            $scope.hasMessage = true;
        }

        mbCommon.closeLoadingDialog();
        $scope.ready = true;
    });
}]);

