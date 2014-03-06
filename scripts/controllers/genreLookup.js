musicBrowserControllers.controller('GenreLookupCtrl', ['$scope', '$routeParams', '$window', 'mbData', 'mbCommon', function ($scope, $routeParams, $window, mbData, mbCommon) {
    $scope.genres = [];
    $scope.goBack = mbCommon.goBack;

    mbData.lookupGenre($routeParams.id).then(function (val) {
        if (val.data.lookupResult) {
            $scope.genres = val.data.lookupResult;
        }
        else {
            $scope.noResults = true;
        }

        $scope.ready = true;
    }, function (val) {
        if (val) {
            $scope.msg = JSON.parse(val.data);
            $scope.hasMessage = true;
        }

        $scope.ready = true;
    });
}]);
