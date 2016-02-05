// Service that includes common functionality for the entire app
musicBrowserApp.factory('mbCommon', ['$window', '$uibModal', '$rootScope', function ($window, $uibModal, $rootScope) {
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

    curInstance.showLoadingDialog = function (msg) {
        loadingDialog = $uibModal.open({
            templateUrl: "views/loadingDialog.html",
            controller: 'ModalCtrl',
            keyboard: false,
            resolve: {
                loadingMsg: function () {
                    return msg;
                }
            }
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

    curInstance.sortArray = function(property) {
        var sortOrder = 1;

        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }

        return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    curInstance.shorten = function(str, targetLen) {
        var retVal = str;

        if (str.length > targetLen) {
            // TODO
        }
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
                            formattedDate = moment(dateBuffer[1] + "/1/" + dateBuffer[0]).format("MMMM, YYYY");
                        }
                        else {
                            formattedDate = moment(dateBuffer[1] + "/1/" + dateBuffer[0]).format("M/YYYY");
                        }
                    }
                    else {
                        if (prettify) {
                            formattedDate = moment(dateBuffer[1] + "/" + dateBuffer[2] + "/" + dateBuffer[0]).format("MMMM D, YYYY");
                        }
                        else {
                            formattedDate = moment(cleanDate).format("M/D/YYYY");
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
    
    curInstance.formatError = function (error) {
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
        else if (error.data) {
            if (error.status) {
                msg = "HTTP status " + error.status + ": ";
            }

            msg = msg + error.data;
        }
        else {
            if (error.message) {
                msg = error.message;
            }
            else {
                msg = error;
            }
        }

        return msg;
    };

    curInstance.getConfiguration = function () {
        var data = localStorage.getItem("MBConfig");
        var mbConfig;

        if (data) {
            mbConfig = JSON.parse(data);
        }
        else {
            mbConfig = {};
        }

        if (!mbConfig.albumChrono) {
            mbConfig.albumChrono = false;
        }
        if (!mbConfig.pageSize) {
            mbConfig.pageSize = 20;
        }

        return mbConfig;
    };

    curInstance.setConfiguration = function (config) {
        localStorage.setItem("MBConfig", JSON.stringify(config))
    };

    return curInstance;
}]);
