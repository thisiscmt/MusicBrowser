musicBrowserControllers.controller('StyleLookupCtrl', ['$scope', '$routeParams', '$window', 'mbData', 'mbCommon', function ($scope, $routeParams, $window, mbData, mbCommon) {
    $scope.styles = [];
    $scope.goBack = mbCommon.goBack;

    mbData.lookupStyle($routeParams.id).then(function (val) {
        if (val.data.lookupResult) {
            $scope.styles = val.data.lookupResult;
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
