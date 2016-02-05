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

    mbData.searchForSong($routeParams.searchTerm, $routeParams.size, $routeParams.offset).then(function (result) {
        if (result.data) {
            $scope.songs = result.data;
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
        else if (result.error) {
            $scope.msg = result.error;
            $scope.hasMessage = true;
        }
        else {
            $scope.noResults = true;
        }

        mbCommon.closeLoadingDialog();
        $scope.ready = true;
    });
}]);
