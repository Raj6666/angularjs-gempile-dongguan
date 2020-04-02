/* eslint-disable no-undef*/
let config = CONFIG;
/* eslint-enable no-undef*/
if (!config) {
    config = 'dev';
}

const baseStates = [
    {
        stateRef: 'home',
        stateObj: {
            url: '/home',
            template: require('../../main.html'),
        },
    }, {
        stateRef: 'login',
        stateObj: {
            url: '/login',
            template: require('../../views/Login.html'),
            controller: 'LoginController',
        },
    },
];
const staticStates = {
    homePage: {
        stateRef: 'homePage',
        stateObj: {
            parent: 'home',
            url: '/homePage',
            template: require('../../views/HomePage.html'),
            controller: 'HomePageController',
        },
    },
    multiDimIndicators: {
        name: '设备指标分析',
        stateRef: 'multiDimIndicators',
        stateObj: {
            parent: 'home',
            url: '/multiDimIndicators',
            template: require('../../views/MultiDimIndicatorAnalysis.html'),
            controller: 'MultiDimIndicatorAnalysisController',
        },
    },
    dataDirectCityAnalysis: {
        name: '地市流向分析',
        stateRef: 'dataDirectCityAnalysis',
        stateObj: {
            parent: 'home',
            url: '/dataDirectCityAnalysis',
            template: require('../../views/DataDirectCityAnalysis.html'),
            controller: 'DataDirectCityAnalysisController',
        },
    },
    dataDirectProvinceAnalysis: {
        name: '省份流向分析',
        stateRef: 'dataDirectProvinceAnalysis',
        stateObj: {
            parent: 'home',
            url: '/dataDirectProvinceAnalysis',
            template: require('../../views/DataDirectProvinceAnalysis.html'),
            controller: 'DataDirectProvinceAnalysisController',
        },
    },
    dataDirectOutletAnalysis: {
        name: '出口流向分析',
        stateRef: 'dataDirectOutletAnalysis',
        stateObj: {
            parent: 'home',
            url: '/dataDirectOutletAnalysis',
            template: require('../../views/DataDirectOutletAnalysis.html'),
            controller: 'DataDirectOutletAnalysisController',
        },
    },
    dialingAnalysis: {
        name: '拨号分析',
        stateRef: 'dialingAnalysis',
        stateObj: {
            parent: 'home',
            url: '/dialingAnalysis',
            template: require('../../views/DialingAnalysis.html'),
            controller: 'DialingAnalysisController',
        },
    },
    dialingErrorAnalysis: {
        name: '拨号故障分析',
        stateRef: 'dialingErrorAnalysis',
        stateObj: {
            parent: 'home',
            url: '/dialingErrorAnalysis',
            template: require('../../views/DialingErrorAnalysis.html'),
            controller: 'DialingErrorAnalysisController',
        },
    },
    userKeyIndicatorAnalysis: {
        name: '用户关键指标分析',
        stateRef: 'userKeyIndicatorAnalysis',
        stateObj: {
            parent: 'home',
            url: '/userKeyIndicatorAnalysis',
            template: require('../../views/UserKeyIndicatorAnalysis.html'),
            controller: 'UserKeyIndicatorAnalysisController',
        },
    },
    autoAlert: {
        name: '主动告警',
        stateRef: 'autoAlert',
        stateObj: {
            parent: 'home',
            url: '/autoAlert',
            template: require('../../views/AutoAlert.html'),
            controller: 'AutoAlertController',
        },
    },
    flowMonitoring: {
        name: '链路流量监控',
        stateRef: 'flowMonitoring',
        stateObj: {
            parent: 'home',
            url: '/monitoring',
            template: require('../../views/FlowMonitoring.html'),
            controller: 'FlowMonitoringController',
        },
    },
};
const stateConfigs = {
    dev: ['homePage', 'multiDimIndicators', 'dataDirectCityAnalysis', 'dataDirectProvinceAnalysis', 'dataDirectOutletAnalysis', 'dialingAnalysis', 'dialingErrorAnalysis', 'userKeyIndicatorAnalysis', 'autoAlert', 'flowMonitoring'],
    devBuild: ['homePage', 'multiDimIndicators', 'dataDirectCityAnalysis', 'dataDirectProvinceAnalysis', 'dataDirectOutletAnalysis', 'dialingAnalysis', 'dialingErrorAnalysis', 'userKeyIndicatorAnalysis', 'autoAlert', 'flowMonitoring'],
    devBuildSIT: ['homePage', 'multiDimIndicators', 'dataDirectCityAnalysis', 'dataDirectProvinceAnalysis', 'dataDirectOutletAnalysis', 'dialingAnalysis', 'dialingErrorAnalysis', 'userKeyIndicatorAnalysis', 'autoAlert', 'flowMonitoring'],
    prodDG: ['homePage', 'multiDimIndicators', 'dataDirectCityAnalysis', 'dataDirectProvinceAnalysis', 'dataDirectOutletAnalysis', 'dialingAnalysis', 'dialingErrorAnalysis', 'userKeyIndicatorAnalysis', 'autoAlert', 'flowMonitoring'],
    prodDGDEV: ['homePage', 'multiDimIndicators', 'dataDirectCityAnalysis', 'dataDirectProvinceAnalysis', 'dataDirectOutletAnalysis', 'dialingAnalysis', 'dialingErrorAnalysis', 'userKeyIndicatorAnalysis', 'autoAlert', 'flowMonitoring'],
};

let states = [];
let stateRefConfigs = [];
stateConfigs[config].map(item => {
    states.push(staticStates[item]);
});
states = baseStates.concat(states);
states.map(state => {
    stateRefConfigs.push(state.stateRef);
});
module.exports = {
    baseStates,
    states,
    staticStates,
    stateRefConfigs,
};