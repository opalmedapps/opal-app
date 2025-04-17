// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

angular.module('OpalApp').directive("onsScrollerHeight", onsScrollerHeight);

onsScrollerHeight.$inject = ["$timeout"];

/**
 * Directives sets the height for `ons-scroller` elements inside a page,
 * There are different defaults and ways to set the height:
 * In terms of the events by which the directive sets the height:
 *  1. Default: `element.ready`: When the element is set, we set the height.
 *  2. By passing `timer` to the directive, this sets the height after a
 *     given timeout has elapsed (In the case where no events fires to indicate the instantiation)
 * In terms of the height to set the ons-scroller, there are two options:
 *  1. Default: none, the height is then determined based on the other elements that occupy
 *     the page, in this case the ons-scroller height is calculated as the remaining page height left by the other 
 *     elements; this is calculated from the top children of the `page__content` element.
 *  2. By setting the `offsetHeight` in the directive, this is a numeric value that indicates
 *     the desired height offset from the page for the element.
 * Note: This directive works well if the event fires when ALL the elements affecting this one from
 *      on the page has been instantiated correctly.
 *      If this event fires before another element is ready, please use the `offset-height` attribute instead.
 */
function onsScrollerHeight($timeout) {
    function validateNumericAttribute(attribute) {
        return (attribute &&
            attribute !== "" &&
            !isNaN(attribute)) ? Number(attribute) : null;
    }
    return {
        'restrict': 'E',
        'scope': {
            'callback': '&',
            'timer': '=',
            'offsetHeight': '='
        },
        'template': `<ons-scroller>
                        <div ng-transclude></div>
                    </ons-scroller>`,
        'transclude': true,
        'link': function (scope, elem) {
            const callback = scope.callback;
            const timer = validateNumericAttribute(scope.timer);
            let offsetHeight = validateNumericAttribute(scope.offsetHeight);
            elem.ready(activate);

            //////////////////////////////////////////////////////////////////

            function activate() {
                if (timer) $timeout(setScrollerHeight, timer);
                else setScrollerHeight();
            }

            /**
             * Sets the ons-scroller height
             * @param {EventListenerOrEventListenerObject|null} [ev=null] Event that calls the function, 
             *                                                  null if no event
             */
            function setScrollerHeight(ev = null) {
                let pageContent = elem[0].closest(".page__content");
                let scrollElem = $(elem).find('ons-scroller');
                offsetHeight = offsetHeight ?? getOffsetHeightFromPageElement(pageContent, elem);
                let height = pageContent.offsetHeight - (offsetHeight+10);
                scrollElem.css('height', `${height}px`);
                if (ev) document.removeEventListener(ev.type, setScrollerHeight);
                if (callback && typeof callback === 'function') scope.callback();
            }
            /**
             * Go through children of page and add height for elements not containing this elem.
             * Then recurse on the element that contains elem.
             * @param {Element} pageContent HTML Element to recourse, normally the pageContent element.
             * @param {Element} elem Directive element
             */
            function getOffsetHeightFromPageElement(pageContent, elem) {
                let parentElems = $(pageContent).children().toArray().filter((child) =>
                    $(child).find(elem).length > 0);
                let heightOtherElements = $(pageContent).children()
                    .toArray()
                    .filter((currElem) => currElem != elem[0] && $(currElem).find(elem).length == 0
                            && $(currElem).css('display') !== 'none')
                    .reduce((acc, currElem) => acc + currElem.offsetHeight, 0);
                return (parentElems.length == 0) ? heightOtherElements :
                    heightOtherElements + getOffsetHeightFromPageElement(parentElems[0], elem);
            }
        }

    }
}
