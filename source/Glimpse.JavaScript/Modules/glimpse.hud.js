﻿(function($, pubsub, data, elements, util) {
    var loaded = function() {
            var html = '',
                tabData = data.currentData().data.glimpse_hud;

            html += clientTimings.render(tabData.data);
            html += '<div class="glimpse-hud-divider"></div>';
            html += mvcTimings.render(tabData.data);
            html += '<div class="glimpse-hud-divider"></div>';
            html += ajaxRequests.render(tabData.data);

            elements.opener().find('tr').prepend('<td class="glimpse-hud">' + html + '</td>');
        },
        clientTimings = (function() {
            var timingApi = window.performance.timing,
                render = function() {
                    var html = '';

                    if (timingApi) {
                        var timingSum = 0,
                            timing = populate();

                        html += '<div class="glimpse-hud-section"><span class="glimpse-hud-title">Timings</span><table class="glimpse-hud-graph-bar"><tr>';
                        for (var key in timing) {
                            var category = timing[key];

                            timingSum += category.duration;
                            html += '<td style="background-color:' + category.categoryColor + ';width:' + category.percentage + '%" title="' + category.label + ' timing - ' + category.duration + ' ms"></td>';
                        }

                        html += '</tr></table><span class="glimpse-hud-details"><span title="Total request time" class="glimpse-hud-focus">' + timingSum + ' ms</span> ';
                        html += '(<span title="Network timing">' + timing.network.duration + ' ms</span> / <span title="Server timing">' + timing.server.duration + ' ms</span> / <span title="Browser timing">' + timing.browser.duration + ' ms</span>)';
                        html += '</span></div>';
                    }

                    return html;
                },
                populate = function() {
                    var result = { },
                        timingOrder = ['navigationStart', 'redirectStart', 'redirectStart', 'redirectEnd', 'fetchStart', 'domainLookupStart', 'domainLookupEnd', 'connectStart', 'secureConnectionStart', 'connectEnd', 'requestStart', 'responseStart', 'responseEnd', 'unloadEventStart', 'unloadEventEnd', 'domLoading', 'domInteractive', 'msFirstPaint', 'domContentLoadedEventStart', 'domContentLoadedEventEnd', 'domContentLoaded', 'domComplete', 'loadEventStart', 'loadEventEnd'],
                        start = timingApi.navigationStart || 0,
                        network = calculateTimings(start, timingOrder, 'navigationStart', 'connectEnd'),
                        server = calculateTimings(start, timingOrder, 'requestStart', 'responseEnd'),
                        browser = calculateTimings(start, timingOrder, 'unloadEventStart', 'loadEventEnd'),
                        total = network + server + browser;

                    result.network = { label: 'Network', categoryColor: '#FD4545', duration: network, percentage: (network / total) * 100 };
                    result.server = { label: 'Server', categoryColor: '#823BBE', duration: server, percentage: (server / total) * 100 };
                    result.browser = { label: 'Browser', categoryColor: '#5087CF', duration: browser, percentage: (browser / total) * 100 };

                    return result;
                },
                calculateTimings = function(start, timingOrder, startIndex, finishIndex) {
                    var total = 0;
                    for (var i = timingOrder.indexOf(startIndex); i <= timingOrder.indexOf(finishIndex); i++) {
                        var value = timingApi[timingOrder[i]];
                        if (value && value > total) {
                            total = (value - start);
                        }
                    }
                    return total;
                };

            return {
                render: render
            };
        })(),
        mvcTimings = (function() {
            var render = function(tabData) {
                    var html = '',
                        mvcData = tabData.mvc;

                    if (mvcData) {
                        var viewIsDifferent = mvcData.actionName != mvcData.viewName;
                        html += '<div class="glimpse-hud-section"><span class="glimpse-hud-title">MVC</span> '; 
                        html += '<span class="glimpse-hud-details"><span class="glimpse-hud-focus"><span title="MVC Controller">' + mvcData.controllerName + '</span>:<span title="MVC Action' + (!viewIsDifferent ? ' & View' : '') + '">' + mvcData.actionName + '</span> <span title="Action execution time">' + mvcData.actionExecutionTime + ' ms</span></span> ';
                        html += '(' + (viewIsDifferent ? '<span title="View Name">' + mvcData.viewName + '</span> ' : '') + '<span title="View rendering time">' + mvcData.viewRenderTime + ' ms</span> - <span title="Number of child actions">' + mvcData.childActionCount + '</span> / <span title="Number of child views">' + mvcData.childViewCount + '</span>)';
                        html += '</span></div>';
                    }

                    return html;
                };

            return {
                render: render
            };
        })(),
        ajaxRequests = (function() {
            var send = XMLHttpRequest.prototype.send,
                count = 0,
                render = function() {
                    var html = '<div class="glimpse-hud-section"><span class="glimpse-hud-title">Ajax</span> <span class="glimpse-hud-details"><span title="Number of Ajax request" class="glimpse-hud-focus glimpse-hug-ajax-count">0</span></span></div>';
                    return html;
                },
                update = function() {
                    $('.glimpse-hug-ajax-count').text(++count);
                };
             
            XMLHttpRequest.prototype.send = function() { 
                update();
                send.apply(this, arguments);
            };

            return {
                render: render
            };
        })();
        
        /*
        //Resource Spike 
        processResourceEntities = function() {
            var html = '';
            
            if (window.performance.getEntriesByType) { 
                var resourceList = window.performance.getEntriesByType("resource");
                for (var i = 0; i < resourceList.length; i++)
                { 
                    console.log("End to end resource fetch: " + resourceList[i].duration); 
                    for (var key in resourceList[i]) {
                        console.log('   ' + key + ' = ' + resourceList[i][key]);
                    }
                } 
            }

            return html;
        }
        */
        ;

    pubsub.subscribe('action.shell.loaded', loaded); 

})(jQueryGlimpse, glimpse.pubsub, glimpse.data, glimpse.elements, glimpse.util);