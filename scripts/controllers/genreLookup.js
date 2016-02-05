musicBrowserControllers.controller('GenreLookupCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    mbCommon.setPageTitle("Genre - " + mbCommon.currentGenre);

    $scope.genres = [];
    $scope.goBack = mbCommon.goBack;

    if (!mbData.isCached($location.url())) {
        mbCommon.showLoadingDialog("Retrieving genre ...");
    }

    mbData.lookupGenre($routeParams.id).then(function (result) {
        if (result.data) {
            $scope.genres = result.data;
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
