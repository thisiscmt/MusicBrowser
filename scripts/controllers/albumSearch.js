musicBrowserControllers.controller('AlbumSearchCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    $scope.albums = [];
    $scope.searchTerm = $routeParams.searchTerm;
    $scope.pageSize = mbCommon.getConfiguration().pageSize;
    $scope.curPage = 1;
    $scope.offset = 0;

    if (!mbData.isCached($location.url())) {
        mbCommon.showLoadingDialog("Searching for album ...");
    }

    mbData.searchForAlbum($routeParams.searchTerm, $routeParams.size, $routeParams.offset).then(function (val) {
        if (val.data.searchResult) {
            $scope.albums = val.data.searchResult;
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
            $scope.msg = JSON.parse(val.data);
            $scope.hasMessage = true;
        }

        mbCommon.closeLoadingDialog();
        $scope.ready = true;
    });
}]);
