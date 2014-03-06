// Service that provides data retrieval for the app, including any manipulation of that data before 
// it is returned to the caller.
musicBrowserApp.factory('mbData', ['mbCommon', '$http', function (mbCommon, $http) {
    var curInstance = this;

    Object.defineProperty(curInstance, "maxShortDescriptionLength", {
        value: 150,
        writable: false,
        enumerable: true,
        configurable: true
    });

    curInstance.searchForArtist = function (query, size, offset) {
        var url = "api/search/artist/" + encodeURIComponent(query) + "?size=" + size + "&offset=" + offset;

        return $http.get(url, { cache: true }).
            success(function (data, status, headers, config) {
                var result = JSON.parse(data.Content);

                if (result.searchResponse) {
                    data.searchResult = result.searchResponse.results.map(function (element) {
                        setPrimaryImage(element, mbCommon.placeholderImageMedium);
                        return element;
                    });
                }
            });
    };
    
    curInstance.lookupArtist = function(id) {
        var url = "api/artist/" + encodeURIComponent(id);

        return $http.get(url, { cache: true }).
            success(function (data, status, headers, config) {
                var result = JSON.parse(data.Content);
                var primaryImage;
                var formattedBioText;
                var mbConfig = mbCommon.getConfiguration();

                if (result.name.discography) {
                    if (mbConfig && mbConfig.albumChrono) {
                        result.name.discography.reverse();
                    }

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

                setPrimaryImage(result, mbCommon.placeholderImageLarge);

                if (result.name.musicBio) {
                    formattedBioText = replaceRoviLinks(result.name.musicBio.text);
                    formattedBioText = formattedBioText.split("\r\n").join("<br /><br />");
                    result.name.musicBioFormatted = formattedBioText;
                }

                if (result.name.headlineBio) {
                    result.name.headlineBioFormatted = replaceRoviLinks(result.name.headlineBio);
                }
                else {
                    if (result.name.musicBio) {
                        result.name.headlineBioFormatted = getShortDescription(result.name.musicBioFormatted);
                    }
                }

                data.lookupResult = result.name;
            })
    };

    curInstance.searchForAlbum = function (query, size, offset) {
        var url = "api/search/album/" + encodeURIComponent(query) + "?size=" + size + "&offset=" + offset;

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
                    formattedReviewText = replaceRoviLinks(result.album.primaryReview.text);
                    formattedBioText = formattedReviewText.split("\r\n").join("<br /><br />");
                    result.album.primaryReviewFormatted = formattedReviewText;
                }

                if (result.album.headlineReview) {
                    result.album.headlineReviewFormatted = replaceRoviLinks(result.album.headlineReview.text);
                }
                else {
                    if (result.album.primaryReview) {
                        result.album.headlineReviewFormatted = getShortDescription(result.album.primaryReviewFormatted);
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

    curInstance.searchForSong = function (query, size, offset) {
        var url = "api/search/song/" + encodeURIComponent(query) + "?size=" + size + "&offset=" + offset;

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

    var setPrimaryImage = function (result, placeholderImage) {
        if (result.name.images && result.name.images.length > 0) {
            // Find the first non-copyrighted image in the collection
            for (var i = 0; i < result.name.images.length; i++) {
                if (result.name.images[i].url.indexOf("Getty") === -1) {
                    result.name.primaryImage = result.name.images[i].url;
                    break;
                }
            }

            // If we didn't find any usable images, use a placeholder
            if (i === result.name.images.length) {
                result.name.primaryImage = placeholderImage;
            }
        }
        else {
            result.name.primaryImage = placeholderImage;
        }
    }

    var replaceRoviLinks = function(inputStr) {
        var done = false;
        var startIndex;
        var leftIndex;
        var rightIndex;
        var endIndex;
        var roviString;
        var roviId;
        var collectionCode;
        var entityName;
        var newText;
        var url;

        // Go through the given string and replace links to Rovi entities with markup that will 
        // navigate to the appropriate view
        while (!done) {
            startIndex = inputStr.indexOf("[roviLink");

            if (startIndex == -1) {
                done = true;
            }
            else {
                leftIndex = inputStr.indexOf("]", startIndex);

                // The ID property value is formatted as JSON, so we parse it to get the exact ID
                roviId = JSON.parse(inputStr.substring(startIndex + 10, leftIndex));
                rightIndex = inputStr.indexOf("[/roviLink]");
                collectionCode = roviId.substring(0, 2);

                // We only include a link if the Rovi ID is complete. It seems that embedded links for 
                // entities which don't currently have an entry in the database only have the two-letter 
                // collection code and not an actual ID value
                if (collectionCode == "MN" && roviId.length > 2) {
                    url = "#artist/" + roviId;
                }
                else if (collectionCode == "MW" && roviId.length > 2) {
                    url = "#album/" + roviId;
                }
                else {
                    url = "";
                }

                entityName = inputStr.substring(leftIndex + 1, rightIndex);

                if (url === "") {
                    newText = entityName;
                }
                else {
                    newText = "<a href='" + url + "'>" + entityName + "</a>";
                }

                endIndex = inputStr.indexOf("]", rightIndex);
                roviString = inputStr.substring(startIndex, endIndex + 1);
                inputStr = inputStr.replace(roviString, newText);
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

    var getShortDescription = function (inputStr) {
        if (inputStr.length > curInstance.maxShortDescriptionLength) {
            var index = curInstance.maxShortDescriptionLength;
            var done = false;
            var linkStarted = false;
            var linkEnded = false;

            // Check if we've started an anchor in the initial block of text, since we'll need to 
            // grab more of the input string if we have
            if (inputStr.indexOf("<a") < curInstance.maxShortDescriptionLength) {
                linkStarted = true;
            }

            while (!done) {
                if (inputStr[index] === " " || inputStr[index] === "\r") {
                    if (linkStarted) {
                        // Search for the index of the closing tag of the anchor
                        while (!linkEnded) {
                            if (inputStr.substring(index, index + 4) === "</a>") {
                                linkEnded = true;
                                index = index + 4; // For the last 4 chars of the anchor tag
                            }
                            else {
                                index++;
                            }
                        }
                    }

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
