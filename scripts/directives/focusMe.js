musicBrowserApp.directive('focusMe', ['$timeout', function ($timeout) {
    return {
        scope: { trigger: '=focusMe' },
        link: function (scope, element) {
            scope.$watch('trigger', function (value) {
                if (value === true) {
                    element[0].focus();
                    scope.trigger = false;
                }
            });
        }
    };
}]);