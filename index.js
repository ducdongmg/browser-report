/*
* Report browser settings like whatsmybrowser.org
* Inspired by
* http://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-version-using-javascript
*/
(function () {
    "use strict";

    var extractDataFromClient;

    extractDataFromClient = function (userAgent) {
        var report, match, uuid, userAgent;

        userAgent = userAgent || navigator.userAgent;

        // initialize object to store results
        report = {
            "browser": {
                "name": null,
                "version": null
            },
            "cookies": null,
            "flash": {
                "version": null
            },
            "ip": null,
            "java": {
                "version": null
            },
            "os": {
                "name": null,
                "version": null
            },
            "screen": {
                "colors": null,
                "dppx": null,
                "height": null,
                "width": null
            },
            "scripts": true,
            "userAgent": userAgent,
            "viewport": {
                "height": null,
                "layout": {
                    "height": null,
                    "width": null
                },
                "width": null,
                "zoom": null
            },
            "websockets": null
        };


        // extract browser name from user agent
        if (userAgent.indexOf("Trident") >= 0 || userAgent.indexOf("MSIE") >= 0) {
            if (userAgent.indexOf("Mobile") >= 0) {
                report.browser.name = "IE Mobile";
            } else {
                report.browser.name = "Internet Explorer";
            }
        }

        if (userAgent.indexOf("Firefox") >= 0 && userAgent.indexOf("Seamonkey") === -1) {
            if (userAgent.indexOf("Android") >= 0) {
                report.browser.name = "Firefox for Android";
            } else {
                report.browser.name = "Firefox";
            }
        }

        if (userAgent.indexOf("Safari") >= 0 && userAgent.indexOf("Chrome") === -1 && userAgent.indexOf("Chromium") === -1 && userAgent.indexOf("Android") === -1) {
            if (userAgent.indexOf("CriOS") >= 0) {
                report.browser.name = "Chrome for iOS";
            } else if (userAgent.indexOf("FxiOS") >= 0) {
                report.browser.name = "Firefox for iOS";
            } else {
                report.browser.name = "Safari";
            }
        }

        if (userAgent.indexOf("Chrome") >= 0) {
            if (userAgent.match(/\bChrome\/[.0-9]* Mobile\b/)) {
                if (userAgent.match(/\bVersion\/\d+\.\d+\b/) || userAgent.match(/\bwv\b/)) {
                    report.browser.name = "WebView on Android";
                } else {
                    report.browser.name = "Chrome for Android";
                }
            } else {
                report.browser.name = "Chrome";
            }
        }

        if (userAgent.indexOf("Android") >= 0 && userAgent.indexOf("Chrome") === -1 && userAgent.indexOf("Chromium") === -1 && userAgent.indexOf("Trident") === -1 && userAgent.indexOf("Firefox") === -1) {
            report.browser.name = "Android Browser";
        }

        if (userAgent.indexOf("Edge") >= 0) {
            report.browser.name = "Edge";
        }

        if (userAgent.indexOf("UCBrowser") >= 0) {
            report.browser.name = "UC Browser for Android";
        }

        if (userAgent.indexOf("OPR") >= 0 || userAgent.indexOf("Opera") >= 0) {
            if (userAgent.indexOf("Opera Mini") >= 0) {
                report.browser.name = "Opera Mini";
            } else {
                report.browser.name = "Opera";
            }
        }


        // extract browser version number from user agent
        match = null;

        switch (report.browser.name) {
        case "Chrome":
        case "Chrome for Android":
        case "WebView on Android":
            match = userAgent.match(/Chrome\/((\d+\.)+\d+)/);
            break;
        case "Firefox":
        case "Firefox for Android":
            match = userAgent.match(/Firefox\/((\d+\.)+\d+)/);
            break;
        case "Firefox for iOS":
            match = userAgent.match(/FxiOS\/((\d+\.)+\d+)/);
        case "Edge":
        case "Internet Explorer":
        case "IE Mobile":

            if (userAgent.indexOf("Edge") >= 0) {
                match = userAgent.match(/Edge\/((\d+\.)+\d+)/);
            } else if (userAgent.indexOf("rv:11") >= 0) {
                match = userAgent.match(/rv:((\d+\.)+\d+)/);
            } else if (userAgent.indexOf("MSIE") >= 0) {
                match = userAgent.match(/MSIE\ ((\d+\.)+\d+)/);
            }

            break;
        case "Safari":
        case "Android Browser":
            match = userAgent.match(/Version\/((\d+\.)+\d+)/);
            break;
        case "UC Browser for Android":
            match = userAgent.match(/UCBrowser\/((\d+\.)+\d+)/);
            break;
        case "Opera Mini":
            match = userAgent.match(/Opera Mini\/((\d+\.)+\d+)/);
            break;
        case "Opera":
            if (userAgent.match(/OPR/)) {
                match = userAgent.match(/OPR\/((\d+\.)+\d+)/);
            } else if (userAgent.match(/Version/)) {
                match = userAgent.match(/Version\/((\d+\.)+\d+)/);
            } else {
                match = userAgent.match(/Opera\/((\d+\.)+\d+)/);
            }
            break;
        default:
            match = userAgent.match(/\/((\d+\.)+\d+)$/);
            break;
        }

        if (match && match[1]) {
            report.browser.version = match[1];
        }

        // pull in browser window size from the visual viewport
        report.viewport.width = window.innerWidth;
        report.viewport.height = window.innerHeight;

        // deprecate report.browser.size
        Object.defineProperty(report.browser, "size", {
            get: function () {
                console.warn("browser.size is deprecated; use viewport.width and viewport.height");
                return report.viewport.width + " x " + report.viewport.height;
            }
        });

        // pull in raw values for layout viewport
        report.viewport.layout.width = document.documentElement.clientWidth;
        report.viewport.layout.height = document.documentElement.clientHeight;

        // define viewport zoom property
        report.viewport.zoom = report.viewport.layout.width / report.viewport.width;


        // are cookies enabled
        report.cookies = !!navigator.cookieEnabled;

        // double check if cookies are enabled
        if (!report.cookies) {

            // generate UUID
            uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
            uuid = uuid.replace(/[xy]/g, function (c) {
                var r, v;

                r = Math.random() * 16 | 0;
                v = c === 'x'
                    ? r
                    : (r & 0x3 | 0x8);

                return v.toString(16);
            });
            document.cookie = uuid;

            if (document.cookie.indexOf(uuid) >= 0) {
                report.cookies = true;
            }

            document.cookie = uuid + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }


        // check plugins
        (function (plugins) {
            var i, l, plugin;

            if (plugins) {
                l = plugins.length;

                for (i = 0; i < l; i += 1) {
                    plugin = plugins.item(i);

                    // what version of Adobe Flash
                    if (plugin.name.indexOf("Flash") >= 0) {
                        match = plugin.description.match(/\b((\d+\.)+\d+)\b/);
                        if (match && match[1]) {
                            report.flash.version = match[1];
                        }
                    }

                    // what version of Java
                    if (plugin.name.indexOf("Java") >= 0) {
                        match = plugin.description.match(/\b((\d+\.)+\d+)\b/);
                        if (match && match[1]) {
                            report.java.version = match[1];
                        }
                    }
                }
            }
        }(navigator.plugins));


        // extract operating system name from user agent
        if (userAgent.indexOf("Windows") >= 0) {
            if (userAgent.indexOf("Windows Phone") >= 0) {
                report.os.name = "Windows Phone";
            } else {
                report.os.name = "Windows";
            }
        }

        if (userAgent.indexOf("OS X") >= 0 && userAgent.indexOf("Android") === -1) {
            report.os.name = "OS X";
        }

        if (userAgent.indexOf("Linux") >= 0) {
            report.os.name = "Linux";
        }

        if (userAgent.indexOf("like Mac OS X") >= 0) {
            report.os.name = "iOS";
        }

        if ((userAgent.indexOf("Android") >= 0 || userAgent.indexOf("Adr") >= 0) && userAgent.indexOf("Windows Phone") === -1) {
            report.os.name = "Android";
        }


        // extract operating system version from user agent
        match = null;

        switch (report.os.name) {
        case "Windows":
        case "Windows Phone":
            if (userAgent.indexOf("Win16") >= 0) {
                report.os.version = "3.1.1";
            } else if (userAgent.indexOf("Windows CE") >= 0) {
                report.os.version = "CE";
            } else if (userAgent.indexOf("Windows 95") >= 0) {
                report.os.version = "95";
            } else if (userAgent.indexOf("Windows 98") >= 0) {
                if (userAgent.indexOf("Windows 98; Win 9x 4.90") >= 0) {
                    report.os.version = "Millennium Edition";
                } else {
                    report.os.version = "98";
                }
            } else {
                match = userAgent.match(/Win(?:dows)?(?: Phone)?[\ _]?(?:(?:NT|9x)\ )?((?:(\d+\.)*\d+)|XP|ME|CE)\b/);

                if (match && match[1]) {
                    switch (match[1]) {
                    case "6.4":
                        match[1] = "10.0";
                        break;
                    case "6.3":
                        match[1] = "8.1";
                        break;
                    case "6.2":
                        match[1] = "8";
                        break;
                    case "6.1":
                        match[1] = "7";
                        break;
                    case "6.0":
                        match[1] = "Vista";
                        break;
                    case "5.2":
                        match[1] = "Server 2003";
                        break;
                    case "5.1":
                        match[1] = "XP";
                        break;
                    case "5.01":
                        match[1] = "2000 SP1";
                        break;
                    case "5.0":
                        match[1] = "2000";
                        break;
                    case "4.0":
                        match[1] = "4.0";
                        break;
                    default:
                        // nothing
                        break;
                    }
                }
            }
            break;
        case "OS X":
            match = userAgent.match(/OS\ X\ ((\d+[._])+\d+)\b/);
            break;
        case "Linux":
            // linux user agent strings do not usually include the version
            report.os.version = null;
            break;
        case "iOS":
            match = userAgent.match(/OS\ ((\d+[._])+\d+)\ like\ Mac\ OS\ X/);
            break;
        case "Android":
            match = userAgent.match(/(?:Android|Adr)\ ((\d+[._])+\d+)/);
            break;
        default:
            // no good default behavior
            report.os.version = null;
            break;
        }

        if (match && match[1]) {

            // replace underscores in version number with periods
            match[1] = match[1].replace(/_/g, ".");
            report.os.version = match[1];
        }


        // pull in screen info from W3C standard properties
        report.screen.width = screen.width;
        report.screen.height = screen.height;
        report.screen.colors = screen.colorDepth;
        if (window.devicePixelRatio && !isNaN(window.devicePixelRatio)) {
            report.screen.dppx = window.devicePixelRatio;
        } else {
            report.screen.dppx = 1;
        }

        // deprecate report.screen.size
        Object.defineProperty(report.screen, "size", {
            get: function () {
                console.warn("screen.size is deprecated; use screen.width and screen.height");
                return report.screen.width + " x " + report.screen.height;
            }
        });

        // deprecate report.screen.resolution
        Object.defineProperty(report.screen, "resolution", {
            get: function () {
                console.warn("screen.resolution is deprecated; multiply screen.width and screen.height by screen.dppx");
                return (report.screen.dppx * report.screen.width) + " x " + (report.screen.dppx * report.screen.height);
            }
        });


        // are web sockets supported
        report.websockets = !!window.WebSocket;


        // preferred language(s) for displaying pages
        report.lang = navigator.languages || navigator.language;


        // local date, time, and time zone
        report.timestamp = (new Date()).toString();


        return report;
    };


    /*
     * asynchronous version includes the remote client IP address
     * uses ipify.org API
     */
    window.browserReport = window.browserReport || function (callback) {
        var report, newScriptTag, existingScriptTag;

        report = extractDataFromClient();

        // use ipify.org to get the remote client ip address
        // define function to handle data from ipify.org
        window.getip = window.getip || function (data) {
            report.ip = data.ip;
            callback(null, report);
        };

        // inject script tag get JSONP response from ipify.org
        newScriptTag = document.createElement("script");
        newScriptTag.src = "https://api.ipify.org?format=jsonp&callback=getip";
        existingScriptTag = document.getElementsByTagName("script")[0];
        existingScriptTag.parentNode.insertBefore(newScriptTag, existingScriptTag);

        // report on errors
        newScriptTag.onerror = callback;

    };


    /*
     * synchronous version returns report immediately
     * but does not include the remote client IP address
     */
    window.browserReportSync = window.browserReportSync || function (userAgent) {
        return extractDataFromClient(userAgent);
    };
}());
