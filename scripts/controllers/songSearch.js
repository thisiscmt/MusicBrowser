musicBrowserControllers.controller('SongSearchCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    mbCommon.setPageTitle("Song Search - " + $routeParams.searchTerm);

    $scope.songs = [];
    $scope.searchTerm = $routeParams.searchTerm;
    $scope.pageSize = mbCommon.getConfiguration().pageSize;
    $scope.curPage = 1;
    $scope.offset = 0;

    if (!mbData.isCached($location.url())) {
        mbCommon.showLoadingDialog("Searching for song ...");
    }

    mbData.searchForSong($routeParams.searchTerm, $routeParams.size, $routeParams.offset).then(function (val) {
        if (val.data.searchResult) {
            $scope.songs = val.data.searchResult;
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
            // order to get the exact string value we want (versus one wrapped in double quotes)
            $scope.msg = JSON.parse(val.data);
            $scope.hasMessage = true;
        }

        mbCommon.closeLoadingDialog();
        $scope.ready = true;
    });
}]);
