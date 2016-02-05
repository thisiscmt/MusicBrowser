musicBrowserControllers.controller('StyleLookupCtrl', ['$scope', '$routeParams', '$location', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, mbData, mbCommon) {
    mbCommon.setPageTitle("Style - " + mbCommon.currentStyle);

    $scope.styles = [];
    $scope.goBack = mbCommon.goBack;

    if (!mbData.isCached($location.url())) {
        mbCommon.showLoadingDialog("Retrieving style ...");
    }

    mbData.lookupStyle($routeParams.id).then(function (result) {
        if (result.data) {
            $scope.styles = result.data;
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
