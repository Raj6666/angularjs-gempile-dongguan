'use strict';
import {NOW, ONE_DAY_MS} from '../constants/CommonConst';
import APIS from '../configs/ApisConfig';
import echarts from 'echarts';
import Loading from '../custom-pulgin/Loading';
import swal from 'sweetalert2';
import StaticData from '../data/DialingAnalysisDataConfig';

/**
 * Business Indicator Analysis Controller
 *
 * @ngInject
 * @constructor
 * @param $scope
 * @param $state
 * @param $filter
 * @param HttpRequestService
 */
export default function DeviceIndicatorAnalysisController($scope, $state, $filter, HttpRequestService) {
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
    /**查询条件栏设置*/
    $scope.queryTool = {
        /**select插件内容翻译*/
        selectorText: {
            checkAll: '选择全部',
            uncheckAll: '取消全部',
            buttonDefaultText: '请选择',
            dynamicButtonTextSuffix: '个选择',
            searchPlaceholder: '搜索',
        },
        //地市选择
        city: {
            options: StaticData.queryToolData.city.options,
            model: StaticData.queryToolData.city.model,
            setting: {
                scrollableHeight: '40px',
                showCheckAll: false,
                showUncheckAll: false,
                scrollable: true,
                enableSearch: false,
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
            events: {
                onItemDeselect: item => {
                    $scope.queryTool.city.model = [StaticData.queryToolData.city.options[0]];
                },
            },
        },
        //时间粒度
        interval: {
            options: StaticData.queryToolData.interval.options,
            model: StaticData.queryToolData.interval.model,
            setting: {
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
            events: {
                onItemDeselect: item => {
                    $scope.queryTool.interval.model = [StaticData.queryToolData.interval.options[1]];
                    $scope.interval = '60';
                },
                onItemSelect: item => {
                    $scope.interval = item.value + '';
                },
            },
        },
        userType: {
            options: StaticData.queryToolData.userTypes.options,
            model: StaticData.queryToolData.userTypes.model,
            setting: {
                scrollableHeight: '40px',
                showCheckAll: false,
                showUncheckAll: false,
                scrollable: true,
                enableSearch: false,
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
            events: {
                onItemDeselect: item => {
                    $scope.queryTool.userType.model = [StaticData.queryToolData.userTypes.options[0]];
                },
            },
        },
        area: {
            options: [],
            model: [],
            setting: {
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
            events: {
                onItemSelect: item => {
                    selectData.getCommunity(item.area);
                    $scope.queryTool.accountNumber = '';
                },
            },
            IsWarning : {
                isSearched : false,
                isWarned : false,
            },
        },
        community: {
            options: [],
            model: [],
            setting: {
                scrollableHeight: '200px',
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
            events: {
                onItemSelect: item => {
                    $scope.queryTool.accountNumber = '';
                },
            },
        },
        accountNumber: '',
    };
    /**查询条件*/
    $scope.getAccountNumberInfo = info => new Promise((resolve, reject) => {
        if ($scope.queryTool.accountNumber.length > 0) {
            if ($filter('inputIsIllegal')($scope.queryTool.accountNumber, 'chinese')) {
                return;
            } else if ($filter('inputIsIllegal')($scope.queryTool.accountNumber, 'account')) {
                return;
            } else {
                let url = APIS.user.accountNumberInfo + '/' + $scope.queryTool.accountNumber;
                HttpRequestService.get(url, null, userConfig => {
                    if (userConfig !== null && userConfig !== '') {
                        $scope.queryTool.area.model = [];
                        $scope.queryTool.community.model = [];
                        $scope.queryTool.area.options.map(area => {
                            if (area.area === userConfig.area) {
                                $scope.queryTool.area.model.push(area);
                                /**请求对应的小区*/
                                $scope.queryTool.community.options = [];
                                $scope.queryTool.community.model = [];
                                /**获取所选的区县中的小区*/
                                let communityUrl = APIS.location.community;
                                let param = {
                                    choosedAreas: area.area,
                                    pageIndex: 1,
                                    pageSize: -1,
                                };
                                HttpRequestService.get(communityUrl, param, community => {
                                    $scope.queryTool.community.options = community;
                                    $scope.queryTool.community.options.map(item => {
                                        if (item.community === userConfig.community) {
                                            $scope.queryTool.community.model.push(item);
                                            resolve();
                                        }
                                    });
                                    if ($scope.queryTool.community.model.length <= 0) {
                                        swal({
                                            text: '未找到账号对应镇区',
                                            type: 'warning',
                                            allowOutsideClick: true,
                                        });
                                    }
                                }, error => {
                                    reject();
                                });
                            }
                        });
                        if ($scope.queryTool.area.model.length <= 0) {
                            swal({
                                text: '未找到账号对应分区',
                                type: 'warning',
                                allowOutsideClick: true,
                            });
                        }
                    } else {
                        $scope.queryTool.area.model = [];
                        $scope.queryTool.community.model = [];
                        swal({
                            text: '未搜索到该账号信息',
                            type: 'warning',
                            allowOutsideClick: true,
                        });
                        reject();
                    }
                }, error => {
                    $scope.queryTool.area.model = [];
                    $scope.queryTool.community.model = [];
                    swal({
                        text: '未搜索到该账号信息',
                        type: 'warning',
                        allowOutsideClick: true,
                    });
                    reject();
                });
            }
        } else {
            resolve();
            if (!info) {
                swal({
                    text: '账号不能为空',
                    type: 'warning',
                    allowOutsideClick: true,
                });
            }
        }
    });
    $scope.accountNumberKeyUp = event => {
        let keyCode = window.event ? event.keyCode : event.which; //获取按键编码
        if (keyCode === 13) {
            if($scope.queryTool.accountNumber.length <= 0){
                swal({
                    text: '账号不能为空',
                    type: 'warning',
                    allowOutsideClick: true,
                });
            }else{
                $scope.getAccountNumberInfo().catch(() => {});
            }
        }
    };
    /** 下拉列表请求数据函数*/
    const selectData = {
        /**分区*/
        getArea: () => {
            let url = APIS.location.area;
            let param = {
                pageIndex: 1,
                pageSize: -1,
            };
            HttpRequestService.get(url, param, data => {
                $scope.queryTool.area.options = data;
            });
        },
        /**镇区*/
        getCommunity: area => {
            /**请求对应的小区*/
            $scope.queryTool.community.options = [];
            $scope.queryTool.community.model = [];
            /**获取所选的区县中的小区*/
            let url = APIS.location.community;
            let param = {
                choosedAreas: area,
                pageIndex: 1,
                pageSize: -1,
            };
            HttpRequestService.get(url, param, data => {
                $scope.queryTool.community.options = data;
            });
        },
    };
    /**查询栏输入校验*/
    const checkQueryItems = () => {
        let isSeletedDate = false;
        if($scope.isWarning==='long'){
            swal({
                type:'warning',
                text:'你选择的时间区间过长！请重新选择时间',
            });
            $scope.isWarning='yes';
        }else if($scope.isWarning==='empty'){
            $scope.isWarning='yes';
        }else {
            $scope.isWarning='no';
            isSeletedDate = true;
        }
        if ($scope.queryTool.area.model.length <= 0 && $scope.queryTool.accountNumber.length <= 0) {
            // swal({
            //     text: '请选择区县',
            //     type: 'warning',
            //     allowOutsideClick: false,
            // });
            $scope.queryTool.area.IsWarning.isWarned = true;
            $scope.queryTool.area.IsWarning.isSearched = true;
            return false;
        }
        $scope.queryTool.area.IsWarning.isWarned = false;
        $scope.queryTool.area.IsWarning.isSearched = false;
        return isSeletedDate;
    };
    /**定义时间变量*/
    let startDate = NOW - ONE_DAY_MS;
    let endDate = NOW;

    /**初始化echart*/
    let dialingAnalysisChart = echarts.init(document.getElementById('dialingAnalysisChart'), 'macarons');
    let dialingAnalysisChartOptions = {
        title: {
            text: '',
        },
        tooltip: {
            trigger: 'axis',
            formatter (message) {
                let time = message[0].axisValue;
                let str = time + '<br />' + message[0].marker + message[0].seriesName + ':' + message[0].value + '%' + '<br />' + message[1].marker + message[1].seriesName + ':' + message[1].value + 'ms';
                return str;
            },
        },
        legend: {
            formatter (name) {
                return name;
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            top: '8%',
            bottom: '10%',
            containLabel: true,
        },
        dataZoom: [
            {
                show: true,
                type: 'slider',
                start: 30,
                // 结束位置的百分比，0 - 100
                end: 100,
                height: 15,
                bottom: 0,
                // 开始位置的数值
            },
        ],
        // toolbox: {
        //     feature: {
        //         saveAsImage: {},
        //     },
        // },
        xAxis: {
            type: 'category',
            boundaryGap: true,
            data: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
        },
        yAxis: [
            {
                type: 'value',
                // name:'拨号成功率',
                axisLabel: {
                    formatter: '{value}%',
                },
                splitLine:{
                    show:false,
                },
            }, {
                type: 'value',
                splitNumber:10,
                // name:'拨号时延',
                axisLabel: {
                    formatter: '{value}ms',
                },
                splitLine:{
                    show:false,
                },
            },
        ],
        series: [
            {
                name: '拨号成功率',
                type: 'bar',
                itemStyle: {
                    normal: {
                        width: 1,
                        color: '#FC7F01',
                        type: 'solid',
                        shadowBlur: 5,
                    },
                },
                barWidth: 45,
                data: [],
            }, {
                name: '拨号时延',
                type: 'line',
                yAxisIndex: 1,
                itemStyle: {
                    normal: {
                        width: 1,
                        color: '#047FFC',
                        type: 'solid',
                        shadowBlur: 5,
                    },
                },
                // markPoint: {
                //     data: [
                //         {type: 'max', name: '最大值'},
                //         {type: 'min', name: '最小值'}
                //     ]
                // },
                data: [],
            },
        ],
    };
    const initCharts = () => {
        dialingAnalysisChart.setOption(dialingAnalysisChartOptions);
    };
    /**表格数据处理*/
    const fillColumn = () => {
        let columns = [];
        StaticData.grid.columns.map(column => {
            if (column.name === 'community') {
                if ($scope.queryTool.community.model.length > 0) {
                    columns.push(column);
                }
            } else if (column.name === 'accountNumber' || column.name ==='bandwidth') {
                if ($scope.queryTool.accountNumber.length > 0) {
                    columns.push(column);
                }
            } else {
                columns.push(column);
            }
            column.width = 170;
        });
        $scope.DIAGridOption.columnDefs = columns;
    };
    let curPageSize;
    let curPageIndex;
    const getParamsForSearch = (pageIndex, pageSize, isCountotal) => {
        /**查询参数定义*/
        let requestParams = {};
        requestParams.interval = $scope.queryTool.interval.model[0].value;
        requestParams.userType = $scope.queryTool.userType.model[0].id;
        requestParams.city = $scope.queryTool.city.model[0].value;
        requestParams.area = $scope.queryTool.area.model[0].area;
        if ($scope.queryTool.community.model.length > 0) {
            requestParams.community = $scope.queryTool.community.model[0].community;
        }
        if ($scope.queryTool.accountNumber.length > 0) {
            requestParams.accountNumber = $scope.queryTool.accountNumber;
        }
        requestParams.timeSlots = $scope.timeSlots.startDate + ',' + $scope.timeSlots.endDate;
        requestParams.orderBys = 'statisticalTime\u0020asc';
        requestParams.pageIndex = pageIndex;
        requestParams.pageSize = pageSize;
        requestParams.isCountotal = isCountotal;
        return requestParams;
    };
    /**初始化表格控件*/
    const initDIAGrid = () => {
        $scope.DIAGridOption = {
            enableGridMenu: true,
            enablePaginationControls: true,
            useExternalPagination: false,
            paginationPageSizes: [10, 30, 50],
            paginationPageSize: 10,
            paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
            cellTooltip: true,
            exporterCsvFilename: '拨号分析数据表.csv',
            exporterOlderExcelCompatibility: true,
            columnDefs: [],
            // exporterAllDataFn: function () {
            //     return getDeviceIndicatorData()
            //         .then(() => {
            //                 $scope.DIAGridOption.useExternalPagination = false;
            //                 $scope.DIAGridOption.useExternalSorting = false;
            //                 getDeviceIndicatorData = null;
            //             }
            //         );
            // },
        };
        $scope.DIAGridOption.useExternalSorting = false;
        $scope.DIAGridOption.onRegisterApi = function (gridApi) {
            $scope.DIAGridGridApi = gridApi;
            // gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            //     if (getDeviceIndicatorData) {
            //         curPageSize = pageSize;
            //         curPageIndex = newPage;
            //         setDataForGrid(curPageIndex, curPageSize);
            //     }
            // });
            // gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
            //     if (getDeviceIndicatorData) {
            //         if (sortColumns.length > 0) {
            //             paginationOptions.sort = sortColumns[0].sort.direction;
            //         } else {
            //             paginationOptions.sort = null;
            //         }
            //         curPageSize = grid.options.paginationPageSize;
            //         curPageIndex = grid.options.paginationCurrentPage;
            //         setDataForGrid(curPageIndex, curPageSize);
            //     }
            // });
        };
        /***导出数据*/
        // let getDeviceIndicatorData = function () {
        //     return new Promise((resolve, reject) => {
        //         let url = APIS.device.indicatorAnalysis;
        //         let param = getParamsForSearch(1, -1, true);
        //         HttpRequestService.get(url, param, data => {
        //             $scope.DIAGridOption.data.length = 0;
        //             data.map(row => {
        //                 $scope.DIAGridOption.data.push(row);
        //             });
        //             resolve();
        //         }, () => {
        //             reject();
        //         });
        //     });
        // };
        /**初始化列头*/
        fillColumn();
    };
    /**填充数据到echart图*/
    const setDataForChart = data => {
        let legendData = ['拨号成功率', '拨号时延'];
        let xAxisData = [];
        let seriesData0=[];
        let seriesData1=[];
        data.map(record => {
            if (xAxisData.indexOf($filter('date')(record.statisticalTime, 'MM-dd hh:mm')) === -1) {
                xAxisData.push($filter('date')(record.statisticalTime, 'MM-dd hh:mm'));
            }
            seriesData0.push(record.radiusDialingSuccessRatio);
            seriesData1.push(record.radiusDialingDelay);
        });
        dialingAnalysisChartOptions.legend.data = legendData;
        dialingAnalysisChartOptions.xAxis.data = xAxisData;
        dialingAnalysisChartOptions.series[0].data = seriesData0;
        dialingAnalysisChartOptions.series[1].data = seriesData1;
        dialingAnalysisChart.setOption(dialingAnalysisChartOptions);
        Loading.hideLoading('#dialingAnalysisChart');
    };
    /**填充数据到grid表*/
    const setDataForGrid = data => {
        fillColumn();
        $scope.DIAGridOption.data = [];
        data.map(rowData => {
            rowData.statisticalTime = $filter('date')(rowData.statisticalTime, 'yyyy/MM/dd hh:mm');
            rowData.radiusDialingFailCount=rowData.radiusDialingTotalCount - rowData.radiusDialingSuccessCount;
            /**时间格式化*/
            $scope.DIAGridOption.data.push(rowData);
        });
        Loading.hideLoading('.show-grid-group');
    };
    /**查询点击事件*/
    $scope.searchData = () => {
        let url = APIS.dialing.Analysis;
        if (!checkQueryItems()) {
            return;
        }
        $scope.getAccountNumberInfo(true).then(() => {
            let requestParams = getParamsForSearch(1, -1, true);
            Loading.isLoading('#dialingAnalysisChart');
            Loading.isLoading('.show-grid-group');
            HttpRequestService.get(url, requestParams, response => {
                $scope.togglePanel();
                let statistics = response.statistics;
                statistics.map(statistic => {
                    for (let key in statistic){
                        if(typeof statistic[key] === 'number') {
                            statistic[key] = Math.round(statistic[key]*100)/100;/**小数位限制为两位*/
                        }
                    }
                });
                setDataForGrid(statistics);
                setDataForChart(statistics);
            });
        }, () => {
            if (!checkQueryItems()) {
                return;
            }
            $scope.queryTool.accountNumber = '';
            let requestParams = getParamsForSearch(1, -1, true);
            HttpRequestService.get(url, requestParams, response => {
                $scope.togglePanel();
                let statistics = response.statistics;
                statistics.map(statistic => {
                    for (let key in statistic){
                        if(typeof statistic[key] === 'number') {
                            statistic[key] = Math.round(statistic[key]*100)/100;/**小数位限制为两位*/
                        }
                    }
                });

                setDataForGrid(statistics);
                setDataForChart(statistics);
            });
        });
    };
    /**窗口大小改变*/
    window.onresize = () => {
        dialingAnalysisChart.resize();
    };
    /******************** 初始化加载页面 *******************************/
    const initController = () => {
        /**初始化区县列表*/
        selectData.getArea();
        /**初始化echart*/
        initCharts();
        /**初始化表格*/
        initDIAGrid();
    };
    initController();
}
DeviceIndicatorAnalysisController.$inject = ['$scope', '$state', '$filter', 'HttpRequestService'];