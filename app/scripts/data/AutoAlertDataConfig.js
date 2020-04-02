'use strict';

export const autoAlertDataConfig = {
    interface: [
        {
            id: 1,
            name: '全网',
            value: 'whole_network',
        }, {
            id: 2,
            name: '设备',
            value: 'device',
        }, {
            id: 3,
            name: '业务',
            value: 'application',
        }, {
            id: 4,
            name: 'ICP告警',
            value: 'icp',
        },
    ],
    dimension: {
        whole_network: [
            {
                id: 1,
                value: 'whole_network',
                name: '全网',
                group: 'whole_network',
            },
        ],
        device: [
            {
                id: 1,
                value: 'BRAS',
                name: 'BRAS',
                group: 'device',
            }, {
                id: 2,
                value: 'SR',
                name: 'SR',
                group: 'device',
            },
            {
                id: 3,
                value: 'BNG',
                name: 'BNG',
                group: 'device',
            },
            {
                id: 4,
                value: 'OLT',
                name: 'OLT',
                group: 'device',
            },
            {
                id: 5,
                value: 'ONU',
                name: 'ONU',
                group: 'device',
            },
            {
                id: 6,
                value: 'SW',
                name: 'SW',
                group: 'device',
            },
        ],
        application: [
            {
                id: 1,
                value: 'app_type',
                name: '业务大类',
                group: 'application',
            }, {
                id: 2,
                value: 'app_sub_type',
                name: '业务小类',
                group: 'application',
            },
        ],
        icp: [
            {
                id: 1,
                value: 'website_type',
                name: '网站归属',
                group: 'icp',
            }, {
                id: 2,
                value: 'website_id',
                name: 'ICP域名',
                group: 'icp',
            },
        ],
    },
    dimensionByGroup: {
        whole_network: ['whole_network'],
        device: ['BRAS', 'SR', 'BNG', 'OLT', 'ONU','SW'],
        application: ['app_type', 'app_sub_type'],
        icp: ['website_type', 'website_id'],
    },
    groupByDimension: {
        whole_network: 'whole_network',
        BRAS: 'device',
        SR: 'device',
        BNG: 'device',
        OLT: 'device',
        ONU: 'device',
        SW: 'device',
        app_type: 'application',
        app_sub_type: 'application',
        website_type: 'icp',
        website_id: 'icp',
    },
    dimensionNameByValue: {
        whole_network: '全网',
        BRAS: 'BRAS',
        SR: 'SR',
        BNG: 'BNG',
        OLT: 'OLT',
        ONU: 'ONU',
        SW: 'SW',
        app_type: '业务大类',
        app_sub_type: '业务小类',
        website_type: '网站归属',
        website_id: 'ICP域名',
    },
    /**告警规则grid 列头*/
    rulesGridDefs : [
        {
            displayName: '告警规则名称',
            name: 'ruleName',
        },
        {
            displayName: '告警阈值',
            name: 'alertRules',
        },
        {
            displayName: '对象',
            name: 'dimensionName',
        },
        {
            displayName: '指标',
            name: 'indicatorName',
        },
        {
            displayName: '时间粒度',
            name: 'interval',
        },
        {
            displayName: '修改时间',
            name: 'modifiedTime',
        },
        {
            displayName: '操作',
            name: 'operator',
        },
    ],
    /**告警记录grid 列头*/
    alertStaticticsGridDefs : [
        {
            displayName: '告警名称',
            name: 'ruleName',
        },
        {
            displayName: '首次告警时间',
            name: 'firstTriggeredTime',
        },
        {
            displayName: '最新告警时间',
            name: 'latestTriggeredTime',
        },
        {
            displayName: '最新告警值',
            name: 'latestAutoAlertValue',
        },
        {
            displayName: '指标',
            name: 'indicatorName',
        },
        {
            displayName: '维度',
            name: 'dimension',
        },
        {
            displayName: '具体对象',
            name: 'dimensionType',
        },
        {
            displayName: '触发次数',
            name: 'triggeredCount',
        },
        {
            displayName: '最新告警级别',
            name: 'alertLevel',
        },
        {
            displayName: '时间粒度',
            name: 'interval',
        },
        {
            displayName: '操作',
            name: 'operator',
        },
    ],
};