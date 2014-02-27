// Service that provides data retrieval for the app, including any manipulation of that data before 
// it is returned to the caller.
musicBrowserApp.factory('mbData', ['mbCommon', '$http', function (mbCommon, $http) {
    var maxShortDescriptionLength = 150;
    var curInstance = this;

    curInstance.searchForArtist = function (query) {
        var url = "api/search/artist/" + encodeURIComponent(query);

        return $http.get(url, { cache: true }).
            success(function (data, status, headers, config) {
                var result = JSON.parse(data.Content);

                if (result.searchResponse) {
                    data.searchResult = result.searchResponse.results.map(function (element) {
                        if (element.name.images && element.name.images.length > 0) {
                            element.name.primaryImage = element.name.images[0].url;
                        }
                        else {
                            element.name.primaryImage = mbCommon.placeholderImageMedium;
                        }

                        return element;
                    });
                }
            })
    };
    
    curInstance.lookupArtist = function(id) {
        var url = "api/artist/" + encodeURIComponent(id);

        return $http.get(url, { cache: true }).
            success(function (data, status, headers, config) {
                var result = JSON.parse(data.Content);
                var primaryImage;
                var formattedBioText;

                if (result.name.discography) {
                    result.name.discography.reverse();

                    for (var i = 0; i < result.name.discography.length; i++) {
                        if (result.name.discography[i].year) {
                            result.name.discography[i].year = mbCommon.formatDate(result.name.discography[i].year, true);
                        }

                        if (result.name.discography[i].images && result.name.discography[i].images.length > 0) {
                            primaryImage = result.name.discography[i].images[0].url;
                        }
                        else {
                            primaryImage = mbCommon.placeholderImageSmall;
                        }

                        result.name.discography[i].primaryImage = primaryImage;
                    }
                }

                if (result.name.isGroup) {
                    result.name.originLabel = "Formed:";
                    result.name.endLabel = "Disbanded:"
                }
                else {
                    result.name.originLabel = "Born:";
                    result.name.endLabel = "Died:"
                }

                if (result.name.active) {
                    for (var i = 0; i < result.name.active.length; i++) {
                        result.name.active[i] = mbCommon.formatDate(result.name.active[i], true);
                    }
                }

                if (result.name.birth) {
                    var newDate = mbCommon.formatDate(result.name.birth.date, false, true);

                    if (newDate === "") {
                        result.name.birth.date = "N/A";
                    }
                    else {
                        result.name.birth.date = newDate;
                    }
                }

                if (result.name.death) {
                    var newDate = mbCommon.formatDate(result.name.death.date, false, true);

                    if (newDate != "") {
                        result.name.death.date = newDate;
                    }
                }

                if (result.name.images && result.name.images.length > 0) {
                    if (result.name.images[0].url.indexOf("Getty") == -1) {
                        primaryImage = result.name.images[0].url;
                    }
                    else if (result.name.images[1].url.indexOf("Getty") == -1) {
                        primaryImage = result.name.images[1].url;
                    }
                    else if (result.name.images[2].url.indexOf("Getty") == -1) {
                        primaryImage = result.name.images[2].url;
                    }
                    else {
                        primaryImage = mbCommon.placeholderImageLarge;
                    }

                    result.name.primaryImage = primaryImage;
                }
                else {
                    result.name.primaryImage = mbCommon.placeholderImageLarge;
                }

                if (result.name.musicBio) {
                    formattedBioText = curInstance.stripRoviLinks(result.name.musicBio.text);
                    formattedBioText = formattedBioText.split("\r\n").join("<br /><br />");
                    result.name.musicBioFormatted = formattedBioText;
                }

                if (result.name.headlineBio) {
                    result.name.headlineBioFormatted = curInstance.stripRoviLinks(result.name.headlineBio);
                }
                else {
                    if (result.name.musicBio) {
                        result.name.headlineBioFormatted = curInstance.getShortDescription(result.name.musicBioFormatted);
                    }
                }

                data.lookupResult = result.name;
            })
    };

    curInstance.searchForAlbum = function(query) {
        var url = "api/search/album/" + encodeURIComponent(query);

        return $http.get(url, { cache: true }).
            success(function (data, status, headers, config) {
                var result = JSON.parse(data.Content);

                if (result.searchResponse) {
                    data.searchResult = result.searchResponse.results.map(function (element) {
                        if (element.album.images && element.album.images.length > 0) {
                            element.album.primaryImage = element.album.images[0].url;
                        }
                        else {
                            element.album.primaryImage = mbCommon.placeholderImageMedium;
                        }

                        return element;
                    });
                }
            })
    };

    curInstance.lookupAlbum = function (id) {
        var url = "api/album/" + encodeURIComponent(id);

        return $http.get(url, { cache: true }).
            success(function (data, status, headers, config) {
                var result = JSON.parse(data.Content);
                var primaryImage;
                var formattedReviewText;

                if (result.album.originalReleaseDate) {
                    result.album.originalReleaseDate = mbCommon.formatDate(result.album.originalReleaseDate, false, true);
                }

                if (result.album.images && result.album.images.length > 0) {
                    primaryImage = result.album.images[0].url;
                }
                else {
                    primaryImage = mbCommon.placeholderImageLarge;
                }

                result.album.primaryImage = primaryImage;

                if (result.album.primaryReview) {
                    formattedReviewText = curInstance.stripRoviLinks(result.album.primaryReview.text);
                    formattedBioText = formattedReviewText.split("\r\n").join("<br /><br />");
                    result.album.primaryReviewFormatted = formattedReviewText;
                }

                if (result.album.headlineReview) {
                    result.album.headlineReviewFormatted = curInstance.stripRoviLinks(result.album.headlineReview.text);
                }
                else {
                    if (result.album.primaryReview) {
                        result.album.headlineReviewFormatted = curInstance.getShortDescription(result.album.primaryReviewFormatted);
                    }
                }

                if (result.album.tracks && result.album.tracks.length > 0) {
                    for (var i = 0; i < result.album.tracks.length; i++) {
                        result.album.tracks[i].duration = mbCommon.formatDuration(result.album.tracks[i].duration);
                    }
                }

                data.lookupResult = result.album;
            })
    };

    curInstance.searchForSong = function (query) {
        var url = "api/search/song/" + encodeURIComponent(query);

        return $http.get(url, { cache: true }).
            success(function (data, status, headers, config) {
                var result = JSON.parse(data.Content);

                if (result.searchResponse) {
                    data.searchResult = result.searchResponse.results.map(function (element) {
                        if (element.song.images && element.song.images.length > 0) {
                            element.song.primaryImage = element.song.images[0].url;
                        }
                        else {
                            element.song.primaryImage = mbCommon.placeholderImageMedium;
                        }

                        return element;
                    });
                }
            })
    };

    curInstance.stripRoviLinks = function(inputStr) {
        var done = false;
        var startIndex;
        var endIndex;
        var roviString;

        while (!done) {
            startIndex = inputStr.indexOf("[rovi");

            if (startIndex == -1) {
                done = true;
            }
            else {
                endIndex = inputStr.indexOf("]", startIndex);
                roviString = inputStr.substring(startIndex, endIndex + 1);
                inputStr = inputStr.replace(roviString, "");

                startIndex = inputStr.indexOf("[/rovi");
                endIndex = inputStr.indexOf("]", startIndex);
                roviString = inputStr.substring(startIndex, endIndex + 1);
                inputStr = inputStr.replace(roviString, "");
            }
        }

        done = false;

        while (!done) {
            startIndex = inputStr.indexOf("[muze");

            if (startIndex == -1) {
                done = true;
            }
            else {
                endIndex = inputStr.indexOf("]", startIndex);
                roviString = inputStr.substring(startIndex, endIndex + 1);
                inputStr = inputStr.replace(roviString, "");

                startIndex = inputStr.indexOf("[/muze");
                endIndex = inputStr.indexOf("]", startIndex);
                roviString = inputStr.substring(startIndex, endIndex + 1);
                inputStr = inputStr.replace(roviString, "");
            }
        }

        return inputStr;
    };

    curInstance.getShortDescription = function (inputStr) {
        if (inputStr.length > maxShortDescriptionLength) {
            var index = maxShortDescriptionLength;
            var done = false;

            while (!done) {
                if (inputStr[index] === " " || inputStr[index] === "\r") {
                    done = true;
                }
                else {
                    index++;
                }
            }

            inputStr = inputStr.substring(0, index) + " ...";
        }

        return inputStr;
    };

    return curInstance;
}]);
