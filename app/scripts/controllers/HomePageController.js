'use strict';

import APIS from '../configs/ApisConfig';
import {NOW, ONE_DAY_MS, ONE_HOUR_MS} from '../constants/CommonConst';

/**
 * HomePage Controller
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function HomePageController($scope, $filter, HttpRequestService) {
    /** 统计时间，早上5点更新，显示前一天数据 */
    const analysisTime = NOW - ((NOW + (ONE_HOUR_MS * 8) - (ONE_HOUR_MS * 5)) % ONE_DAY_MS) - ONE_DAY_MS - (ONE_HOUR_MS * 5);
    $scope.currentDayTime = $filter('date')(analysisTime, 'yyyy-MM-dd');
    $scope.currentStatisticalTime = '统计时间： ' + $scope.currentDayTime;

    /**全网指标*/
    $scope.totalUsercount = '';
    $scope.totalFlow = '';
    $scope.totalClick = '';

    /**左上角业务大类按流量排名条形图 */
    $scope.ipLenHotAppTypeChart = {
        chartdata: {
            chart: {
                type: 'bar',
            },
            title: {
                text: '',
            },
            xAxis: {
                gridLineWidth: 0,//设置为0，隐藏x轴网格线
                lineColor: '#000',
                tickColor: '#000',
                labels: {
                    enabled: false,
                    rotation: -45,
                    align: 'right',
                    style: {
                        fontFamily: '黑体',
                        fontWeight: 'Bold',
                    },
                },
                categories: [],
                visible: false,//隐藏X轴
            },
            yAxis: {
                gridLineWidth: 1,//设置为0，隐藏Y轴网格线
                lineColor: 'rgb(230,230,230)',
                lineWidth: 1,
                tickWidth: 0,
                tickColor: '#ccc',
                title: {
                    text: '',
                },
                labels: {
                    rotation: 0,
                    align: 'right',
                    style: {
                        fontFamily: '黑体',
                        fontWeight: 'Bold',
                    },
                },
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        allowOverlap: true,
                        overflow: 'none',
                        crop: false,
                        format: '<b style="font-size: 12px;font-weight: normal;color:{color}">{x}</b>',
                    },
                    colorByPoint: true,
                },
            },
            legend: {
                enabled: false,
            },
            tooltip: {
                pointFormatter: function () {
                    return '<b>' + this.y + '(TB)</b>';
                },
            },
            exporting: {
                enabled: false,
            },
            credits: {
                enabled: false,
            },
            series: [
                {
                    name: '业务大类流量',
                    data: [],
                    colors: ['rgb(58,216,227)', 'rgb(59,192,225)', 'rgb(62,169,223)', 'rgb(76,144,204)', 'rgb(65,126,217)',
                        'rgb(68,106,215)', 'rgb(92,106,191)', 'rgb(74,74,182)', 'rgb(90,72,208)', 'rgb(109,73,205)'],
                    borderRadiusTopLeft: 5,
                    borderRadiusTopRight: 5,
                    borderRadiusBottomLeft: 5,
                    borderRadiusBottomRight: 5,
                },
            ],
        },
        obj: {},
        height: (document.body.scrollHeight - 210) / 2,
        resize: () => {
            let height = (document.body.scrollHeight - 210) / 2;
            $('#ipLenHotAppTypeChart').find('.hchart').height(height);
            $scope.ipLenHotAppTypeChart.obj.setSize(null, height);
        },
    };

    /**左下角业务用户覆盖率蜘蛛图 */
    $scope.userHotAppTypeChart = {
        chartdata: {
            chart: {
                polar: true,
                type: 'line',//spline,line
            },
            title: {
                text: '',//TOP5应用覆盖率(%)
                x: -80,
            },
            pane: {
                size: '80%',
            },
            xAxis: {
                categories: [],
                tickmarkPlacement: 'on',
                gridLineColor: '#ccc',
                lineWidth: 0,
                labels: {
                    style: {
                        fontFamily: '黑体',
                        fontSize: 12,
                        fontWeight: 'normal',
                    },
                    format: '<b style="font-size: 12px;color:#000">{value}</b>',
                },
            },
            yAxis: {
                gridLineInterpolation: 'circle',//circle,polygon
                gridLineColor: '#bbb',
                lineWidth: 0,
                min: 0,
            },
            tooltip: {
                pointFormatter: function () {
                    return '<b>' + this.y + '%</b>';
                },
            },
            legend: {
                enabled: false,
                align: 'right',
                verticalAlign: 'top',
                y: 70,
                layout: 'vertical',
            },
            series: [{
                name: 'TOP5应用',
                data: [],
                pointPlacement: 'on',
            },
            ],
            credits: {
                enabled: false,
            },
        },
        obj: {},
        height: (document.body.scrollHeight - 210) / 2,
        resize: () => {
            let height = (document.body.scrollHeight - 210) / 2;
            $('#userHotAppTypeChart').find('.hchart').height(height);
            $scope.userHotAppTypeChart.obj.setSize(null, height);
        },
    };

    /**TOP5应用按人数排名*/
    const getTOP5AppCoverRate = time => {
        const url = APIS.index.TOP5ApplicationCoverRate;
        let param = {
            statisticalTime: time,
            dataSize: 5,
        };
        HttpRequestService.get(url, param, response => {
            let categories = [], data = [];
            response.map(item => {
                categories.push(item.detailBusiness);
                data.push(Number((item.coverRate * 100).toFixed(2)));
            });
            $scope.userHotAppTypeChart.chartdata.xAxis.categories = categories;
            $scope.userHotAppTypeChart.chartdata.series[0].data = data;
        })
    };

    /** 业务大类按流量排名 */
    const getAppTypeRank = time => {
        const url = APIS.index.applicationTypeStatistics;
        let param = {
            statisticalTime: time,
            dataSize: 10,
        };
        HttpRequestService.get(url, param, response => {
            let categories = [], data = [];
            let maxStatisticValue = 0, maxProportion = 0;
            response.map(item => {
                let thisStatistic = Math.floor((item.yesterdayFlowSum / 1024) * 100) / 100;
                categories.push(item.businessType);
                data.push(thisStatistic);
                maxStatisticValue = maxStatisticValue > thisStatistic ? maxStatisticValue : thisStatistic;
            });
            response.map(item => {
                let wordLength = item.businessType.length;
                let thisStatistic = Math.floor((item.yesterdayFlowSum / 1024) * 100) / 100;
                let thisProportion = (thisStatistic / maxStatisticValue) + (wordLength * 0.05);
                maxProportion = thisProportion > maxProportion ? thisProportion : maxProportion;
            });
            $scope.ipLenHotAppTypeChart.chartdata.xAxis.categories = categories;
            $scope.ipLenHotAppTypeChart.chartdata.series[0].data = data;
            $scope.ipLenHotAppTypeChart.chartdata.yAxis.max = maxStatisticValue * maxProportion;
        });
    };

    /** 自有业务按流量排名 */
    const getPrivateSubAppRank = time => {
        const url = APIS.index.ownApplicationStatistics;
        let param = {
            statisticalTime: time,
            dataSize: 10,
        };
        HttpRequestService.get(url, param, response => {
            let categories = [], data = [];
            let maxStatisticValue = 0, maxProportion = 0;
            response.map(item => {
                categories.push(item.detailBusiness);
                data.push(item.yesterdayFlowSum);
                maxStatisticValue = maxStatisticValue > item.yesterdayFlowSum ? maxStatisticValue : item.yesterdayFlowSum;
            });
            response.map(item => {
                let wordLength = item.detailBusiness.length;
                let thisProportion = (item.yesterdayFlowSum / maxStatisticValue) + (wordLength * 0.05);
                maxProportion = thisProportion > maxProportion ? thisProportion : maxProportion;
            });
            $scope.privateSubAppRankChart.chartdata.xAxis.categories = categories;
            $scope.privateSubAppRankChart.chartdata.series[0].data = data;
            $scope.privateSubAppRankChart.chartdata.yAxis.max = maxStatisticValue * maxProportion;
        });
    };

    /** 自有业务按流量上涨名次排名 */
    const getPrivateSubAppRankChange = time => {
        const url = APIS.index.ownAppRankChang;
        let condition = {
            statisticalTime: time,
            dataSize: 10,
        };
        HttpRequestService.get(url, condition, response => {
            let categories = [], data = [];
            response.map(item => {
                categories.push(item.detailBusiness);
                data.push(item.changeRank);
            });
            $scope.privateSubAppRankChangeChart.chartdata.xAxis.categories = categories;
            $scope.privateSubAppRankChangeChart.chartdata.series[0].data = data;
        });
    };

    /** 行政区网络概览表格 */
    $scope.wholeNetworkGrid = {
        griddata: {
            colnames: ['行政区', '用户数(万人)', '流量(GB)', '点击量(万次)'],
            colmodel: [
                {
                    name: 'district',
                    index: 'district',
                    sortable: false,
                    align: 'center',
                }, {
                    name: 'subscriberCount',
                    index: 'subscriberCount',
                    sortable: false,
                    align: 'center',
                }, {
                    name: 'flowCount',
                    index: 'flowCount',
                    sortable: false,
                    align: 'center',
                }, {
                    name: 'sessionCount',
                    index: 'sessionCount',
                    sortable: false,
                    align: 'center',
                },
            ],
            data: [],
        },
        obj: {},
        caption: '',
        shrinkToFit: true,
        padding: 5,
        showBorder: false,
        gridresize(grid) {
            grid.setGridWidth($('#middlePanel').width());
            grid.setGridHeight(170);
        },
    };

    /** 行政区网络概览图表 */
    $scope.wholeNetworkChart = {
        chartdata: {
            chart: {
                type: 'column',
            },
            title: {
                text: '',//佛山业务分时流量统计
            },
            legend: {
                enabled: false,
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0,
            },
            xAxis: {
                gridLineWidth: 0,//设置为0，隐藏x轴网格线
                lineColor: 'rgb(62,214,225)',//轴线颜色
                lineWidth: 1.5,
                tickColor: '#000',
                tickWidth: 0,
                labels: {
                    rotation: 0,
                    align: 'center',
                    style: {
                        fontFamily: '黑体',
                        fontWeight: 'Bold',
                    },
                },
                dateTimeLabelFormats: {
                    day: '%H',
                    hour: '%H',
                },
                categories: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
            },
            yAxis: {
                title: {
                    text: '',
                    style: {
                        color: '#4572A7',
                    },
                },
                labels: {
                    format: '{value}(TB)',
                    style: {
                        color: '#4572A7',
                    },
                    enabled: false,//不显示Y轴坐标
                },
                gridLineWidth: 0,//设置为0，隐藏Y轴网格线
                min: 0,
                tickPixelInterval: 1,
            },
            plotOptions: {
                column: {
                    colorByPoint: false,
                },
            },
            tooltip: {
                shared: true,
                dateTimeLabelFormats: {
                    day: '%H:%M',
                    hour: '%H:%M',
                },
            },
            series: [
                {
                    name: '全网流量',
                    color: '#4572A7',
                    type: 'column',
                    yAxis: 0,
                    data: [],
                    tooltip: {
                        valueSuffix: '(TB)',
                    },
                    borderRadiusTopLeft: 5,
                    borderRadiusTopRight: 5,
                    borderRadiusBottomLeft: 5,
                    borderRadiusBottomRight: 5,
                },
            ],
            exporting: {
                enabled: false,
            },
            credits: {
                enabled: false,
            },
        },
        obj: {},
        height: document.body.scrollHeight - 460,
        resize: () => {
            let height = document.body.scrollHeight - 460;
            $('#wholeNetworkChart').find('.hchart').height(height);
            $scope.wholeNetworkChart.obj.setSize(null, height);
        },
    };

    /** 行政区网络概览表格 */
    const getDistrictAnalysis = time => {
        const url = APIS.index.httpDistrictStatistics;
        let param = {
            statisticalTime: time,
            district: 'all',
        };
        HttpRequestService.get(url, param, response => {
            let gridData = [];
            response.map(statistic => {
                if (statistic.district != '全网') {
                    gridData.push(statistic);
                }
            });
            $scope.wholeNetworkGrid.griddata.data = gridData;
        });
    };

    /** 网络概览分时流量统计 */
    const getWholeHourFlowAnalysis = time => {
        const url = APIS.index.wholeNetwork1hKpi;
        let param = {
            statisticalTime: time,
        };
        HttpRequestService.get(url, param, response => {
            let ipLen = [];
            let data = [];
            response.map(row => {
                let item = [];
                let dateTime = new Date(row.statisticalTime);
                let year = dateTime.getFullYear();
                let month = dateTime.getMonth();
                let day = dateTime.getDate();
                let hour = dateTime.getHours();
                let minute = dateTime.getMinutes();
                let second = dateTime.getSeconds();
                item.push(Date.UTC(year, month, day, hour, minute, second));
                item.push(row.flowCount);
                ipLen.push(parseFloat((row.flowCount / 1024).toFixed(2)));
                data.push(item);
            });
            $scope.wholeNetworkChart.chartdata.series[0].data = ipLen;
        });
    };

    /** 行政区网络概览 只查询whole_network*/
    const getWholeDistrictAnalysis = time => {
        const url = APIS.index.httpDistrictStatistics;
        let param = {
            statisticalTime: time,
            district: 'whole_network',
        };
        HttpRequestService.get(url, param, response => {
            if (response.length > 0) {
                $scope.totalUsercount = response[0].subscriberCount;
                $scope.totalFlow = Math.floor((response[0].flowCount / 1024) * 100) / 100;
                $scope.totalClick = response[0].sessionCount;
            }
        });
    };

    /**右上角自有业务TOP10排名条形图*/
    $scope.privateSubAppRankChart = {
        chartdata: {
            chart: {
                type: 'bar',
            },
            title: {
                text: '',
            },
            xAxis: {
                gridLineWidth: 0,
                lineColor: '#000',
                tickColor: '#000',
                labels: {
                    rotation: -45,
                    align: 'right',
                    style: {
                        fontFamily: '黑体',
                        fontWeight: 'Bold',
                    },
                    enabled: false,
                },
                categories: [],
                visible: false,//隐藏X轴
            },
            yAxis: {
                gridLineWidth: 1,//设置为0，隐藏Y轴网格线
                lineColor: 'rgb(230,230,230)',
                lineWidth: 1,
                tickWidth: 0,
                tickColor: '#ccc',
                title: {
                    text: '',
                },
                labels: {
                    rotation: 0,
                    align: 'center',
                    style: {
                        fontFamily: '黑体',
                        fontWeight: 'Bold',
                    },
                },
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        allowOverlap: true,
                        overflow: 'none',
                        crop: false,
                        format: '<b style="font-size: 12px;font-weight: normal;color:{color}">{x}</b>',
                    },
                    colorByPoint: true,
                },
            },
            tooltip: {
                pointFormatter: function () {
                    return '<b>' + this.y + '(GB)</b>';
                },
            },
            exporting: {
                enabled: false,
            },
            credits: {
                enabled: false,
            },
            series: [
                {
                    name: '自有业务流量',
                    data: [],
                    colors: ['rgb(58,216,227)', 'rgb(59,192,225)', 'rgb(62,169,223)', 'rgb(76,144,204)', 'rgb(65,126,217)',
                        'rgb(68,106,215)', 'rgb(92,106,191)', 'rgb(74,74,182)', 'rgb(90,72,208)', 'rgb(109,73,205)'],
                    borderRadiusTopLeft: 5,
                    borderRadiusTopRight: 5,
                    borderRadiusBottomLeft: 5,
                    borderRadiusBottomRight: 5,
                },
            ],
        },
        obj: {},
        height: (document.body.scrollHeight - 210) / 2,
        resize: () => {
            let height = (document.body.scrollHeight - 210) / 2;
            $('#privateSubAppRankChart').find('.hchart').height(height);
            $scope.privateSubAppRankChart.obj.setSize(null, height);
        },
    };

    /**右下角自有业务TOP10变化排名柱形图*/
    $scope.privateSubAppRankChangeChart = {
        chartdata: {
            chart: {
                type: 'column',
            },
            title: {
                text: '',
            },
            xAxis: {
                gridLineWidth: 0,
                lineColor: 'rgb(230,230,230)',
                tickColor: 'rgb(230,230,230)',
                labels: {
                    rotation: -45,
                    align: 'right',
                    y: 8,
                    style: {
                        fontFamily: '黑体',
                        fontSize: 12,
                        fontWeight: 'normal',
                    },
                    format: '<b style="font-size: 12px;color:#000000">{value}</b>',
                },
                categories: [],
            },
            yAxis: {
                allowDecimals: false,
                lineColor: 'rgb(230,230,230)',
                lineWidth: 1,
                tickWidth: 0,
                tickColor: '#000',
                title: {
                    text: '',
                },
            },
            plotOptions: {
                column: {
                    showCheckbox: false,
                    selected: true,
                    colorByPoint: true,
                },
            },
            tooltip: {
                pointFormatter: function () {
                    return '变化排名：<b>' + this.y + '名</b>';
                },
            },
            exporting: {
                enabled: false,
            },
            credits: {
                enabled: false,
            },
            series: [
                {
                    name: '自有业务排名变化',
                    data: [],
                    colors: ['rgb(0,231,221)', 'rgb(103,173,243)', 'rgb(103,173,243)', 'rgb(103,173,243)', 'rgb(103,173,243)', 'rgb(103,173,243)',
                        'rgb(103,173,243)', 'rgb(103,173,243)', 'rgb(103,173,243)', 'rgb(255,120,223)'],
                    borderRadiusTopLeft: 3,
                    borderRadiusTopRight: 3,
                    borderRadiusBottomLeft: 3,
                    borderRadiusBottomRight: 3,
                },
            ],
        },
        obj: {},
        height: (document.body.scrollHeight - 210) / 2,
        resize: () => {
            let height = (document.body.scrollHeight - 210) / 2;
            $('#privateSubAppRankChangeChart').find('.hchart').height(height);
            $scope.privateSubAppRankChangeChart.obj.setSize(null, height);
        },
    };

    /** 初始化加载Controller */
    const initController = () => {
        /** 行政区网络概览图表 */
        getDistrictAnalysis(analysisTime);
        /** 行政区网络--全网*/
        getWholeDistrictAnalysis(analysisTime);
        /**全网分时流量统计*/
        getWholeHourFlowAnalysis(analysisTime);
        /**自由业务排名变化*/
        getPrivateSubAppRankChange(analysisTime);
        /**业务大类按流量排名条形图*/
        getAppTypeRank(analysisTime);
        /**自有业务按流量排名*/
        getPrivateSubAppRank(analysisTime);
        /**TOP5应用按人数排名*/
        getTOP5AppCoverRate(analysisTime);
    };
    initController();
}
HomePageController.$inject = ['$scope', '$filter', 'HttpRequestService'];