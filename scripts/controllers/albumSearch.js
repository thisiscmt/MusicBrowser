musicBrowserControllers.controller('AlbumSearchCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    mbCommon.setPageTitle("Album Search - " + $routeParams.searchTerm);

    $scope.albums = [];
    $scope.searchTerm = $routeParams.searchTerm;
    $scope.pageSize = mbCommon.getConfiguration().pageSize;
    $scope.curPage = 1;
    $scope.offset = 0;

    if (!mbData.isCached($location.url())) {
        mbCommon.showLoadingDialog("Searching for album ...");
    }

    $scope.setCurrentAlbum = function (name) {
        mbCommon.currentAlbum = name;
    }

    $scope.setCurrentArtist = function (name) {
        mbCommon.currentArtist = name;
    }

    mbData.searchForAlbum($routeParams.searchTerm, $routeParams.size, $routeParams.offset).then(function (result) {
        if (result.data) {
            $scope.albums = result.data;
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
