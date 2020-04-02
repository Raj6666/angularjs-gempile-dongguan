'use strict';

module.exports = {
    queryToolData: {
        interval: {
            options: [
                {
                    id: 1,
                    name: '15分钟',
                    value: 15,
                }, {
                    id: 2,
                    name: '小时',
                    value: 60,
                }, {
                    id: 3,
                    name: '天',
                    value: 1440,
                },
            ],
            model: [
                {
                    id: 2,
                    name: '小时',
                    value: 60,
                },
            ],
        },
        userTypes: {
            options: [
                // {id: 0, name: '全网'},
                {
                    id: 3,
                    name: '家宽',
                },
                // {id: 5, name: "专线"},
            ],
            model: [{
                id: 3,
                name: '家宽',
            }],
        },
        city: {
            options: [
                {
                    id: 1,
                    name: '东莞市',
                    value: '441900',
                },
            ],
            model: [
                {
                    id: 1,
                    name: '东莞市',
                    value: '441900',
                },
            ],
        },
    },
    ChartDatas: {
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
    echartThemeColor: ['#6104B4', '#00FC81', '#04FD04', '#FDF100', '#FC7F01', '#81FD04', '#FE0000', '#E62B8B', '#047FFC', '#F80B97', '#0908FA', '#FE00FB', '#FA92CF', '#B47CE6'],
    grid: {
        columns: [
            {
                displayName: '时间',
                name: 'statisticalTime',
                width: 150,
            }, {
                displayName: '地市',
                name: 'city',
                width: 150,
            }, {
                displayName: '用户类型',
                name: 'userType',
                width: 150,
            }, {
                displayName: '区县',
                name: 'area',
                width: 150,
            }, {
                displayName: '镇区',
                name: 'community',
                width: 150,
            }, {
                displayName: '用户账号',
                name: 'accountNumber',
                width: 150,
            }, {
                displayName: '拨号次数(次)',
                name: 'radiusDialingTotalCount',
                width: 150,
            }, {
                displayName: '用户宽带(Byte)',
                name: 'bandwidth',
                width: 150,
            }, {
                displayName: '拨号时延(ms)',
                name: 'radiusDialingDelay',
                width: 150,
            }, {
                displayName: '拨号成功次数(次)',
                name: 'radiusDialingSuccessCount',
                width: 150,
            }, {
                displayName: '拨号成功率(%)',
                name: 'radiusDialingSuccessRatio',
                width: 150,
            }, {
                displayName: '拨号失败次数(次)',
                name: 'radiusDialingFailCount',
                width: 150,
            },
        ],
    },
};