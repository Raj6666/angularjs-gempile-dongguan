'use strict';

module.exports = {
    intervalOptions: [
        {
            id: 1,
            name: '1分钟',
            value: 1,
        },
        // {
        //     id: 2,
        //     name: '15分钟',
        //     value: 15,
        // },
        {
            id: 3,
            name: '小时',
            value: 60,
        }, {
            id: 4,
            name: '天',
            value: 1440,
        },
    ],
    linkState: [
        {
            id: 0,
            name: '已采集',
        }, {
            id: 1,
            name: '已过滤',
        },
    ],
    indicatorType: [
        {
            id: 0,
            name: '流量',
        }, {
            id: 1,
            name: '流速',
        },
    ],
    indicators: [
        {
            id: 0,
            name: '上行流量',
            paramer: 'ul_data',
            type: 0,
        }, {
            id: 1,
            name: '下行流量',
            paramer: 'dl_data',
            type: 0,
        }, {
            id: 2,
            name: '总流量',
            paramer: 'total_dlul_data',
            type: 0,
        }, {
            id: 3,
            name: '上行流速',
            paramer: 'ul_speed',
            type: 1,
        }, {
            id: 4,
            name: '下行流速',
            paramer: 'dl_speed',
            type: 1,
        }, {
            id: 5,
            name: '总流速',
            paramer: 'total_dlul_speed',
            type: 1,
        },
    ],
    wholeNetworkColumns: [
        {
            displayName: '时间',
            name: 'statisticalTime',
            width: 150,
        }, {
            displayName: '链路名称',
            name: 'link',
            // width: 100,
        }, {
            displayName: '流量',
            name: 'totalDlulData',
        }, {
            displayName: '采集流量',
            name: 'ulData',
            // width: 100,
        }, {
            displayName: '过滤流量',
            name: 'dlData',
            // width: 100,
        }, {
            displayName: '流速',
            name: 'totalDlulSpeed',
            // width: 100,
        }, {
            displayName: '采集流速',
            name: 'ulSpeed',
            // width: 100,
        }, {
            displayName: '过滤流速',
            name: 'dlSpeed',
            // width: 100,
        },
    ],
    ordinaryColumns: [
        {
            displayName: '时间',
            name: 'statisticalTime',
            width: 150,
        }, {
            displayName: '链路名称',
            name: 'link',
            // width: 100,
        }, {
            displayName: '流量',
            name: 'totalDlulData',
        }, {
            displayName: '流速',
            name: 'totalDlulSpeed',
            // width: 100,
        }, {
            displayName: '链路状态',
            name: 'linkStatus',
        },
    ],
    wholeNetworkChartSeries: {
        seriesTD: {
            type: 'line',
            name: '流量',
            lineStyle: {
                normal: {
                    width: 1,
                    // color: '#FE0000',
                    type: 'solid',
                    shadowBlur: 5,
                },
            },
            data: [],
        },
        seriesUD: {
            type: 'line',
            name: '采集流量',
            lineStyle: {
                normal: {
                    width: 1,
                    // color:'#B47CE6',
                    type: 'solid',
                    shadowBlur: 5,
                },
            },
            data: [],
        },
        seriesDD: {
            type: 'line',
            name: '过滤流量',
            lineStyle: {
                normal: {
                    width: 1,
                    // color: '#FC7F01',
                    type: 'solid',
                    shadowBlur: 5,
                },
            },
            data: [],
        },
        seriesTS: {
            type: 'line',
            name: '流速',
            lineStyle: {
                normal: {
                    width: 1,
                    // color: '#FE0000',
                    type: 'solid',
                    shadowBlur: 5,
                },
            },
            data: [],
        },
        seriesUS: {
            type: 'line',
            name: '采集流速',
            lineStyle: {
                normal: {
                    width: 1,
                    // color:'#B47CE6',
                    type: 'solid',
                    shadowBlur: 5,
                },
            },
            data: [],
        },
        seriesDS: {
            type: 'line',
            name: '过滤流速',
            lineStyle: {
                normal: {
                    width: 1,
                    // color: '#FC7F01',
                    type: 'solid',
                    shadowBlur: 5,
                },
            },
            data: [],
        },
    },
    ordinaryChartSeries: {
        seriesTD: {
            type: 'line',
            name: '流量',
            lineStyle: {
                normal: {
                    width: 1,
                    // color: '#FE0000',
                    type: 'solid',
                    shadowBlur: 5,
                },
            },
            data: [],
        },
        seriesTS: {
            type: 'line',
            name: '流速',
            lineStyle: {
                normal: {
                    width: 1,
                    // color: '#FE0000',
                    type: 'solid',
                    shadowBlur: 5,
                },
            },
            data: [],
        },
    },
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
            },
            {
                name: '联盟广告',
                type: 'line',
                stack: '总量',
                data: [220, 182, 191, 234, 290, 330, 310, 65, 45, 345, 342, 222],
            },
            {
                name: '视频广告',
                type: 'line',
                stack: '总量',
                data: [150, 232, 201, 154, 190, 330, 410, 234, 433, 223, 443, 345],
            },
            {
                name: '直接访问',
                type: 'line',
                stack: '总量',
                data: [320, 332, 301, 334, 390, 330, 320, 143, 432, 123, 555, 233],
            },
            {
                name: '搜索引擎',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 567, 234, 111, 975, 112],
            },
            {
                name: '搜索引擎1',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 198, 234, 134, 443, 765],
            },
            {
                name: '搜索引擎2',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 223, 4556, 12345, 1234, 345],
            },
            {
                name: '搜索引擎3',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 1233, 111, 343, 2234, 6564],
            },
            {
                name: '搜索引擎4',
                type: 'line',
                stack: '总量',
                data: [820, 932, 901, 934, 1290, 1330, 1320, 1221, 33, 1243, 1221, 1221],
            },
            {
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
    echartThemeColor: ['#FE0000', '#FC7F01', '#B47CE6', '#6104B4', '#00FC81', '#04FD04', '#FDF100', '#81FD04', '#E62B8B', '#047FFC', '#F80B97', '#0908FA', '#FE00FB', '#FA92CF', '#B47CE6'],

};