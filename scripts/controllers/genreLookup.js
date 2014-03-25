musicBrowserControllers.controller('GenreLookupCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    $scope.genres = [];
    $scope.goBack = mbCommon.goBack;

    if (!mbData.isCached($location.url())) {
        mbCommon.showLoadingDialog("Retrieving genre ...");
    }

    mbData.lookupGenre($routeParams.id).then(function (val) {
        if (val.data.lookupResult) {
            $scope.genres = val.data.lookupResult;
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
