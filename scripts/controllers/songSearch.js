musicBrowserControllers.controller('SongSearchCtrl', ['$scope', '$routeParams', 'mbData', 'mbCommon', function ($scope, $routeParams, mbData, mbCommon) {
    $scope.songs = [];
    $scope.searchTerm = $routeParams.searchTerm;
    $scope.pageSize = mbCommon.getConfiguration().pageSize;
    $scope.curPage = 1;
    $scope.offset = 0;

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

        $scope.ready = true;
    });
}]);
