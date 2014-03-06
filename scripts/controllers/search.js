musicBrowserControllers.controller('SearchCtrl', ['$scope', '$location', 'mbCommon', function ($scope, $location, mbCommon) {
    $scope.searchTerm = "";

    // Default to searching by artist
    $scope.collection = "artist";

    // If the user agent is a mobile device, we don't want to automatically focus on the search 
    // field since it will cause the virtual keyboard to appear at improper times.
    if (jQuery.browser.mobile) {
        $scope.shouldFocus = "false";
    }
    else {
        $scope.shouldFocus = "autofocus";
    }

    // This property ensures the user has typed something in the search field before initiating a search
    $scope.missingInput = true;

    $scope.submitQuery = function () {
        // Including a hash symbol in front of the path is not needed here and would actually be 
        // encoded as %23, which messes up the routing
        $location.path('/search/' + $scope.collection + "/" + $scope.searchTerm);

        // Calling the Search method adds values to the query string. The ? will be included automatically
        $location.search("size=" + mbCommon.getConfiguration().pageSize + "&offset=" + 0);
    }

    $scope.submitForm = $scope.submitQuery;

    $scope.onSearchInputChange = function () {
        if ($scope.searchTerm === "") {
            $scope.missingInput = true;
        }
        else {
            $scope.missingInput = false;
        }
    }
}]);
