musicBrowserControllers.controller('StyleLookupCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    mbCommon.setPageTitle("Style - " + mbCommon.currentStyle);

    $scope.styles = [];
    $scope.goBack = mbCommon.goBack;

    if (!mbData.isCached($location.url())) {
        mbCommon.showLoadingDialog("Retrieving style ...");
    }

    mbData.lookupStyle($routeParams.id).then(function (val) {
        if (val.data.lookupResult) {
            $scope.styles = val.data.lookupResult;
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
