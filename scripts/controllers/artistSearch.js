musicBrowserControllers.controller('ArtistSearchCtrl', ['$scope', '$routeParams', 'mbData', 'mbCommon', function ($scope, $routeParams, mbData, mbCommon) {
    $scope.artists = [];
    $scope.searchTerm = $routeParams.searchTerm;
    $scope.pageSize = mbCommon.getConfiguration().pageSize; // Current page size

    // Current page being viewed, always greater than 0. Used to calculate offset values and determine
    // whether the Previous link should be shown
    $scope.curPage = 1;

    // Offset into the next page. Used on the Next and Previous links at the bottom of the view
    $scope.offset = 0;

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

        $scope.ready = true;
    }, function (val) {
        if (val) {
            // The argument passed to the error handler will be JSON, so we need to parse it in 
            // order to get the exact string value we want (versus one wrapped in double quotes)
            $scope.msg = JSON.parse(val.data);
            $scope.hasMessage = true;
        }

        $scope.ready = true;
    });
}]);
