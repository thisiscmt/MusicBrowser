// Service that includes common functionality for the entire app.
musicBrowserApp.factory('mbCommon', ['$window', '$modal', '$rootScope', function ($window, $modal, $rootScope) {
    var curInstance = this;
    var loadingDialog = null;

    Object.defineProperty(curInstance, "placeholderImageSmall", {
        value: "images/Placeholder_25.png",
        writable: false,
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(curInstance, "placeholderImageMedium", {
        value: "images/Placeholder_50.png",
        writable: false,
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(curInstance, "placeholderImageLarge", {
        value: "images/Placeholder_90.png",
        writable: false,
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(curInstance, "currentArtist", {
        value: "",
        writable: true,
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(curInstance, "currentAlbum", {
        value: "",
        writable: true,
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(curInstance, "currentStyle", {
        value: "",
        writable: true,
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(curInstance, "currentGenre", {
        value: "",
        writable: true,
        enumerable: true,
        configurable: true
    });

    // For some reason the modal functionality in UI Bootstrap requires that the controller for the modal
    // window itself be a function, rather than a true Angular one created by calling the controller()
    // method of the main app module. Maybe it's possible to use controller(), but this works well enough.
    var modalCtrl = function ($scope, $modalInstance, loadingMsg) {
        $scope.loadingMsg = loadingMsg;
    };

    curInstance.showLoadingDialog = function (msg) {
        loadingDialog = $modal.open({
            templateUrl: "views/loadingDialog.html",
            controller: modalCtrl,
            keyboard: false,
            resolve: {
                loadingMsg: function () {
                    return msg;
                }
            }
        });

        // A bug in version 0.10 of UI Bootstrap causes the scope for a modal to not be discarded
        // after use, so a subsequent attempt to open/close one will raise an exception. Setting
        // the modal instance to basically nothing after we're done with it allows it to be safely 
        // reused. A fix is slated for the next UI Bootstrap release.
        loadingDialog.result.then(function () {
        }, function () {
        })['finally'](function () {
            loadingDialog = undefined;
        });
    }

    curInstance.closeLoadingDialog = function () {
        if (loadingDialog) {
            loadingDialog.close();
        }
    }

    // We use this function to set the page title since it will need to be called from within different
    // controllers. The value of the title element itself is based on a property of the root scope, but
    // we can't set it inside an event handler like $routeChangeSuccess because in some cases the value 
    // we want to use won't be known until we reach the controller code (e.g. the name of the artist 
    // being shown in the artist lookup view)
    curInstance.setPageTitle = function (title) {
        $rootScope.title = title;
    }

    curInstance.goBack = function () {
        $window.history.back();
    }

    curInstance.formatDate = function(date, yearOnly, prettify) {
        var formattedDate = "";
        var newDate;

        if (date && date != "") {
            // Dates may include ?? in place of a valid part (e.g. 2001-??-??), so we need to remove
            // them first
            var cleanDate = date.replace(/-\?\?/g, "");
            var dateBuffer = cleanDate.split("-");

            if (dateBuffer.length === 1) {
                formattedDate = dateBuffer[0];
            }
            else {
                if (yearOnly) {
                    formattedDate = dateBuffer[0];
                }
                else {
                    if (dateBuffer.length === 2) {
                        if (prettify) {
                            newDate = Date.parse(dateBuffer[1] + "/" + dateBuffer[0]);
                            formattedDate = newDate.toString("MMMM, yyyy");
                        }
                        else {
                            formattedDate = Date.parse(dateBuffer[1] + "/" + dateBuffer[0]).toString("M/yyyy");
                        }
                    }
                    else {
                        if (prettify) {
                            newDate = Date.parse(dateBuffer[1] + "/" + dateBuffer[2] + "/" + dateBuffer[0]); 
                            formattedDate = newDate.toString("MMMM d, yyyy");
                        }
                        else {
                            formattedDate = Date.parse(cleanDate).toString("M/d/yyyy");
                        }
                    }
                }
            }
        }

        return formattedDate;
    };
    
    curInstance.formatDuration = function (duration) {
        var minutes;
        var seconds;
        var formattedDuration = "";
        var formattedSeconds = "";
        var formattedMinutes = "";
        var formattedHours = "";

        if (duration === 0) {
            formattedDuration = "0:0";
        }
        else if (duration < 60) {
            formattedDuration = "0:" + duration;
        }
        else {
            minutes = Math.floor(duration / 60);
            seconds = duration % 60;

            if (minutes > 59) {
                formattedHours = Math.floor(minutes / 60) + ":";
                minutes = minutes % 60;
            }

            if (minutes < 10 && formattedHours != "") {
                formattedMinutes = "0" + minutes
            }
            else {
                formattedMinutes = minutes
            }

            if (seconds < 10) {
                formattedSeconds = ":0" + seconds;
            }
            else {
                formattedSeconds = ":" + seconds;
            }

            formattedDuration = formattedHours + formattedMinutes + formattedSeconds;
        }

        return formattedDuration;
    };
    
    curInstance.formatError = function (error, status) {
        var response;
        var msg;

        if (error.responseText && error.responseText != "") {
            try {
                response = JSON.parse(error.responseText);

                if (response.Message) {
                    if (response.ExceptionMessage != "") {
                        msg = response.ExceptionMessage;
                    }
                    else {
                        msg = response.Message;
                    }
                }
                else {
                    msg = response.error;
                }
            }
            catch (ex) {
                msg = error.responseText;
            }
        }
        else {
            msg = "HTTP error code " + status;
        }

        return msg;
    };

    curInstance.getConfiguration = function () {
        var val = localStorage.getItem("MBConfig");
        var mbConfig;

        if (val) {
            mbConfig = JSON.parse(val);
        }
        else {
            mbConfig = {};
        }

        if (!mbConfig.albumChrono) {
            mbConfig.albumChrono = false;
        }
        if (mbConfig.pageSize) {
            mbConfig.pageSize = parseInt(mbConfig.pageSize);
        }
        else {
            mbConfig.pageSize = 20;
        }

        return mbConfig;
    };

    curInstance.setConfiguration = function (config) {
        localStorage.setItem("MBConfig", JSON.stringify(config))
    };

    return curInstance;
}]);
