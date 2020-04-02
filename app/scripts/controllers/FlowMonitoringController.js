'use strict';
import swal from 'sweetalert2';
import APIS from '../configs/ApisConfig';
import Loading from '../custom-pulgin/Loading';
import echarts from 'echarts';
import DefaultData from '../data/FlowMonitoringDataConfig';

/**
 * Flow Monitoring Controller
 *
 * @ngInject
 * @constructor
 * @param $scope
 * @param $state
 * @param $filter
 * @param HttpRequestService
 */
export default function FlowMonitoringController($scope, $state, $filter, HttpRequestService) {
    /**点击下拉箭头*/
    $scope.showSearchPanel = true;
    $scope.togglePanel = () => {
        $scope.showSearchPanel = !$scope.showSearchPanel;
        $('#query-panel-body').slideToggle('normal');
    };
    /**更新时间*/
    $scope.upDateDate = (timeSlots, isWarning) => {
        $scope.timeSlots = timeSlots;
        $scope.isWarning = isWarning;
    };
    /**是否已查询**/
    $scope.isSearched = false;
    /**查询栏下拉框参数设置*/
    $scope.queryTool = {
        interval: {
            settings: {
                scrollableHeight: '90px',
                showCheckAll: false,
                showUncheckAll: false,
                scrollable: true,
                selectionLimit: 1,
                idProperty: 'id',
                displayProp: 'name',
                searchField: 'name',
                closeOnSelect: true,
                buttonClasses: 'btn btn-default select-width-140',
                smartButtonTextProvider(selectionArray) {
                    return selectionArray[0].name;
                },
            },
            options: DefaultData.intervalOptions,
            model: [
                {
                    id: 3,
                    name: '小时',
                    value: 60,
                },
            ],
            events: {
                onItemDeselect: () => {
                    $scope.queryTool.interval.model = [
                        {
                            id: 3,
                            name: '小时',
                            value: 60,
                        },
                    ];//时间粒度
                    $scope.interval = '60';
                },
                onItemSelect: item => {
                    $scope.interval = item.value + '';
                },
            },
        },
        linkState: {
            settings: {
                showCheckAll: false,
                showUncheckAll: false,
                scrollableHeight: '70px',
                scrollable: true,
                selectionLimit: 1,
                idProperty: 'id',
                displayProp: 'name',
                closeOnSelect: true,
                buttonClasses: 'btn btn-default select-width-140',
                smartButtonTextProvider(selectionArray) {
                    return selectionArray[0].name;
                },
            },
            options: DefaultData.linkState,
            model: [
                {
                    id: 0,
                    name: '已采集',
                },
            ],
            events: {
                onItemSelect: () => {
                    getData.getLink();
                },
                onItemDeselect: () => {
                    $scope.queryTool.linkState.model = [
                        {
                            id: 0,
                            name: '已采集',
                        },
                    ];
                    getData.getLink();
                    //用户点击选择或取消链路状态时，重置链路名称选择
                    // $scope.queryTool.linkName.model = $scope.queryTool.linkName.options[0];
                },
            },
        },
        linkName: {
            settings: {
                scrollableHeight: '230px',
                showCheckAll: false,
                showUncheckAll: false,
                scrollable: true,
                enableSearch: true,
                selectionLimit: 1,
                idProperty: 'id',
                displayProp: 'name',
                searchField: 'name',
                closeOnSelect: true,
                buttonClasses: 'btn btn-default select-width-140',
                smartButtonTextProvider(selectionArray) {
                    return selectionArray[0].name;
                },
            },
            options: [],
            model: [],
            events: {},
            IsWarning: {
                isSearched: false,
                isWarned: false,
            },
        },
        indicatorType: {
            settings: {
                scrollableHeight: '60px',
                showCheckAll: false,
                showUncheckAll: false,
                scrollable: true,
                selectionLimit: 1,
                idProperty: 'id',
                displayProp: 'name',
                closeOnSelect: true,
                alignRight: true,
                buttonClasses: 'btn btn-default select-width-140',
                smartButtonTextProvider(selectionArray) {
                    return selectionArray[0].name;
                },
            },
            options: DefaultData.indicatorType,
            model: [
                {
                    id: 0,
                    name: '流量',
                },
            ],
            events: {
                onItemSelect: () => {
                    if($scope.isSearched){
                        updateChartSeries();
                    }

                },
                onItemDeselect: () => {
                    $scope.queryTool.indicatorType.model = [
                        {
                            id: 0,
                            name: '流量',
                        },
                    ];
                    if($scope.isSearched){
                        updateChartSeries();
                    }
                },
            },
        },
        selectorText: {
            checkAll: '选择全部',
            uncheckAll: '取消全部',
            buttonDefaultText: '请选择',
            dynamicButtonTextSuffix: '个选择',
            searchPlaceholder: '搜索',
        },
    };

    /**窗口大小改变*/
    window.onresize = () => {
        flowMonitoringChart.resize();
    };

    /**查询栏数据请求集合*/
    const getData = {
        //获取链路列表
        getLink: () => {
            let url = APIS.linkMonitoring.link;
            let params = {
                status: $scope.queryTool.linkState.model[0].id,
            };
            HttpRequestService.get(url, params, reponse => {
                let wholeNetworkName = $scope.queryTool.linkState.model[0].id == 0 ? '0.0.0.0:0/0/0' : '0.0.0.0:0/0/1';
                let linkOfAll = null;
                let links = reponse.entities.filter(item => {
                    let isSpecial = item.link === wholeNetworkName;
                    isSpecial && (linkOfAll = item);
                    return !isSpecial;
                });
                links.unshift(linkOfAll);
                $scope.queryTool.linkName.options = links;
                //用户点击选择或取消链路状态时，重置链路名称选择
                $scope.queryTool.linkName.model = [];
            });
        },
    };
    /**初始化echart*/
    $('#flowMonitoringChart').css('height', $('#showChartGroup').height() * 0.9);
    let flowMonitoringChart = echarts.init(document.getElementById('flowMonitoringChart'), 'macarons');
    let flowMonitoringChartOptions = {
        title: {
            text: '',
        },
        tooltip: {
            trigger: 'axis',
            formatter(message) {
                let time = message[0].axisValue;
                let str = time;
                message.forEach(item => {
                    str += '<br />' + item.marker + item.seriesName + ':' + item.value + 'GB';
                });
                return str;
            },
        },
        legend: {
            formatter(name) {
                return name;
            },
            data: ['流量'],
        },
        color: DefaultData.echartThemeColor,
        grid: {
            left: '3%',
            right: '4%',
            top: '16%',
            bottom: '10%',
            containLabel: true,
        },
        dataZoom: [
            {
                show: true,
                type: 'slider',
                start: 30,
                end: 100,
                height: 15,
                bottom: 0,
            },
        ],
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
        },
        yAxis: {
            type: 'value',
        },
        series: [],

    };
    const initCharts = () => {
        flowMonitoringChart.setOption(flowMonitoringChartOptions);
        flowMonitoringChart.resize();
    };

    /**初始化表格控件*/
    const initDIAGrid = () => {
        $scope.FMGridOption = {
            enableGridMenu: true,
            enablePaginationControls: true,
            useExternalPagination: false,
            paginationPageSizes: [10, 30, 50],
            paginationPageSize: 10,
            paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
            cellTooltip: true,
            exporterCsvFilename: '设备维度查询数据表.csv',
            exporterOlderExcelCompatibility: true,
            columnDefs: DefaultData.ordinaryColumns,
        };
        $scope.FMGridOption.useExternalSorting = false;
        $scope.FMGridOption.onRegisterApi = function (gridApi) {
            $scope.DIAGridGridApi = gridApi;
        };
    };

    /**填充数据到echart图*/
    let echartSeries = {};
    const setDataForChart = data => {

        echartSeries = DefaultData.wholeNetworkChartSeries;
        echartSeries.seriesTD.data = [];
        echartSeries.seriesUD.data = [];
        echartSeries.seriesDD.data = [];
        echartSeries.seriesTS.data = [];
        echartSeries.seriesUS.data = [];
        echartSeries.seriesDS.data = [];
        let xAxisData = [];
        data.map(record => {
            if (xAxisData.indexOf($filter('date')(record.statisticalTime, 'MM-dd HH:mm')) === -1) {
                xAxisData.push($filter('date')(record.statisticalTime, 'MM-dd HH:mm'));
            }
            echartSeries.seriesTD.data.push(Math.round(record.totalDlulData * 100) / 100);
            echartSeries.seriesTS.data.push(Math.round(record.totalDlulSpeed * 100) / 100);
        });
        flowMonitoringChartOptions.xAxis.data = xAxisData;

        updateChartSeries();
    };
    /**切换流量流速*/
    const updateChartSeries = () => {
        let legendData = [];
        flowMonitoringChartOptions.series = [];
        if ($scope.queryTool.indicatorType.model[0].id === 0) {
            // if($scope.queryTool.linkName.model[0].name == '全网'){
            //     legendData = ['流量', '采集流量', '过滤流量'];
            //     flowMonitoringChartOptions.series.push(echartSeries.seriesTD);
            //     flowMonitoringChartOptions.series.push(echartSeries.seriesUD);
            //     flowMonitoringChartOptions.series.push(echartSeries.seriesDD);
            // }else{
            //     legendData = ['流量'];
            //     flowMonitoringChartOptions.series.push(echartSeries.seriesTD);
            // }
            legendData = ['流量'];
            flowMonitoringChartOptions.series.push(echartSeries.seriesTD);
            // }else if($scope.queryTool.linkName.model[0].name == '全网'){
            //         legendData = ['流速', '采集流速', '过滤流速'];
            //         flowMonitoringChartOptions.series.push(echartSeries.seriesTS);
            //         flowMonitoringChartOptions.series.push(echartSeries.seriesUS);
            //         flowMonitoringChartOptions.series.push(echartSeries.seriesDS);
            }else{
                legendData = ['流速'];
                flowMonitoringChartOptions.series.push(echartSeries.seriesTS);
            }
        flowMonitoringChartOptions.legend.data = legendData;
        flowMonitoringChart.setOption(flowMonitoringChartOptions,true);
        Loading.hideLoading('#flowMonitoringChart');
    };

    /**填充数据到grid表*/
    const setDataForGrid = data => {
        $scope.FMGridOption.data = [];
        $scope.FMGridOption.columnDefs = DefaultData.ordinaryColumns;
        // if($scope.queryTool.linkName.model[0].name == '全网'){
        //     $scope.FMGridOption.columnDefs = DefaultData.wholeNetworkColumns;
        // }else{
        //     $scope.FMGridOption.columnDefs = DefaultData.ordinaryColumns;
        // }
        data.map(rowData => {
            rowData.statisticalTime = $filter('date')(rowData.statisticalTime, 'yyyy/MM/dd HH:mm');

            for (let key in rowData) {
                if (typeof rowData[key] === 'number') {
                    rowData[key] = Math.round(rowData[key] * 100) / 100;
                }
                if($scope.queryTool.linkState.model[0].id === 1){
                    rowData.linkStatus = '过滤后链路';
                }else if($scope.queryTool.linkState.model[0].id === 0){
                    rowData.linkStatus = '采集链路';
                }
            }
            $scope.FMGridOption.data.push(rowData);
        })
        Loading.hideLoading('.show-grid-group');
    };
    /**checkedItemsQuery*/
    const checkQueryItems = () => {
        let isSelectedDate = false;
        let isSelectedLinkname = false;
        if ($scope.isWarning === 'long') {
            swal({
                type: 'warning',
                text: '你选择的时间区间过长！请重新选择时间',
            });
            $scope.isWarning = 'yes';
        } else if ($scope.isWarning === 'empty') {
            $scope.isWarning = 'yes';
        } else {
            $scope.isWarning = 'no';
            isSelectedDate = true;
        }
        if ($scope.queryTool.linkName.model.length <= 0) {
            $scope.queryTool.linkName.IsWarning.isWarned = true;
            $scope.queryTool.linkName.IsWarning.isSearched = true;
        } else {
            $scope.queryTool.linkName.IsWarning.isWarned = false;
            $scope.queryTool.linkName.IsWarning.isSearched = false;
            isSelectedLinkname = true;
        }
        if (isSelectedLinkname && isSelectedDate) {
            return true;
        }
        return false;
    };

    /**查询点击事件*/
    $scope.searchData = () => {
        if (checkQueryItems()) {
            let url = APIS.linkMonitoring.flowMonitoringStatistics;
            let params = {
                interval: $scope.queryTool.interval.model[0].value,
                link: $scope.queryTool.linkName.model[0].link,
                timeSlots: $scope.timeSlots.str,
                orderBys: 'statisticalTime asc',
            };
            Loading.isLoading('#flowMonitoringChart');
            Loading.isLoading('.show-grid-group');
            HttpRequestService.get(url, params, reponse => {
                setDataForChart(reponse.statistics);
                setDataForGrid(reponse.statistics);
                $scope.isSearched = true;
            });
            /**结束请求后收起查询栏*/
            $scope.togglePanel();
        }
    };
    /******************** 初始化加载页面 *******************************/
    const initController = () => {
        /**初始化echart*/
        initCharts();
        /**初始化表格*/
        initDIAGrid();
        /**初始化链路名称表*/
        getData.getLink();
    };
    initController();
}
FlowMonitoringController.$inject = ['$scope', '$state', '$filter', 'HttpRequestService'];