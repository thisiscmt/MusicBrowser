musicBrowserControllers.controller('ArtistSearchCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    mbCommon.setPageTitle("Artist Search - " + $routeParams.searchTerm);

    $scope.artists = [];
    $scope.searchTerm = $routeParams.searchTerm;
    $scope.pageSize = mbCommon.getConfiguration().pageSize; // Current page size

    // Current page being viewed, always greater than 0. Used to calculate offset values and determine
    // whether the Previous link should be shown
    $scope.curPage = 1;

    // Offset into the next page. Used on the Next and Previous links at the bottom of the view
    $scope.offset = 0;

    // If the data being retrieved isn't cached, show the loading dialog. If there was a cache hit
    // we don't want to show it, because for some reason an exception will be raised when we try to
    // close it. It might be some kind of timing issue since the close call occurs immediately after 
    // the open call
    if (!mbData.isCached($location.url())) {
        mbCommon.showLoadingDialog("Searching for artist ...");
    }

    $scope.setCurrentArtist = function (name) {
        mbCommon.currentArtist = name;
    }

    $scope.setCurrentGenre = function (name) {
        mbCommon.currentGenre = name;
    }

    mbData.searchForArtist($routeParams.searchTerm, $routeParams.size, $routeParams.offset).then(function (val) {
        var offsetVal;
        var sizeVal;

        if (val.data.searchResult) {
            $scope.artists = val.data.searchResult;
            offsetVal = parseInt($routeParams.offset);
            sizeVal = parseInt($routeParams.size);

            if (offsetVal === 0) {
                $scope.curPage = 1;
            }
            else {
                $scope.curPage = (offsetVal / sizeVal) + 1;
            }

            $scope.offset = $scope.curPage * sizeVal;
        }
        else {
            $scope.noResults = true;
        }

        mbCommon.closeLoadingDialog();
        $scope.ready = true;
    }, function (val) {
        if (val) {
            // The argument passed to the error handler will be JSON, so we need to parse it in 
            // order to get the exact string value we want
            $scope.msg = JSON.parse(val.data);
            $scope.hasMessage = true;
        }

        mbCommon.closeLoadingDialog();
        $scope.ready = true;
    });
}]);
