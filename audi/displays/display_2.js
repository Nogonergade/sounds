/// <reference path="../../common_assets/displays/js/BaseCarDisplay.js" />
/// <reference path="../../common_assets/displays/js/displays.js" />

const eDisplayModes = {
    track: "track",
    drift: "drift",
    dynamic: "dynamic"
}

const eDisplayPages = {
    on: "on",
    startup: "startup"
}

const CarDisplay = {
    ...window.getNewDisplay(eDisplayPages.on, 1250),

    init: () => {
        console.log("CarDisplay.init:ks_audi_rs3_sportback display 2");
    },

    process: (cardata) => {
        if (!COMMON.process(cardata)) {
            return;
        }

        CarDisplay.changeMode(cardata.low_frequency.electronics.active_performance_mode);

    }


};