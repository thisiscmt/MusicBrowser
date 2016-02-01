musicBrowserControllers.controller('ArtistLookupCtrl', ['$scope', '$routeParams', '$location', '$anchorScroll', 'mbData', 'mbCommon', function ($scope, $routeParams, $location, $anchorScroll, mbData, mbCommon) {
    mbCommon.setPageTitle("Artist - " + mbCommon.currentArtist);

    $scope.artist = {};
    $scope.goBack = mbCommon.goBack;
    $scope.fullBioLink = $location.absUrl() + "/full-bio";

    $scope.panes = [
        { title: "Discography", contentType: "Album", context: "ShortDiscog", content: "views/discogList.html", visible: false, active: true },
        { title: "Members", contentType: "Member", content: "views/artistMetaList.html", visible: false, active: false },
        { title: "Related Artists", contentType: "RelatedArtist", content: "views/artistMetaList.html", visible: false, active: false }
    ];

    $scope.discogPanes = [
        { title: "Albums", contentType: "Album", active: true },
        { title: "Compilations", contentType: "Compilation", active: false },
        { title: "Singles & EPs", contentType: "SingleOrEP", active: false }
    ];

    $scope.setCurTab = function (tab) {
        // Save the current discog tab along with the artist being viewed
        sessionStorage.setItem("curTab", tab + "|" + $routeParams.id);
    }

    $scope.setCurDiscogTab = function (tab) {
        sessionStorage.setItem("curDiscogTab", tab + "|" + $routeParams.id);
    }

    $scope.setCurrentStyle = function (name) {
        mbCommon.currentStyle = name;
    }

    $scope.setCurrentAlbum = function (name) {
        mbCommon.currentAlbum = name;
    }

    $scope.doNavigation = function () {
        // TODO
    }

    // This function returns the proper discog collection based on what view is being shown
    $scope.discogSet = function (context) {
        if (context && context === "ShortDiscog") {
            return $scope.artist.shortDiscog;
        }
        else {
            return $scope.artist.discography;
        }
    }

    var orgHash = $location.hash();
    var url = $location.url();
    var loadingMsg;

    if (!mbData.isCached(url) && url.indexOf("full-bio") === -1 && url.indexOf("full-discog") === -1) {
        loadingMsg = "Retrieving artist ...";
        mbCommon.showLoadingDialog(loadingMsg);
    }

    $scope.showingFullDiscog = false;

    if (url.indexOf("full-discog") > -1) {
        $scope.showingFullDiscog = true;
    }

    mbData.lookupArtist($routeParams.id).then(function (result) {
        if (result.data) {
            $scope.artist = result.data;
            $scope.artist.shortName = mbCommon.shorten($scope.artist.name, 15);

            if ($scope.artist.active) {
                $scope.hasYears = true;
            }

            if ($scope.artist.birth.place) {
                $scope.hasBirthplace = true;
            }

            if ($scope.artist.death.date) {
                $scope.ended = true;
            }

            if ($scope.artist.headlineBioFormatted) {
                $scope.hasHeadlineBio = true;
            }

            if ($scope.artist.shortDiscog.length > 0) {
                $scope.panes[0].visible = true;
            }

            if ($scope.artist.groupMembers) {
                $scope.panes[1].visible = true;
            }

            if ($scope.artist.similars) {
                $scope.panes[2].visible = true;
            }

            if ($scope.panes[0].visible || $scope.panes[1].visible || $scope.panes[2].visible) {
                $scope.hasVisibleTabs = true;
            }

            var buffer;
            var val;
            var panes;

            // Check if a previously saved tab exists, and if the artist matches the one being viewed 
            // set that tab as the active one. This way when a user views the details of an item, then 
            // goes back, they will return to the tab they were at. We include the artist's ID so when 
            // they view some other artist it will default to the first tab in the view.
            if (url.indexOf("full-discog") > -1) {
                val = sessionStorage.getItem("curDiscogTab");
                panes = $scope.discogPanes;
            }
            else {
                val = sessionStorage.getItem("curTab");
                panes = $scope.panes;
            }

            if (val) {
                buffer = val.split("|");

                for (var i = 0; i < panes.length; i++) {
                    if (panes[i].title === buffer[0] && $routeParams.id === buffer[1]) {
                        panes[i].active = true;
                    }
                    else {
                        panes[i].active = false;
                    }
                }
            }
        }
        else if (result.error) {
            $scope.msg = result.error;
            $scope.hasMessage = true;
        }
        else {
            $scope.noResults = true;
        }

        if (url.indexOf("full-discog") > -1) {
            $location.hash("discography");
            $anchorScroll();
            $location.hash(orgHash);
        }

        mbCommon.closeLoadingDialog();
        $scope.ready = true;
    });
}]);
