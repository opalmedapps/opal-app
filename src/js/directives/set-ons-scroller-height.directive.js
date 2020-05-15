angular.module("MUHCApp").directive("setOnsScrollerHeight", setOnsScrollerHeight);
/**
 * Directives sets the height for `ons-scroller` elements inside page,
 * It does so by obtaining the height of the current page, and
 * substracting an offset passed as a variable. If the offset is not specified,
 * the offset is calculated from all the other top elements on the page. Note that this must use the
 * both the `ons-page:init` and the `ons-scroller:init` events as we do not know before hand which event will fire first.
 * --i.e. to change the scroller height, the scroller element must exist, and we need
 * to also know the page real height. In this implementation, we use both events, and the last one of the events
 * that fires is the one that instantiates the final ons-scroller.
 * The reason for these events is that an ons-page contains a 20px increase to the page which is added dynamically,
 * at instantiation, in some user devices, this is not portrayed by the page until after the `ons-page:init` event fires.
 */
function setOnsScrollerHeight() {
    return {
        'restrict': 'A',
        'link': function (scope, elem, attrs) {
            document.addEventListener('ons-page:init', scrollerInit);
            document.addEventListener('ons-scroller:init', scrollerInit);
            function scrollerInit(ev) {
                let pageContent = elem[0].closest(".page__content");
                let offsetHeight = 0;
                if (attrs.setOnsScrollerHeight &&
                    attrs.setOnsScrollerHeight !== "" &&
                    !isNaN(attrs.setOnsScrollerHeight)) {
                    offsetHeight = Number(attrs.setOnsScrollerHeight);
                } else {
                    // Go through children of page and add height for elements not containing this one.
                    offsetHeight = $(pageContent).children()
                        .toArray()
                        .filter((currElem) => {
                            return $(currElem) != $(elem) && $(currElem).find(elem).length == 0
                                && $(currElem).is(":visible");
                        })
                        .reduce((acc, currElem) => acc += currElem.offsetHeight, 0) + 10;
                }
                let height = pageContent.offsetHeight - offsetHeight;
                elem.css('height', `${height}px`);
                document.removeEventListener(ev.type, scrollerInit);
            }
        }
    }
}