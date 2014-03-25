// Service that provides data retrieval for the app, including any manipulation of that data before 
// it is returned to the caller.
musicBrowserApp.factory('mbData', ['mbCommon', '$http', '$angularCacheFactory', function (mbCommon, $http, $angularCacheFactory) {
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
                var styleIndex;

                // For some reason Rovi includes the artist's generes in the musicStyles list as
                // well as the musicGenres list. But since they aren't going to be in Rovi's styles 
                // collection and a lookup on them will fail, we need to remove them from musicStyles
                for (var i = 0; i < result.name.musicGenres.length; i++) {
                    styleIndex = getIndexOfId(result.name.musicStyles, result.name.musicGenres[i].id);

                    if (styleIndex > -1) {
                        result.name.musicStyles.splice(styleIndex, 1);
                    }
                }

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
                        result.name.discography[i].formattedType = "Album"

                        // Rovi sets the type property to 'Album' for compilations, so we need to 
                        // manually change it in order to be able to filter them in the UI
                        if (result.name.discography[i].flags && result.name.discography[i].flags.indexOf("Compilation") > -1) {
                            result.name.discography[i].formattedType = "Compilation";
                        }

                        // Since both singles and EPs will be shown together, we set their type to 
                        // be the same to make filtering easier
                        if (result.name.discography[i].type === "Single" || result.name.discography[i].type === "EP") {
                            result.name.discography[i].formattedType = "SingleOrEP";
                        }
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

                if (result.album.duration) {
                    result.album.durationFormatted = mbCommon.formatDuration(result.album.duration);
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
                        result.album.tracks[i].durationFormatted = mbCommon.formatDuration(result.album.tracks[i].duration);
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

    curInstance.lookupStyle = function (id) {
        var url = "api/style/" + encodeURIComponent(id);

        return $http.get(url, { cache: true }).
            success(function (data, status, headers, config) {
                var result = JSON.parse(data.Content);
                var items;

                // Some styles are stored by Rovi in their subgenres collection, so we need to check 
                // what results we have
                if (result.styles) {
                    items = result.styles;
                }
                else {
                    items = result.subgenres;
                }

                data.lookupResult = items.map(function (element) {
                    element.formattedDescription = replaceRoviLinks(element.description);
                    return element;
                });
            })
    }

    curInstance.lookupGenre = function (id) {
        var url = "api/genre/" + encodeURIComponent(id);

        return $http.get(url, { cache: true }).
            success(function (data, status, headers, config) {
                var result = JSON.parse(data.Content);

                data.lookupResult = result.genres.map(function (element) {
                    element.formattedDescription = replaceRoviLinks(element.description);
                    return element;
                });
            })
    }

    curInstance.isCached = function(requestUrl) {
        var retVal = false;

        if ($angularCacheFactory.get('dataCache').get("api" + requestUrl)) {
            retVal = true;
        }

        return retVal;
    }

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

            if (startIndex === -1) {
                done = true;
            }
            else {
                leftIndex = inputStr.indexOf("]", startIndex);

                // The ID property value is formatted as JSON, so we parse it to get the exact ID
                roviId = JSON.parse(inputStr.substring(startIndex + 10, leftIndex));
                rightIndex = inputStr.indexOf("[/roviLink]");
                collectionCode = roviId.substr(0, 2);

                // We only include a link if the Rovi ID is complete. It seems that embedded links for 
                // entities which don't currently have an entry in the database only have the two-letter 
                // collection code and not an actual ID value
                if (collectionCode === "MN" && roviId.length > 2) {
                    url = "#artist/" + roviId;
                }
                else if (collectionCode === "MW" && roviId.length > 2) {
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

            if (startIndex === -1) {
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

    // The implementation below might be doing more work than it needs to, but it is correct and 
    // produces the proper output. The idea is if a given input string is longer than we want to show 
    // in a view, we need to shorten it. The tricky part is the text may contain anchors, and we 
    // want to exclude the HTML itself when determining how many characters should be included in the 
    // shortened string. If we determine the string needs to be shortened, we start at the beginning 
    // and count until we've reached the max length allowed. If we run into an anchor tag, we briefly 
    // stop counting until we reach an appropriate closing tag. Once we have our stopping point, we 
    // keep going until we reach a space or carriage return, so we don't break in the middle of a word.
    // We also need to make sure we aren't in the middle of an anchor so we produce malformed HTML.
    var getShortDescription = function (inputStr) {
        var index;
        var count;
        var done;
        var counting;
        var anchorOpen;
        var anchorClosed;

        // If the text minus all anchors is less than the max allowed, return the original input as-is
        if (inputStr.replace(/\<[^\>]*\>/gi, '').length <= curInstance.maxShortDescriptionLength) {
            return inputStr;
        }

        done = false;
        index = 0;
        count = 0;
        counting = true;

        while (!done) {
            if (inputStr.substr(index, 2) === "<a") {
                counting = false;
                anchorOpen = true;
                index = index + 2;
            }
            else if (inputStr.substr(index, 2) === "'>") {
                counting = true;
                index = index + 2;
            }
            else if (inputStr.substr(index, 4) === "</a>") {
                anchorOpen = false;
                index = index + 4;
            }
            else {
                if (counting) {
                    count++;
                }

                if (count === curInstance.maxShortDescriptionLength) {
                    done = true;
                }
                else {
                    index++;
                }
            }
        }

        done = false;

        while (!done) {
            if (inputStr[index] === " " || inputStr[index] === "\r") {
                if (anchorOpen) {
                    anchorClosed = false;

                    while (!anchorClosed) {
                        if (inputStr.substr(index, 4) === "</a>") {
                            anchorClosed = true;
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

        return inputStr.substr(0, index) + " ...";
    };

    var getIndexOfId = function (items, id) {
        var index = -1;

        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    return curInstance;
}]);
