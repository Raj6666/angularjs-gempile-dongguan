'use strict';

const echarts = require('echarts');
import swal from 'sweetalert2';
import APIS from '../configs/ApisConfig';
import Loading from '../custom-pulgin/Loading';
import DefaultData from '../data/DataDirectAnalysisDataConfig';

/**
 * Dialing Error Analysis Controller
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function DialingErrorAnalysisController($scope, $filter, HttpRequestService) {
    /**面板实例*/
    let rightPanel = $('.right-side');
    let leftPanel = $('.left-side');
    let middlePanel = $('.middle-side');
    /**更新时间*/
    $scope.upDateDate = (timeSlots, isWarning) => {
        $scope.timeSlots = timeSlots;
        $scope.isWarning = isWarning;
    };
    /**查询下拉框设置===============================================================*/
    /**select内容翻译*/
    $scope.selectorText = {
        checkAll: '选择全部',
        uncheckAll: '取消全部',
        buttonDefaultText: '请选择',
        dynamicButtonTextSuffix: '个选择',
        searchPlaceholder: '搜索',
    };
    /**选择地市*/
    $scope.citySetting = {
        scrollableHeight: '40px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        selectionLimit: 1,
        selectedToTop: true,
        idProperty: 'id',
        displayProp: 'name',
        closeOnSelect: true,
        closeOnDeselect: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.cityOptions = [
        {
            id: 1,
            name: '东莞市',
            value: '441900',
        },
    ];
    $scope.cityEvents = {
        onItemDeselect: () => {
            $scope.cityModel = [{
                id: 1,
                name: '东莞市',
                value: '441900',
            }];
        },
    };
    /**时间粒度选择设置*/
    $scope.intervalOptions = DefaultData.intervalOptions;
    $scope.intervalSetting = {
        scrollableHeight: '90px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        selectionLimit: 1,
        idProperty: 'id',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].label;
        },
    };
    $scope.intervalEvents = {
        onItemDeselect: () => {
            $scope.interval = [{
                id: 2,
                label: '小时',
                value: 60,
            }];//时间粒度
            $scope.dateInterval = '60';
        },
        onItemSelect: item => {
            $scope.dateInterval = item.value + '';
        },
    };
    /**类型选择设置*/
    $scope.typeOptions = [
        {
            id: 1,
            name: '家宽',
        },
    ];
    $scope.typeSetting = {
        scrollableHeight: '40px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        idProperty: 'id',
        displayProp: 'name',
        closeOnSelect: true,
        closeOnDeselect: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.typeEvents = {
        onItemDeselect: () => {
            $scope.typeModel = [{
                id: 1,
                name: '家宽',
            }];
        },
    };
    /**所选区县设置*/
    $scope.areaOptions = [];
    $scope.areaSetting = {
        scrollableHeight: '230px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        selectionLimit: 1,
        selectedToTop: true,
        enableSearch: true,
        idProperty: 'id',
        displayProp: 'name',
        searchField: 'name',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.areaEvents = {
        onItemSelect: () => {
            selectData.getCommunity();
            $scope.accountNumber = '';
            isBackFilled = false;
        },
        onItemDeselect: () => {
            $scope.communityOptions = [];
            $scope.communityModel = [];
            $scope.accountNumber = '';
            isBackFilled = false;
        },
    };
    $scope.areaIsWarning = {
        isSearched: false,
        isWarned: false,
    };
    /**所选镇区设置*/
    $scope.communitySetting = {
        checkBoxes: false,
        scrollableHeight: '250px',
        scrollable: true,
        showCheckAll: false,
        showUncheckAll: false,
        enableSearch: true,
        selectedToTop: true,
        closeOnSelect: true,
        selectionLimit: 1,
        displayProp: 'name',
        searchField: 'name',
        buttonClasses: 'btn btn-default select-width-140',
        idProperty: 'id',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.communityOptions = [];
    $scope.communityEvents = {
        onItemSelect: () => {
            $scope.accountNumber = '';
            isBackFilled = false;
        },
        onItemDeselect: () => {
            $scope.accountNumber = '';
            isBackFilled = false;
        },
    };
    /**设置默认选项*/
    $scope.cityModel = [{
        id: 1,
        name: '东莞市',
        value: '441900',
    }]; //选择地市
    $scope.interval = [{
        id: 2,
        label: '小时',
        value: 60,
    }];//时间粒度
    $scope.typeModel = [
        {
            id: 1,
            name: '家宽',
        },
    ]; //类型
    $scope.areaModel = []; //区县
    $scope.communityModel = []; //小区
    $scope.accountNumber = ''; //账号
    $scope.applicationGroups = '';

    /**定义时间变量*/
    $scope.timeSlot = '';
    $scope.endTimeStore = '';

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
                $scope.areaOptions = data;
            });
        },
        /**镇区*/
        getCommunity: () => {
            /**请求对应的小区*/
            $scope.communityOptions = [];
            $scope.communityModel = [];
            /**获取所选的区县中的小区*/
            let url = APIS.location.community;
            let param = {
                choosedAreas: $scope.areaModel[0].area,
                pageIndex: 1,
                pageSize: -1,
            };
            HttpRequestService.get(url, param, data => {
                $scope.communityOptions = data;
            });
        },
    };

    /** 初始化下拉列表中数据*/
    const initSelectData = () => {
        selectData.getArea();
    };

    /**获取数组中的最大值*/
    Array.prototype.max = function () {
        return Math.max.apply({}, this)
    };

    /**用户信息的分区与镇区是否已回填*/
    let isBackFilled = false;
    /**分区，区镇信息回填(用户信息)*/
    $scope.getAccountNumberInfo = () => {
        if ($scope.accountNumber.length > 0) {
            if ($filter('inputIsIllegal')($scope.accountNumber, 'chinese')) {
                return;
            } else if ($filter('inputIsIllegal')($scope.accountNumber, 'account')) {
                return;
            } else {
                let url = APIS.user.accountNumberInfo + '/' + $scope.accountNumber;
                HttpRequestService.get(url, null, userConfig => {
                    if (userConfig !== null) {
                        $scope.areaModel = [];
                        $scope.communityModel = [];
                        $scope.areaOptions.map(area => {
                            if (area.area === userConfig.area) {
                                $scope.areaModel.push(area);
                                /**请求对应的小区*/
                                $scope.communityOptions = [];
                                $scope.communityModel = [];
                                /**获取所选的区县中的小区*/
                                let communityUrl = APIS.location.community;
                                let param = {
                                    choosedAreas: area.area,
                                    pageIndex: 1,
                                    pageSize: -1,
                                };
                                HttpRequestService.get(communityUrl, param, community => {
                                    $scope.communityOptions = community;
                                    $scope.communityOptions.map(item => {
                                        if (item.community === userConfig.community) {
                                            // $scope.communityModel = [];
                                            $scope.communityModel.push(item);
                                        }
                                    });
                                    isBackFilled = true;
                                    if ($scope.communityModel.length <= 0) {
                                        swal({
                                            text: '未找到账号对应镇区',
                                            type: 'warning',
                                            allowOutsideClick: true,
                                        });
                                        $scope.communityOptions = [];
                                    }
                                });
                            }
                        });
                        if ($scope.areaModel.length <= 0) {
                            swal({
                                text: '未搜索到该账号信息',
                                type: 'warning',
                                allowOutsideClick: true,
                            });
                            $scope.communityOptions = [];
                        }
                    }
                }, () => {
                    /**请求失败时 500 404 400错误时*/
                    $scope.areaModel = [];
                    $scope.communityOptions = [];
                    $scope.communityModel = [];
                    swal({
                        text: '请求失败,请检查网络',
                        type: 'warning',
                        allowOutsideClick: true,
                    });
                })
            }
        } else {
            $scope.areaModel = [];
            $scope.communityOptions = [];
            $scope.communityModel = [];
            swal({
                text: '账号不能为空',
                type: 'warning',
                allowOutsideClick: true,
            });
        }
    };
    /**账号搜索输入框，用户点击会车时进行回填*/
    $scope.accountNumberKeyUp = event => {
        let keyCode = window.event ? event.keyCode : event.which; //获取按键编码
        if (keyCode === 13) {
            $scope.getAccountNumberInfo();
        }
        isBackFilled = false;
    };

    /**点击下拉箭头*/
    $scope.showSearchPanel = true;
    $scope.togglePanel = () => {
        $scope.showSearchPanel = !$scope.showSearchPanel;
        $('#query-panel-body').slideToggle('normal');
    };
    /**查询栏输入校验*/
    const checkQueryItems = () => {
        let isSeletedDate = false;
        let isSelectedArea = false;
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
            isSeletedDate = true;
        }
        if ($scope.areaModel.length <= 0) {
            //let warining = "请至少选择一个'分区'\n或进行'账号搜索'！";
            // $('#areaDropdown').find('button').css('border','2px solid red');
            // $('#areaDropdown').toggleClass('shakeNormal');
            // setTimeout(() => {
            //     $('#areaDropdown').toggleClass('shakeNormal');
            // },1000);
            // swal({
            //     title: warining,
            //     confirmButtonText: '确认',
            //     type: 'warning',
            //     showCancelButton: false,
            //     allowOutsideClick: false,
            // });
            $scope.areaIsWarning.isWarned = true;
            $scope.areaIsWarning.isSearched = true;
        } else {
            //$('#areaDropdown').find('button').css('border','1px solid #ccc');
            $scope.areaIsWarning.isWarned = false;
            $scope.areaIsWarning.isSearched = false;
            isSelectedArea = true;
        }
        if (isSeletedDate && isSelectedArea) {
            return true;
        }
        return false;
    };

    /** 查询请求*/
    const searchRequest = isInitialize => {
        let loadingStyle = {
            color: '#2BBCFF',
        };
        let communityChoosed = '';
        if ($scope.communityModel[0]) {
            communityChoosed = $scope.communityModel[0].community;
        }
        Loading.isLoading('#flowPie');
        Loading.isLoading('.tab-record');
        Loading.isLoading('#errorCodeLine');
        homeCharts.getFlowPie(isInitialize, loadingStyle, $scope.interval[0].value,
            $scope.areaModel[0].area,
            communityChoosed,
            $scope.accountNumber,
            $scope.timeSlots.startDate + ',' + $scope.timeSlots.endDate,
            document.body.offsetWidth <= 1007);
        // /**请求表格数据*/
        // getDataForGrid();
        /**结束请求后收起查询栏*/
        //$('.toggleBtn').trigger('click');
        //$('#query-panel-body').slideToggle('fast');
        $scope.togglePanel();
    };

    /** 点击查询*/
    $scope.searchData = () => {
        if ($scope.accountNumber === '' || isBackFilled) {
            if (checkQueryItems()) {
                searchRequest(true);
            }
        } else if (/[\u4e00-\u9fa5]/.test($scope.accountNumber)) {
            swal({
                text: '账号不能为非法字符',
                type: 'warning',
                allowOutsideClick: true,
            });
        } else if (/[，\s_'’‘\"”“|\\~#$%^&*!。;\/<>\?？]/.test($scope.accountNumber)) {
            swal({
                text: '账号不能为特殊字符',
                type: 'warning',
                allowOutsideClick: true,
            });
        } else {
            let url = APIS.user.accountNumberInfo + '/' + $scope.accountNumber;
            HttpRequestService.get(url, null, userConfig => {
                if (userConfig !== null) {
                    $scope.areaModel = [];
                    $scope.communityModel = [];
                    $scope.areaOptions.map(area => {
                        if (area.area === userConfig.area) {
                            $scope.areaModel.push(area);
                            /**请求对应的小区*/
                            $scope.communityOptions = [];
                            $scope.communityModel = [];
                            /**获取所选的区县中的小区*/
                            let communityUrl = APIS.location.community;
                            let param = {
                                choosedAreas: area.area,
                                pageIndex: 1,
                                pageSize: -1,
                            };
                            HttpRequestService.get(communityUrl, param, community => {
                                $scope.communityOptions = community;
                                $scope.communityOptions.map(item => {
                                    if (item.community === userConfig.community) {
                                        // $scope.communityModel = [];
                                        $scope.communityModel.push(item);
                                    }
                                });
                                isBackFilled = true;
                                if ($scope.communityModel.length <= 0) {
                                    swal({
                                        text: '未找到账号对应镇区',
                                        type: 'warning',
                                        allowOutsideClick: true,
                                    });
                                    $scope.communityOptions = [];
                                }
                                if ($scope.areaModel.length > 0 || $scope.communityModel.length > 0) {
                                    if (checkQueryItems()) {
                                        searchRequest(true);
                                    }
                                }
                            });
                        }
                    });
                    if ($scope.areaModel.length <= 0) {
                        swal({
                            text: '未搜索到该账号信息',
                            type: 'warning',
                            allowOutsideClick: true,
                        });
                        $scope.communityOptions = [];
                    }
                }
            }, () => {
                /**请求失败时 500 404 400错误时*/
                $scope.areaModel = [];
                $scope.communityOptions = [];
                $scope.communityModel = [];
                swal({
                    text: '请求失败，请检查网络',
                    type: 'warning',
                    allowOutsideClick: true,
                });
            })
        }
    };
    /**===========================================================================*/

    /**屏幕自适应 ——浏览器大小改变时重置echarts表格大小*/
    window.onresize = function () {
        //左侧饼图
        currentScreenWidth = document.body.offsetWidth;
        if(currentScreenWidth !== prevScreenWidth &&  (currentScreenWidth <= 1007 || prevScreenWidth <= 1007)){
            homeCharts.getFlowPie(false, {color: '#2BBCFF'}, $scope.interval[0].value, $scope.areaModel[0].area, $scope.communityModel[0].community, $scope.accountNumber, $scope.timeSlots.startDate + ',' + $scope.timeSlots.endDate, document.body.offsetWidth <= 1007);
        }
        prevScreenWidth = currentScreenWidth;
        let mapChart = echarts.getInstanceByDom(document.getElementById('flowPie'));
        $('#flowPie').css('height', leftPanel.height());
        mapChart.resize();
        //右侧表格
        $('.tab-record').css('height', rightPanel.height());
        //下方折线图
        let lineChart = echarts.getInstanceByDom(document.getElementById('errorCodeLine'));
        $('#errorCodeLine').css('height', middlePanel.height());
        lineChart.resize();
    };

    /**echarts图表请求数据函数*/
    const homeCharts = {
        /** 错误码占比饼图 */
        getFlowPie: (isInitialize, loadingStyle, interval, area, community, accountNumber, timeSlot, isSmallest) => {
            let url = APIS.dialing.ErrorAnalysis;
            let param = {
                interval,
                userType: 3,
                area,
                community,
                accountNumber,
                timeSlots: timeSlot ? timeSlot : $scope.timeSlots.startDate + ',' + $scope.timeSlots.endDate,
                orderBys: 'statisticalTime\u0020asc',
                pageIndex: 1,
                pageSize: -1,
            };
            HttpRequestService.get(url, param, data => {
                //console.log(data);
                /**饼图数据*/
                let errorCodeData = [];
                let errorCodeName = [];
                /**折线图数据*/
                let timeStep = [];
                let errorCodeLineData = [];
                let errorCodeLineName = [];
                data.statistics.map(record => {
                    /**饼图数据填充*/
                    if (errorCodeName.indexOf(record.errorCodeName) === -1) {
                        errorCodeName.push(record.errorCodeName);
                        errorCodeData.push({
                            name: record.errorCodeName,
                            value: 0,
                            code: record.errorCode,
                        });
                    }

                    /**折线图数据填充*/
                    if (errorCodeLineName.indexOf(record.errorCodeName) === -1) {
                        errorCodeLineName.push(record.errorCodeName);
                        errorCodeLineData.push({
                            name: record.errorCodeName,
                            value: [],
                        });
                    }

                    /**折线图时间轴填充*/
                    if (timeStep.indexOf($filter('date')(record.statisticalTime, 'MM-dd HH:mm')) === -1) {
                        timeStep.push(($filter('date')(record.statisticalTime, 'MM-dd HH:mm')));
                    }
                });

                errorCodeData.map(record => {
                    data.statistics.map(item => {
                        if (record.code === item.errorCode) {
                            record.value += item.radiusDialingFailCount;
                        }
                    });
                });

                errorCodeLineData.map(record => {
                    data.statistics.map(item => {
                        if (record.name === item.errorCodeName) {
                            record.value.push(item.radiusDialingFailCount);
                        }
                    });
                });

                let pieChart = echarts.getInstanceByDom(document.getElementById('flowPie'));
                if (isInitialize) {
                    pieChart.showLoading(loadingStyle);
                }
                let formatter;
                if(isSmallest){
                    formatter = (params) =>{
                        if(params.name.length >5){
                            return params.name.substr(0,4) +  '\n' + params.name.substr(4,params.name.length-1);
                        }
                        return params.name;
                    }
                } else {
                    formatter = (params) =>{
                        return params.name;
                    }
                }
                let option = {
                    tooltip: {
                        trigger: 'item',
                        formatter(params) {
                            return '错误码占比<br>错误码：' + params.data.code + '<br>错误描述：' + params.data.name + '<br>' + params.marker + '占比：' + params.percent + '%';
                        },
                        position(e) {
                            return e;
                        }
                    },
                    series: [{
                        name: '库存情况',
                        type: 'pie',
                        radius: '75%',
                        center: ['50%', '50%'],
                        clockwise: false,
                        hoverAnimation: false,
                        minAngle: 10,
                        startAngle: 50,
                        data: errorCodeData,
                        label: {
                            normal: {
                                textStyle: {
                                    color: '#444',
                                    fontSize: 12,
                                },
                                formatter: formatter,
                            },
                        },
                        labelLine: {
                            normal: {
                                show: false,
                                length: 3,
                                // length2: 7,
                            },
                        },
                        itemStyle: {
                            normal: {
                                borderWidth: 3,
                                borderColor: '#ffffff',
                            },
                            emphasis: {
                                borderWidth: 0,
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)',
                            },
                        },
                    }],
                    color: ['#6104B4', '#0908FA', '#047FFC', '#00FC81', '#04FD04', '#81FD04', '#FDF100', '#FC7F01', '#FE0000', '#E62B8B', '#F80B97', '#FE00FB', '#FA92CF', '#B47CE6'],
                    backgroundColor: '#fff',
                };
                pieChart.setOption(option);
                if (isInitialize) {
                    pieChart.hideLoading();
                }
                Loading.hideLoading('#flowPie');

                /**表格*/
                setDataForGrid(data.statistics);

                /**折线图*/
                    // let timeStep = [];
                    // data.statistics.map(record => {
                    //     if (timeStep.indexOf($filter('date')(record.statisticalTime, 'MM-dd hh:mm')) === -1) {
                    //         timeStep.push(($filter('date')(record.statisticalTime, 'MM-dd hh:mm')));
                    //     }
                    // });
                    // //console.log(timeStep.reverse());
                    // let errorCodeLineData = [];
                    // let errorCodeLineName = [];
                    // data.statistics.map(record => {
                    //     if (errorCodeLineName.indexOf(record.errorCodeName) === -1) {
                    //         errorCodeLineName.push(record.errorCodeName);
                    //         errorCodeLineData.push({
                    //             name: record.errorCodeName,
                    //             value: [],
                    //         });
                    //     }
                    // });
                    //
                    // errorCodeLineData.map(record => {
                    //     data.statistics.map(item => {
                    //         if(record.name === item.errorCodeName) {
                    //             record.value.push(item.radiusDialingFailCount);
                    //         }
                    //     });
                    // });
                let lineChart = echarts.getInstanceByDom(document.getElementById('errorCodeLine'));
                if (isInitialize) {
                    lineChart.showLoading(loadingStyle);
                }
                let lineOption = {
                    title: {
                        top: '-1.8%',
                        left: 'center',
                        text: '错误码趋势',
                    },
                    tooltip: {
                        trigger: 'axis',
                    },
                    color: DefaultData.echartThemeColor,
                    legend: {
                        top: '8%',
                        data: errorCodeLineName,
                    },
                    grid: {
                        left: '1%',
                        right: '1%',
                        top: '17%',
                        bottom: '6.5%',
                        containLabel: true,
                    },
                    dataZoom: [
                        {
                            show: true,
                            type: 'slider',
                            start: 40,
                            // 结束位置的百分比，0 - 100
                            end: 100,
                            height: 13,
                            bottom: 0,
                            // 开始位置的数值
                        },
                    ],
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: timeStep,
                    },
                    yAxis: {
                        type: 'value',
                    },
                    series: [],
                };

                let i = 0;
                errorCodeLineData.map(record => {
                    lineOption.series.push(
                        {
                            name: record.name,
                            type: 'line',
                            stack: '总量',
                            lineStyle: {
                                normal: {
                                    width: 1,
                                    type: 'solid',
                                    color: DefaultData.echartThemeColor[i],
                                    shadowBlur: 5,
                                },
                            },
                            data: record.value,
                        });
                    i++;
                });
                lineChart.setOption(lineOption,true);
                if (isInitialize) {
                    lineChart.hideLoading();
                }
                Loading.hideLoading('#errorCodeLine');
            });
        },
    };
    let prevScreenWidth,currentScreenWidth;
    /** 加载全部echarts图表 */
    const loadCharts = () => {
        // let loadingStyle = {
        //     color: '#2BBCFF',
        // };
        currentScreenWidth = document.body.offsetWidth;
        prevScreenWidth = currentScreenWidth;
        /**默认显示所有出口与所有业务大小类的流量信息*/
        //homeCharts.getFlowPie(isInitialize, loadingStyle, '','', $scope.interval[0].value, '1510185600306,1510272000306');
        //homeCharts.getErrorCodeLine(isInitialize, loadingStyle);
    };

    /** 初始化echarts加载图表 **/
    const initECharts = () => {
        /**饼图*/
        $('#flowPie').css('height', leftPanel.height());
        echarts.init(document.getElementById('flowPie'));
        /**折线图*/
        $('#errorCodeLine').css('height', middlePanel.height());
        echarts.init(document.getElementById('errorCodeLine'));
        /**表格*/
        $('.tab-record').css('height', rightPanel.height());
        loadCharts(true);
    };

    /**数据表控件配置===============================================*/
    /**表格数据处理*/
        // let initColumn = [
        //     {
        //         displayName: '时间',
        //         name: 'statisticalTime',
        //         width: 200,
        //     },
        //     {
        //         displayName: '用户类型',
        //         name: 'userType',
        //         width: 200,
        //     },
        // ];
    const fillColumn = () => {
            let columns = [
                {
                    displayName: '时间',
                    name: 'statisticalTime',
                    width: 150,
                },
                {
                    displayName: '地市',
                    name: 'city',
                    width: 100,
                },
                {
                    displayName: '区县',
                    name: 'area',
                    width: 100,
                },
            ];
            if ($scope.communityModel[0]) {
                columns.push({
                    displayName: '镇区',
                    name: 'community',
                    width: 100,
                });
            }
            if ($scope.accountNumber.length > 0) {
                columns.push({
                    displayName: '用户账号',
                    name: 'accountNumber',
                    width: 100,
                });
            }
            columns.push(
                {
                    displayName: '错误码',
                    name: 'errorCode',
                    width: 100,
                },
                {
                    displayName: '失败次数(次)',
                    name: 'radiusDialingFailCount',
                    width: 160,
                });
            /**表头*/
            // let columns = [
            //     {
            //         displayName: '时间',
            //         name: 'statisticalTime',
            //         width: 150,
            //     },
            //     {
            //         displayName: '地市',
            //         name: 'city',
            //         width: 100,
            //     },
            //     {
            //         displayName: '分区',
            //         name: 'area',
            //         width: 100,
            //     },
            //     {
            //         displayName: '镇区',
            //         name: 'community',
            //         width: 100,
            //     },
            //     {
            //         displayName: '用户账号',
            //         name: 'accountNumber',
            //         width: 100,
            //     },
            //     {
            //         displayName: '错误码',
            //         name: 'errorCode',
            //         width: 100,
            //     },
            //     {
            //         displayName: '失败次数',
            //         name: 'radiusDialingFailCount',
            //         width: 100,
            //     },
            // ];
            $scope.FAGridOption.columnDefs = columns;
        };
    // let curPageSize;
    // let curPageIndex;
    const initDIAGrid = () => {
        // i18nService.setCurrentLang('zh-cn');
        $scope.FAGridOption = {
            enableGridMenu: true,
            enablePaginationControls: true,
            useExternalPagination: false,
            paginationPageSizes: [10, 30, 50],
            paginationPageSize: 10,
            paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
            cellTooltip: true,
            exporterCsvFilename: '错误码查询数据表.csv',
            exporterOlderExcelCompatibility: true,
            columnDefs: [],
        };
        $scope.FAGridOption.useExternalSorting = false;
        $scope.FAGridOption.onRegisterApi = function (gridApi) {
            $scope.FAGridApi = gridApi;
            // gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
            //     if (getDeviceIndicatorData) {
            //         if (sortColumns.length > 0) {
            //             $scope.FAGridOption.paginationOptions.sort = sortColumns[0].sort.direction;
            //         } else {
            //             $scope.FAGridOption.paginationOptions.sort = null;
            //         }
            //         curPageSize = grid.options.paginationPageSize;
            //         curPageIndex = grid.options.paginationCurrentPage;
            //         setDataForGrid(curPageIndex, curPageSize);
            //     }
            // });
        };
        // /***导出数据*/
        // let getDeviceIndicatorData = function () {
        //     return new Promise((resolve, reject) => {
        //         // let url = APIS.flow.dataDirectAnalysis + '/statistic';
        //         // let param = getParamsInSearch(1, -1, true);
        //         // HttpRequestService.get(url, param, data => {
        //         //     $scope.FAGridOption.data.length = 0;
        //         //     data.map(row => {
        //         //         $scope.FAGridOption.data.push(row);
        //         //     });
        //         //     resolve();
        //         // }, () => {
        //         //     reject();
        //         // });
        //     });
        // };
        // /***触发导出全部数据*/
        // $scope.exportToCsv = () => {
        //     $scope.FAGridApi.exporter.csvExport('all', 'all');
        // };
        /**初始化列头*/
        fillColumn();
    };
    /**填充数据到grid表*/
    const setDataForGrid = data => {
        fillColumn();
        $scope.FAGridOption.data = [];
        data.map(rowData => {
            rowData.statisticalTime = $filter('date')(rowData.statisticalTime, 'yyyy/MM/dd HH:mm');
            /**时间格式化*/
            $scope.FAGridOption.data.push(rowData);
        });
        Loading.hideLoading('.tab-record');
    };
    /**===========================================================*/


    /** 初始化加载Controller */
    const initController = () => {
        /** 初始化下拉列表中加载数据*/
        initSelectData();
        /** 初始化echarts加载图表 */
        initECharts();
        /**初始化表格*/
        initDIAGrid();
    };
    initController();
}
DialingErrorAnalysisController.$inject = ['$scope', '$filter', 'HttpRequestService'];