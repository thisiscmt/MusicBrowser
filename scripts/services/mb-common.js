﻿// Service that includes common functionality for the entire app.
musicBrowserApp.factory('mbCommon', function () {
    var curInstance = this;

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
        value: "images/Placeholder_80.png",
        writable: false,
        enumerable: true,
        configurable: true
    });

    curInstance.formatDate = function(date, yearOnly, prettify) {
        var formattedDate = "";
        var newDate;

        if (date && date != "") {
            var cleanDate = date.replace(/-\?\?/g, "");
            var dateBuffer = cleanDate.split("-");

            if (dateBuffer.length == 1) {
                formattedDate = dateBuffer[0];
            }
            else {
                if (yearOnly) {
                    formattedDate = dateBuffer[0];
                }
                else {
                    if (dateBuffer.length == 2) {
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
        var formattedDuration = "";

        if (duration == 0) {
            formattedDuration = "0:0";
        }
        else if (duration < 60) {
            formattedDuration = "0:" + duration;
        }
        else {
            minutes = Math.floor(duration / 60);
            seconds = duration % 60;

            if (seconds < 10) {
                formattedDuration = minutes + ":" + "0" + seconds;
            }
            else {
                formattedDuration = minutes + ":" + seconds;
            }
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
        var mbConfig = localStorage.getItem("MBConfig");

        if (mbConfig) {
            return JSON.parse(mbConfig);
        }
        else {
            return null;
        }
    };

    curInstance.setConfiguration = function (config) {
        localStorage.setItem("MBConfig", JSON.stringify(config))
    };

    return curInstance;
});
