/* eslint-disable */
let env = CONFIG;
/* eslint-enable */
let basePath = '';
let garnetPath = '';

switch (env) {
    case 'prodDG':
        basePath = '/gemstack-rs/v1.0';
        break;
    case 'prodCZ':
        basePath = 'http://188.5.28.83:28406/gemstack-rs/v1.0';
        break;
    case 'prodDGDEV':
        basePath = '/gemstack-rs-dev/v1.0';
        break;
    case 'devBuildSIT':
        basePath = 'http://192.168.6.97:8080/gemstack-rs-sit/v1.0';
        break;
    case 'devCZ':
        basePath = 'http://192.168.6.22:8080//gemstack-rs/v1.0';
        break;
    case 'dev':
        basePath = 'http://localhost:8080/gemstack-rs/v1.0';
        break;
    default:
        basePath = 'http://188.5.28.83:28406/gemstack-rs/v1.0';
        break;
}
module.exports = {

    /** 登陆 */
    auth: {
        login: basePath + '/authentication',
    },

    /** 指标 */
    indicator: {
        indicators: basePath + '/indicators/',
    },

    /** 模板 */
    template: {
        templates: basePath + '/templates/',
        searchTemplates: basePath + '/templates/search/',
    },

    /**设备多维度指标分析*/
    device: {
        deviceList: basePath + '/devices',
        applicationTypeList: basePath + '/applicationType',
        applicationList: basePath + '/application',
        indicatorAnalysis: basePath + '/indicatorAnalysis',
        indicatorAnalysisTop10: basePath + '/indicatorAnalysis/top10',
        indicatorAnalysisAllDimension: basePath + '/indicatorAnalysis/allDimension',
        websiteTypeList: basePath + '/websiteTypes',
        websiteList: basePath + '/websiteList',
        userAccountList: basePath + '/indicatorAnalysis/userAccount',
    },

    /** 业务大小类 */
    application: {
        applicationTypes: basePath + '/applicationType',
        applications: basePath + '/application',
        applicationTree: basePath + '/application/tree',
    },

    /** 运营商/地市/省份流向分析-总流量与其占比 */
    flow: {
        dataDirectAnalysis: basePath + '/dataDirectAnalysis',
    },

    /** 区县/小区 */
    location: {
        area: basePath + '/area',
        community: basePath + '/community',
    },

    /**拨号分析*/
    dialing: {
        ErrorAnalysis: basePath + '/dialingFaultStatistics', //拨号分析
        Analysis: basePath + '/dialingStatistics',//拨号故障分析
    },

    /**主动告警 */
    autoAlert: {
        rule: {
            searchRuleList: basePath + '/autoAlert/ruleList', // 查询规则列表
            rule: basePath + '/autoAlert/rule', // 添加、更新、删除规则
        },
        statistics: {
            searchStatistics: basePath + '/autoAlert/statistics', // 查询告警数据列表
            resetStatistic: basePath + '/autoAlert/resetStatistic', // 清除、恢复告警数据
        },
        historyRecord: {
            historyRecord: basePath + '/autoAlert/historyRecords',
        },
        dimension: {
            dimensionTypeValues: basePath + '/autoAlert/dimensionTypeValues',
        },
    },

    /** 用户关键指标 */
    userKeyIndicatorAnalysis: {
        statistic: basePath + '/userKeyIndicatorAnalysis',
    },

    /** 话单检索 */
    xdrRetrieval: {
        getXdr: basePath + '/xdrRetrieval',
    },

    /**用户查询*/
    user: {
        accountNumberInfo: basePath + '/userConfig',
    },

    /**链路流量监控*/
    linkMonitoring: {
        link: basePath + '/link',
        flowMonitoringStatistics: basePath + '/FlowMonitorLink/statistic',
    },
};