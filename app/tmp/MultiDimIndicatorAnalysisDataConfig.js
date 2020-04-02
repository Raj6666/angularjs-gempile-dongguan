'use strict';

module.exports = {
    testOptions: [
        {
            id: 1,
            name: '限定ke户',
        }, {
            id: 2,
            name: '限定商家',
        }, {
            id: 3,
            name: '限定使用次数',
        }, {
            id: 4,
            name: '限定药品',
        }, {
            id: 5,
            name: '与其它优惠共享',
        }],
    intervalOptions: [
        // {
        //     id: 1,
        //     name: '5分钟',
        //     value: 5,
        // }, {
        //     id: 2,
        //     name: '小时',
        //     value: 60,
        // }, {
        //     id: 3,
        //     name: '天',
        //     value: 1440,
        // },
        {
            id: 1,
            name: '小时',
            value: 60,
        }, {
            id: 2,
            name: '天',
            value: 1440,
        },
    ],
    userTypesOptions: [
        {
            id: 0,
            name: '全网',
        }, {
            id: 3,
            name: '家宽',
        }, {
            id: 5,
            name: '专线',
        },
    ],
    dimensionsOptions: [
        {
            id: 1,
            name: '设备',
            parameter: 'device',
            dimensionPro: 'deviceName',
        }, {
            id: 2,
            name: '业务',
            parameter: 'app',
            dimensionPro: 'appName',
        }, {
            id: 3,
            name: 'ICP网站',
            parameter: 'icp',
            dimensionPro: 'website',
        }, {
            id: 4,
            name: '全维度',
            parameter: 'all',
            dimensionPro: 'allDimension',
        },
    ],
    deviceAppOptions: {
        familywide: [
            {
                id: 4,
                name: 'BRAS',
            }, {
                id: 3,
                name: 'BNG',
            }, {
                id: 1,
                name: 'OLT',
            }, {
                id: 5,
                name: 'ONU',
            },
        ],
        specialline: [
            // {
            //     id: 2,
            //     name: 'SR',
            // },
            {
                id: 3,
                name: 'BNG',
            }, {
                id: 1,
                name: 'OLT',
            }, {
                id: 5,
                name: 'ONU',
            },
        ],
        wholeNetwork: [
            {
                id: 4,
                name: 'BRAS',
            },
            // {
            //     id: 2,
            //     name: 'SR',
            // },
            {
                id: 3,
                name: 'BNG',
            }, {
                id: 1,
                name: 'OLT',
            }, {
                id: 5,
                name: 'ONU',
            },
        ],
    },
    appDimensionOptions: [],
    icpwebDimensionOptions: [],
    testChartDatas: {
        legendData: ['对象1', '对象1', '对象1', '对象1', '对象1', '对象1', '对象1', '对象1', '对象1', '对象1'],
        xAxisData: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
        yAxisData: ['100', '300', '400', '500', '600', '700', '800', '900', '1000', '1100', '1200'],
        seriesData: [
            {
                name: '邮件营销',
                type: 'line',
                stack: '总量',
                data: [120, 132, 101, 134, 90, 230, 210, 232, 201, 154, 190, 330],
            }, {
                name: '联盟广告',
                type: 'line',
                stack: '总量',
                data: [220, 182, 191, 234, 290, 330, 310, 65, 45, 345, 342, 222],
            }, {
                name: '视频广告',
                type: 'line',
                stack: '总量',
                data: [150, 232, 201, 154, 190, 330, 410, 234, 433, 223, 443, 345],
            }, {
                name: '直接访问',
                type: 'line',
                stack: '总量',
                data: [320, 332, 301, 334, 390, 330, 320, 143, 432, 123, 555, 233],
            }, {
                name: '搜索引擎',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 567, 234, 111, 975, 112],
            }, {
                name: '搜索引擎1',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 198, 234, 134, 443, 765],
            }, {
                name: '搜索引擎2',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 223, 4556, 12345, 1234, 345],
            }, {
                name: '搜索引擎3',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 1233, 111, 343, 2234, 6564],
            }, {
                name: '搜索引擎4',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 1221, 33, 1243, 1221, 1221],
            }, {
                name: '搜索引擎5',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 3333, 11233, 355, 2222, 543, 22, 1234],
            },
        ],
    },
    indicatorParent: {
        '19': '流量/流速类指标',
        '20': 'DNS类指标',
        '21': 'TCP类指标',
        '22': 'HTTP类指标',
        '23': 'Radius类指标',
    },
    echartThemeColor: ['#6104B4', '#00FC81', '#04FD04', '#FDF100', '#FC7F01', '#81FD04', '#FE0000', '#E62B8B', '#047FFC', '#F80B97', '#0908FA', '#FE00FB', '#FA92CF', '#B47CE6'],

};