musicBrowserControllers.controller('OptionsCtrl', ['$scope', '$routeParams', 'mbCommon', function ($scope, $routeParams, mbCommon) {
    $scope.albumChrono = false;
    $scope.pageSize = 20;
    $scope.hasMessage = false;
    $scope.msg = "";

    var mbConfig = mbCommon.getConfiguration();
    $scope.albumChrono = mbConfig.albumChrono;
    $scope.pageSize = mbConfig.pageSize;

    $scope.submitForm = function () {
        var mbConfig = {};

        mbConfig.albumChrono = $scope.albumChrono;
        mbConfig.pageSize = $scope.pageSize;
        mbCommon.setConfiguration(mbConfig);

        $scope.msg = "Settings saved"
        $scope.hasMessage = true;
    }
}]);
