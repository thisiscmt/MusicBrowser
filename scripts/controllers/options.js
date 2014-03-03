musicBrowserControllers.controller('OptionsCtrl', ['$scope', '$routeParams', 'mbCommon', function ($scope, $routeParams, mbCommon) {
    $scope.albumChrono = false;
    $scope.hasMessage = false;
    $scope.msg = "";

    var mbConfig = mbCommon.getConfiguration();

    if (mbConfig) {
        if (mbConfig.albumChrono) {
            $scope.albumChrono = true;
        }
    }

    $scope.submitForm = function () {
        var mbConfig = {};

        mbConfig.albumChrono = $scope.albumChrono;
        mbCommon.setConfiguration(mbConfig);

        $scope.msg = "Settings saved."
        $scope.hasMessage = true;
    }
}]);
