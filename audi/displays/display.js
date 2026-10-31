/// <reference path="../../common_assets/displays/js/BaseCarDisplay.js" />
/// <reference path="../../common_assets/displays/js/displays.js" />
/// <reference path="../../../../uiresources/src/js/ksUI.js" />

const eDisplayPages = {
    sport: "sport",
    performance: "performance",
    runway: "runway",
    startup: "startup"
};

const eDisplayModes = {
    track: "track",
    drift: "drift",
    dynamic: "dynamic"
}

const sportSpeedNeedleTable = [
    [null, 0],
    [0, -35],
    [20, -10],
    [40, 15],
    [60, 40],
    [80, 65],
    [100, 90],
    [140, 115],
    [180, 140],
    [220, 165],
    [260, 190],
    [320, 215],
    [1000, 215]
];

const sportRpmNeedleTable = [
    [null, 0],
    [0, -35],
    [1000, -4],
    [2000, 28],
    [3000, 59],
    [4000, 90],
    [5000, 121],
    [6000, 153],
    [7000, 184],
    [8000, 215],
    [10000, 215]
];

const rpmBarTables = {
    runway: [
        [null, 0],
        [0, 0],
        [1000, 23],
        [2000, 49],
        [3000, 84],
        [4000, 126],
        [5000, 182],
        [6000, 259],
        [7000, 373],
        [8000, 418],
        [10000, 418]
    ],
    performance: [
        [null, 0],
        [0, -1588],
        [1000, -1502],
        [2000, -1393],
        [3000, -1285],
        [4000, -1167],
        [5000, -1069],
        [6000, -970],
        [7000, -880],
        [8000, -880],
        [10000, -880]
    ]
}

const performanceRpmNeedleTable = [
    [null, 0],
    [0, -141],
    [1000, -58],
    [2000, 46],
    [3000, 150],
    [4000, 266],
    [5000, 364],
    [6000, 463],
    [7000, 553],
    [8000, 553],
    [10000, 553]
];

/** 
@type { import('../../common_assets/displays/js/BaseCarDisplay.js').default } BaseCarDisplay
*/
const CarDisplay = {

    ...window.getNewDisplay(eDisplayPages.startup, 2500),

    /** @type {HTMLDivElement} */
    lbl_speed: null,

    /** @type {HTMLDivElement} */
    lbl_speed_mirror: null,

    /** @type {HTMLDivElement} */
    gmeterdot: null,

    /** @type {HTMLDivElement} */
    torqueBar: null,

    /** @type {HTMLDivElement} */
    turboBar: null,

    /** @type {HTMLDivElement} */
    speedNeedle: null,

    /** @type {HTMLDivElement} */
    rpmNeedle: null,

    /** @type {HTMLDivElement} */
    fuelBar: null,

    /** @type {HTMLDivElement} */
    dateValue: null,

    lastUpdateTime: 0,

    tyresPage: null,

    rpmNeedles: {
        performance: null,
        sport: null
    },

    rpmBars: {
        performance: null,
        runway: null
    },

    torqueBar: null,
    powerBar: null,
    torqueNeedle: null,
    powerNeedle: null,

    gmeterFront: null,
    gmeterRear: null,
    gmeterLeft: null,
    gmeterRight: null,


    maxvalues: [0, 0],

    init: () => {
        console.log("CarDisplay.init:ks_audi_rs3_sportback");

        CarDisplay.lbl_speed = $.q(".speed");
        CarDisplay.lbl_speed_mirror = $.q(".speed_mirror");
        CarDisplay.gmeterdot = $.q(".gmeter .dot");
        CarDisplay.gmeterFront = $.q(".gmeter .front");
        CarDisplay.gmeterRear = $.q(".gmeter .rear");
        CarDisplay.gmeterLeft = $.q(".gmeter .left");
        CarDisplay.gmeterRight = $.q(".gmeter .right");



        CarDisplay.speedNeedle = $.q("#sport .speedneedle");
        CarDisplay.rpmNeedle = $.q("#sport .rpmneedle");

        CarDisplay.fuelBar = $.q("#sport .fuelbar");
        CarDisplay.dateValue = $.q("#sport .date");

        CarDisplay.rpmBars.performance = $.q("#performance .rpm .bar");
        CarDisplay.rpmBars.runway = $.q("#runway .rpm .bar");

        CarDisplay.rpmNeedles.performance = $.q("#performance .rpm .needle");

        CarDisplay.torqueBar = $.q(".torque-bar");
        CarDisplay.powerBar = $.q(".power-bar");

        CarDisplay.powerNeedle = $.q(".power-needle");
        CarDisplay.torqueNeedle = $.q(".torque-needle");

        CarDisplay.turboBar = $.q(".turbo-bar");

    },

    process: (cardata) => {

        if (CarDisplay.maxvalues[0] < cardata.current_bhp) {
            CarDisplay.maxvalues[0] = cardata.current_bhp;
        }

        if (CarDisplay.maxvalues[1] < cardata.current_torque) {
            CarDisplay.maxvalues[1] = cardata.current_torque;
        }

        if (!COMMON.process(cardata)) {
            return;
        }
        CarDisplay.changeMode(cardata.low_frequency.electronics.active_performance_mode);
        CarDisplay.displayIndex(cardata.low_frequency.instrumentation.display_indexes[0].current_page_index);

        if (DisplayPage == eDisplayPages.sport || DisplayPage == eDisplayPages.startup) {
            CarDisplay.sportneedles(cardata.speed, cardata.rpm);
            CarDisplay.sportfuel(cardata.fuel_liter_current_quantity_percent);
            const date = new Date();
            CarDisplay.dateValue.textContent = [date.getDate(), date.getMonth() + 1, date.getFullYear()].join(".");

        } else {

            CarDisplay.rpm(cardata.rpm);

            CarDisplay.turbo(cardata.turbo_boost_perc);

            CarDisplay.torque(cardata.current_torque);
            CarDisplay.bhp(cardata.current_bhp);
            CarDisplay.gmeter(cardata.g_forces);

        }

        document.body.classList.toggle("stopped", cardata.display_speed_kmh == 0);

    },

    rpm(rpm_value) {
        const bar = CarDisplay.rpmBars[DisplayPage];
        const needle = CarDisplay.rpmNeedles[DisplayPage];
        const classList = document.body.classList;

        if (!bar) {
            return;
        }

        const table = rpmBarTables[DisplayPage];


        if (DisplayPage == eDisplayPages.runway) {
            bar.style.heightPX = CarDisplay.convert.interpolate(rpm_value, 0, table);
        }

        if (DisplayPage == eDisplayPages.performance) {
            bar.style.maskPosition = `${CarDisplay.convert.interpolate(rpm_value, 0, table)}px -619px`;
            needle.style.leftPX = CarDisplay.convert.interpolate(rpm_value, 0, performanceRpmNeedleTable);
        }


        classList.toggle("shift-1", rpm_value > 5100);
        classList.toggle("shift-2", rpm_value > 5450);
        classList.toggle("shift-3", rpm_value > 5800);
        classList.toggle("shift-4", rpm_value > 6190);
        classList.toggle("shift-5", rpm_value > 6500);

    },

    sportfuel(fuel_percent) {
        CarDisplay.fuelBar.style.widthPX = ksUI.range(fuel_percent, 0, 1, 0, 224);
    },

    sportneedles(speed, rpm) {
        CarDisplay.speedNeedle.style.transform = `rotateZ(${CarDisplay.convert.interpolate(speed, 0, sportSpeedNeedleTable)}deg)`;
        CarDisplay.rpmNeedle.style.transform = `rotateZ(${CarDisplay.convert.interpolate(rpm, 0, sportRpmNeedleTable)}deg)`;
    },

    speed: (value) => {

        const now = Date.now();

        if (now > CarDisplay.lastUpdateTime + 500) {
            CarDisplay.lbl_speed.textContent = value;
            CarDisplay.lbl_speed_mirror.textContent = value;
            document.body.classList.toggle("in-motion", value > 0);
            CarDisplay.lastUpdateTime = now;
        }
    },


    nmsamplecount: 0,
    nmsamples: [],

    maxtorque: 450,

    torque: (torque_value) => {
        if (torque_value > CarDisplay.maxtorque) CarDisplay.maxtorque = torque_value;

        const angle = ksUI.range(torque_value, 0, CarDisplay.maxtorque, 180.1, 539.5);

        CarDisplay.nmsamples[CarDisplay.nmsamplecount] = angle;
        CarDisplay.nmsamplecount++;

        if (CarDisplay.nmsamplecount == 5) {
            CarDisplay.nmsamplecount = 0;
        }

        const average_angle = CarDisplay.convert.avgArray(CarDisplay.nmsamples);

        CarDisplay.torqueBar.style.clipPath = `path('${CarDisplay.convert.getRadialWipePath(114, 114, 114, 179.5, average_angle)}')`;
        CarDisplay.torqueNeedle.style.transform = `rotateZ(${average_angle - 90}deg)`;
    },

    bhpsamplecount: 0,
    bhpsamples: [],

    maxbhp: 350,

    bhp: (kw_value) => {
        if (kw_value > CarDisplay.maxbhp) CarDisplay.maxbhp = kw_value;

        const angle = ksUI.range(kw_value, 0, CarDisplay.maxbhp, 180.1, 539.5);

        CarDisplay.bhpsamples[CarDisplay.bhpsamplecount] = angle;
        CarDisplay.bhpsamplecount++;

        if (CarDisplay.bhpsamplecount == 5) {
            CarDisplay.bhpsamplecount = 0;
        }

        const average_angle = CarDisplay.convert.avgArray(CarDisplay.bhpsamples);

        CarDisplay.powerBar.style.clipPath = `path('${CarDisplay.convert.getRadialWipePath(114, 114, 114, 179.5, average_angle)}')`;
        CarDisplay.powerNeedle.style.transform = `rotateZ(${average_angle - 90}deg)`;
    },

    turbo: (turbo_value) => {
        CarDisplay.turboBar.style.widthPX = ksUI.range(turbo_value, 0, 1, 0, 288);
    },

    gxsamplecount: 0,
    gxsamples: [],
    gysamplecount: 0,
    gysamples: [],

    gmeter: (forces, max_g = 1.5, radius = 68) => {

        const is_front = forces.z < 0;
        const is_left = forces.x < 0;

        const absz = Math.min(Math.abs(forces.z), 1.5);
        const absx = Math.min(Math.abs(forces.x), 1.5);

        const showz = Math.abs(forces.z) >= 0.1;
        const showx = Math.abs(forces.x) >= 0.1;


        let value = {
            x: (ksUI.range(forces.x, -max_g, max_g, -radius, radius) + radius),
            y: (ksUI.range(forces.z, -max_g, max_g, -radius, radius) + radius)
        }

        function distance(dot) {
            var x1 = dot.x,
                y1 = dot.y,
                x2 = radius,
                y2 = radius;
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }

        CarDisplay.gxsamples[CarDisplay.gxsamplecount] = value.x;


        if (CarDisplay.gxsamplecount == 0) {
            CarDisplay.gmeterFront.textContent = is_front && showz ? absz.toFixed(1) : "0.0";
            CarDisplay.gmeterRear.textContent = !is_front && showz ? absz.toFixed(1) : "0.0";
            CarDisplay.gmeterLeft.textContent = is_left && showx ? absx.toFixed(1) : "0.0";
            CarDisplay.gmeterRight.textContent = !is_left && showx ? absx.toFixed(1) : "0.0";
        }


        CarDisplay.gysamples[CarDisplay.gxsamplecount] = value.y;

        CarDisplay.gxsamplecount++;
        CarDisplay.gysamplecount++;

        if (CarDisplay.gxsamplecount == 15) {
            CarDisplay.gxsamplecount = 0;
        }

        if (CarDisplay.gysamplecount == 15) {
            CarDisplay.gysamplecount = 0;
        }

        const average_x = CarDisplay.convert.avgArray(CarDisplay.gxsamples);
        const average_y = CarDisplay.convert.avgArray(CarDisplay.gysamples);

        if (distance(value) < radius) {
            CarDisplay.gmeterdot.setAttribute("style", "left: " + (average_x - 12) + "px; top: " + (average_y - 12) + "px");
        }
    },

    tyres: (cardata) => {
        function checkPressure(psi, bottom = 20, top = 40) {
            return psi < bottom || psi > top;
        }

        let warning = false;
        warning |= CarDisplay.tyresPage.classList.toggle("wlf", checkPressure(cardata.tyre_lf.tyre_pression));
        warning |= CarDisplay.tyresPage.classList.toggle("wrf", checkPressure(cardata.tyre_rf.tyre_pression));
        warning |= CarDisplay.tyresPage.classList.toggle("wlr", checkPressure(cardata.tyre_lr.tyre_pression));
        warning |= CarDisplay.tyresPage.classList.toggle("wrr", checkPressure(cardata.tyre_rr.tyre_pression));
        CarDisplay.tyresPage.classList.toggle("warning", warning);

    },

    popupDuration: 1000,

    modedebounce: 0,

    onChangeMode: (modeindex, modename) => {
        clearTimeout(CarDisplay.modedebounce);
        if (document.body.classList.contains("already-on")) return;
        document.body.classList.add("changed-mode");
        CarDisplay.modedebounce = setTimeout(() => document.body.classList.remove("changed-mode"), CarDisplay.popupDuration);

    },

    pagedebounce: 0,

    onChangePage: (page) => {
        clearTimeout(CarDisplay.pagedebounce);
        if (document.body.classList.contains("already-on")) return;
        document.body.classList.add("changed-page");
        CarDisplay.pagedebounce = setTimeout(() => document.body.classList.remove("changed-page"), CarDisplay.popupDuration);
    }
}

engine.whenReady.then(
    () => {
        $.waitForFrames(() => {
            document.body.classList.add("loaded");
        }, 1);
    }
);