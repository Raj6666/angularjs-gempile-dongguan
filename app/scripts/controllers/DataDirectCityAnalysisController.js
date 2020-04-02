'use strict';

const echarts = require('echarts');
import Flatpickr from 'flatpickr';
import APIS from '../configs/ApisConfig';
import {NOW, ONE_DAY_MS} from '../constants/CommonConst';
import DefaultData from '../data/DataDirectAnalysisDataConfig';

/**
 * Data Direct City Analysis Controller
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function DataDirectCityAnalysisController($scope, $filter, HttpRequestService) {
    /**面板实例*/
    let rightPanel = $('.right-side');
    let leftPanel = $('.left-side');

    /**数据grid 列头*/
    let dataGridDefs = [
        {
            displayName: '时间',
            name: 'timeName',
        },
        {
            displayName: '地市',
            name: 'cityName',
        },
        {
            displayName: '总流量(GB)',
            name: 'totalFlow',
        },
        {
            displayName: '下行流量(GB)',
            name: 'downloadFlow',
        },
        {
            displayName: '上行流量(GB)',
            name: 'uploadFlow',
        },
        {
            displayName: 'DNS解析成功率',
            name: 'dnsAnalysisSuccessRate',
        },
        {
            displayName: 'TCP重传率',
            name: 'tcpReloadRate',
        },
    ];
    /**select内容翻译*/
    $scope.selectorText = {
        checkAll: '选择全部',
        uncheckAll: '取消全部',
        buttonDefaultText: '请选择',
        dynamicButtonTextSuffix: '个选择',
        searchPlaceholder: '搜索',
    };
    /**选择模板*/
    $scope.templateSetting = {
        scrollableHeight: '140px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        enableSearch: true,
        selectionLimit: 1,
        idProperty: 'id',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].label;
        },
    };
    $scope.templateOptions = DefaultData.testOptions;
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
    /**省份选择设置*/
    $scope.provinceOptions = DefaultData.provinceOptions;
    $scope.provinceSetting = {
        scrollableHeight: '140px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        enableSearch: true,
        selectionLimit: 1,
        idProperty: 'id',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].label;
        },
    };
    /**地市选择设置*/
    $scope.cityOptions = DefaultData.cityOptions;
    $scope.citySetting = {
        scrollableHeight: '250px',
        showCheckAll: true,
        showUncheckAll: true,
        scrollable: true,
        enableSearch: true,
        checkBoxes: true,
        idProperty: 'id',
        closeOnSelect: false,
        buttonClasses: 'btn btn-default select-width-140',
    };
    $scope.cityEvents = {
        // onItemSelect: item => {
        // },
        // onItemDeselect:item => {
        //     $scope.dimension = '请选择维度：';
        //     $scope.subDimension = '请选择维度：';
        // },
    };
    /**所选业务大类设置*/
    $scope.applicationTypeOptions = [];
    $scope.applicationTypeSetting = {
        scrollableHeight: '200px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        enableSearch: true,
        selectionLimit: 1,
        idProperty: 'id',
        displayProp: 'name',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.applicationTypeEvents = {
        onItemSelect: item => {
            /**请求对应的业务小类*/
            $scope.applicationOptions = [];
            $scope.applicationModel = [];
            selectData.getApplication(item.applicationType);
        },
    };
    /**所选业务小类设置*/
    $scope.applicationSetting = {
        checkBoxes: true,
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        enableAsyncSearch: true,
        buttonClasses: 'btn btn-default select-width-140',
        selectedToTop: true,
        idProperty: 'id',
        displayProp: 'name',
    };
    $scope.applicationOptions = [];
    $scope.applicationEvents = {
        //asyncSearchOptions: searchFilter => testOptions2,
    };
    /**指标选择设置*/
    $scope.indicatorOptions = DefaultData.testOptions;
    $scope.indicatorSetting = {
        checkBoxes: true,
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        enableAsyncSearch: true,
        selectedToTop: true,
        buttonClasses: 'btn btn-default select-width-140',
        idProperty: 'id',
    };
    $scope.indicatorEvents = {
        //asyncSearchOptions: searchFilter => testOptions2,
    };
    /**设置默认选项*/
    $scope.template = []; //选择模板
    $scope.interval = [{
        id: 2,
        label: '小时',
        value: 60,
    }];//时间粒度
    $scope.citiesModel = []; //地市
    $scope.applicationTypeModel = []; //业务大类
    $scope.indicatorModel = []; //指标
    $scope.applicationModel = [];//业务小类

    /**定义时间变量*/
    let startDate = NOW - ONE_DAY_MS;
    let endDate = NOW;
    $scope.timeSlot = '';
    /**初始化时间控件*/
    const initDatetimepicker = () => {
        let startDatePicker;
        let endDatePicker;
        /**获取初始日期*/
        let getDate = date => {
            let tmpDate = new Date(date);
            tmpDate.setHours(8);
            tmpDate.setMinutes(0);
            tmpDate.setSeconds(0);
            return tmpDate.valueOf();
        };
        startDate = getDate(NOW) - ONE_DAY_MS;
        endDate = getDate(NOW);
        $scope.timeSlot = startDate.toString() + ',' + endDate.toString();
        let startPickerConfig = {
            defaultDate: startDate,
            minDate: 0,
            maxDate: endDate,
            enableTime: true,
            onChange(selectedDates) {
                let tmpDate = selectedDates[0].getTime();
                startDate = selectedDates[0].getTime() + 8 * 3600000;
                if (endDatePicker) { // 这里是因为精确度为毫秒，会有偏差
                    endDatePicker.config.minDate = tmpDate;
                    endDatePicker.config.maxDate = tmpDate + 6 * ONE_DAY_MS > NOW ? NOW : tmpDate + 6 * ONE_DAY_MS;
                }
            },
        };
        let endPickerConfig = {
            defaultDate: endDate,
            minDate: 0,
            maxDate: new Date(),
            enableTime: true,
            onChange(selectedDates) {
                let tmpDate = selectedDates[0].getTime();
                endDate = selectedDates[0].getTime() + 8 * 3600000;
                if (startDatePicker) {
                    startDatePicker.config.minDate = tmpDate - 6 * ONE_DAY_MS;
                    startDatePicker.config.maxDate = tmpDate;
                }
            },
        };
        $(document).ready(() => {
            startDatePicker = new Flatpickr(document.querySelector('.start-time'), startPickerConfig);
            endDatePicker = new Flatpickr(document.querySelector('.end-time'), endPickerConfig);
        });
    };

    /** 下拉列表请求数据函数*/
    const selectData = {
        /**业务大类*/
        getApplicationType: () => {
            let url = APIS.application.applicationTypes;
            let param = {
                pageIndex: 1,
                pageSize: -1,
            };
            HttpRequestService.get(url, param, data => {
                //console.log(data);
                $scope.applicationTypeOptions = data;
            });
        },
        /**业务小类*/
        getApplication: applicationType => {
            let url = APIS.application.applications;
            let param = {
                applicationType,
                pageIndex: 1,
                pageSize: -1,
            };
            HttpRequestService.get(url, param, data => {
                $scope.applicationOptions = data;
            });
        },
    };

    /** 初始化下拉列表中数据*/
    const initSelectData = () => {
        selectData.getApplicationType();
    };
    /**===========================================================================*/

    /**同比环比具体地市*/
    $scope.compareCity = '';
    /**同比环比指标选择*/
    $scope.singleIndicatorSetting = {
        scrollableHeight: '140px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        enableSearch: true,
        selectionLimit: 1,
        idProperty: 'id',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default select-width-120',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].label;
        },
    };
    $scope.singleIndicatorOptions = DefaultData.singleIndicatorOptions;
    $scope.singleIndicatorModel = [{
        id: 1,
        label: '总流量',
    }];//默认选择第一个

    /**打开同比环比弹窗*/
    $scope.openCompareDialog = () => {
        let loadingStyle = {
            color: '#c1080d',
        };
        lineCharts.getSamePeriodLine(true, loadingStyle);
        lineCharts.getChainPeriodLine(true, loadingStyle);
    };

    /**屏幕自适应 ——浏览器大小改变时重置echarts表格大小*/
    window.onresize = function () {
        //左侧地图
        let mapChart = echarts.getInstanceByDom(document.getElementById('gdMap'));
        $('#gdMap').css('height', leftPanel.height());
        mapChart.resize();
        //右侧柱形图
        let barChart = echarts.getInstanceByDom(document.getElementById('flowBar'));
        $('#flowBar').css('height', rightPanel.height() * 0.45);
        barChart.resize();
        /**同比环比*/
        $('.indicator-detail-view').find('.modal-content').css('height', window.screen.height * 0.85);
        $('.network-indicator-detail-chart').css('height', ($('.modal-content').height() - 35) * 0.49);
        let lineChart1 = echarts.getInstanceByDom(document.getElementById('samePeriodChart'));
        let lineChart2 = echarts.getInstanceByDom(document.getElementById('chainPeriodChart'));
        lineChart1.resize();
        lineChart2.resize();
        //右侧表格
        $('.tab-record').css('height', rightPanel.height() * 0.48);
    };

    /**echarts图表请求数据函数*/
    const homeCharts = {
        /** 广东地图区域 */
        getGuangDongMap: (isInitialize, loadingStyle, applicationType, application, interval, timeSlots) => {
            let url = APIS.flow.dataDirectAnalysis;
            let param = {
                dimensionType: 2,
                applicationType,
                application,
                interval,
                timeSlots: '1510185600306,1510272000306',
            };

            HttpRequestService.get(url, param, data => {
                //console.log(data);
                let lessThanTen = [];
                let TenToTwenty = [];
                let TwentyToThirty = [];
                let ThirtyToForty = [];
                let higherThanForty = [];
                for (let i = 0; i < data.length; i++) {
                    if (0.1 >= data[i].ratio) {
                        lessThanTen.push({
                            name: data[i].dimensionName,
                            value: [
                                DefaultData.cityCenterPoint[data[i].dimensionName][0],
                                DefaultData.cityCenterPoint[data[i].dimensionName][1],
                                data[i].ratio * 100,
                                data[i].total_ip_len],
                        });
                    } else if (0.1 < data[i].ratio <= 0.2) {
                        TenToTwenty.push({
                            name: data[i].dimensionName,
                            value: [
                                DefaultData.cityCenterPoint[data[i].dimensionName][0],
                                DefaultData.cityCenterPoint[data[i].dimensionName][1],
                                data[i].ratio * 100,
                                data[i].total_ip_len],
                        });
                    } else if (0.2 < data[i].ratio <= 0.3) {
                        TwentyToThirty.push({
                            name: data[i].dimensionName,
                            value: [
                                DefaultData.cityCenterPoint[data[i].dimensionName][0],
                                DefaultData.cityCenterPoint[data[i].dimensionName][1],
                                data[i].ratio * 100,
                                data[i].total_ip_len],
                        });
                    } else if (0.3 < data[i].ratio <= 0.4) {
                        ThirtyToForty.push({
                            name: data[i].dimensionName,
                            value: [
                                DefaultData.cityCenterPoint[data[i].dimensionName][0],
                                DefaultData.cityCenterPoint[data[i].dimensionName][1],
                                data[i].ratio * 100,
                                data[i].total_ip_len],
                        });
                    } else {
                        higherThanForty.push({
                            name: data[i].dimensionName,
                            value: [
                                DefaultData.cityCenterPoint[data[i].dimensionName][0],
                                DefaultData.cityCenterPoint[data[i].dimensionName][1],
                                data[i].ratio * 100,
                                data[i].total_ip_len],
                        });
                    }
                }
                let uploadedDataURL = require('../../assets/maps/gd_map.json');
                let mapChart = echarts.getInstanceByDom(document.getElementById('gdMap'));
                if (isInitialize) {
                    mapChart.showLoading(loadingStyle);
                }
                // $.get(uploadedDataURL, geoJson => {
                    echarts.registerMap('广东省', uploadedDataURL);

                    let option = {
                        backgroundColor: '#333333',
                        tooltip: {
                            trigger: 'item',
                            formatter(params) {
                                return params.seriesName + '<br/>'
                                    + params.marker + params.name + ':&nbsp'
                                    + '(' + params.data.value[0] + ',' + params.data.value[1] + ')<br/>'
                                    + '流量占比:&nbsp' + params.data.value[2].toFixed(3) + '%<br/>'
                                    + '流量:&nbsp' + params.data.value[3] + 'TB';
                            },
                        },
                        legend: {
                            orient: 'horizontal',
                            y: 'bottom',
                            x: 'center',
                            data: ['<10%', '10%~20%', '20%~30%', '30%~40%', '>40%'],
                            itemWidth: 30,
                            itemHeight: 30,
                            textStyle: {
                                color: '#fff',
                            },
                        },
                        geo: {
                            map: '广东省',
                            layoutCenter: ['50%', '56%'],
                            layoutSize: '116%',
                            label: {
                                emphasis: {
                                    color: '#ffffff',
                                    'show': false,
                                },
                            },
                            roam: false,
                            mapLocation: {
                                width: '110%',
                                height: '97%',
                            },
                            geoCoord: {
                                '广州市': [113.27, 23.13],
                                '韶关市': [113.6, 24.82],
                                '深圳市': [114.05, 22.55],
                                '珠海市': [113.57, 22.27],
                                '汕头市': [116.68, 23.35],
                                '佛山市': [113.12, 23.02],
                                '江门市': [113.08, 22.58],
                                '湛江市': [110.35, 21.27],
                                '茂名市': [110.92, 21.67],
                                '肇庆市': [112.47, 23.05],
                                '惠州市': [114.42, 23.12],
                                '梅州市': [116.12, 24.28],
                                '汕尾市': [115.37, 22.78],
                                '河源市': [114.7, 23.73],
                                '阳江市': [111.98, 21.87],
                                '清远市': [113.03, 23.7],
                                '东莞市': [113.75, 23.05],
                                '中山市': [113.38, 22.52],
                                '潮州市': [116.62, 23.67],
                                '揭阳市': [116.37, 23.55],
                                '云浮市': [112.03, 22.92],
                            },
                            itemStyle: {
                                normal: {
                                    areaColor: '#3aa1bc',
                                    borderColor: '#fff',
                                },
                                emphasis: {
                                    areaColor: '#f0f510',
                                },
                            },
                        },
                        series: [
                            {
                                name: '<10%',
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                data: lessThanTen,
                                rippleEffect: {
                                    period: 4,
                                    scale: 2.5,
                                    brushType: 'fill',
                                },
                                label: {
                                    normal: {
                                        formatter: '{b}',
                                        position: 'right',
                                        show: true,
                                    },
                                    emphasis: {
                                        show: true,
                                    },
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#33FF66',
                                    },
                                    emphasis: {label: {show: true}},
                                },
                            }, {
                                name: '10%~20%',
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                data: TenToTwenty,
                                rippleEffect: {
                                    period: 4,
                                    scale: 2.5,
                                    brushType: 'fill',
                                },
                                label: {
                                    normal: {
                                        formatter: '{b}',
                                        position: 'right',
                                        show: true,
                                    },
                                    emphasis: {
                                        show: true,
                                    },
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#C7AB0E',
                                    },
                                },
                            }, {
                                name: '20%~30%',
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                data: TwentyToThirty,
                                rippleEffect: {
                                    period: 4,
                                    scale: 2.5,
                                    brushType: 'fill',
                                },
                                label: {
                                    normal: {
                                        formatter: '{b}',
                                        position: 'right',
                                        show: true,
                                        // textStyle: {
                                        //     color: "#fff"
                                        // },
                                    },
                                    emphasis: {
                                        'show': true,
                                    },
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#CD3E0A',
                                    },
                                },
                            }, {
                                name: '30%~40%',
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                data: ThirtyToForty,
                                rippleEffect: {
                                    period: 4,
                                    scale: 2.5,
                                    brushType: 'fill',
                                },
                                label: {
                                    normal: {
                                        formatter: '{b}',
                                        position: 'right',
                                        show: true,
                                        // textStyle: {
                                        //     color: "#fff"
                                        // },
                                    },
                                    emphasis: {
                                        show: true,
                                    },
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#9B0A4C',
                                    },
                                },
                            }, {
                                name: '>40%',
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                // data: [{
                                //     name: "惠州市",
                                //     value: [114.42, 23.12, 400]
                                // }, {
                                //     name: "揭阳市",
                                //     value: [115.77, 23.45, 400]
                                // }, {
                                //     name: "湛江市",
                                //     value: [109.95, 21.27, 400]
                                // }, {
                                //     name: "茂名市",
                                //     value: [110.62, 21.97, 400]
                                // }, {
                                //     name: "阳江市",
                                //     value: [111.58, 21.87, 400]
                                // }, {
                                //     name: "云浮市",
                                //     value: [111.63, 22.82, 400]
                                // }, {
                                //     name: "肇庆市",
                                //     value: [112.07, 23.45, 400]
                                // }, {
                                //     name: "韶关市",
                                //     value: [113.6, 24.82, 400]
                                // }, {
                                //     name: "河源市",
                                //     value: [114.7, 24.03, 400]
                                // }, {
                                //     name: "清远市",
                                //     value: [113.03, 24.0, 400]
                                // }, {
                                //     name: "汕头市",
                                //     value: [116.54, 23.30, 400]
                                // }],
                                data: higherThanForty,
                                rippleEffect: {
                                    period: 4,
                                    scale: 2.5,
                                    brushType: 'fill',
                                },
                                label: {
                                    normal: {
                                        formatter: '{b}',
                                        position: 'right',
                                        show: true,
                                    },
                                    emphasis: {
                                        show: true,
                                    },
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#78168B',
                                    },
                                },
                            }],
                    };
                    mapChart.setOption(option);
                // });
                if (isInitialize) {
                    mapChart.hideLoading();
                }
            });
        },
        /** 总流量对比柱形图 */
        getFlowBar: (isInitialize, loadingStyle) => {
            let barChart = echarts.getInstanceByDom(document.getElementById('flowBar'));
            if (isInitialize) {
                barChart.showLoading(loadingStyle);
            }

            let option = {
                backgroundColor: 'rgba(0,46,86,1)',
                title: {
                    show: false,
                },
                tooltip: {
                    show: true,
                    trigger: 'axis',
                    formatter(params) {
                        let relVal = params[0].name;
                        relVal += '<br/>流量占比:&nbsp' + params[0].value + '%<br/>';
                        relVal += '流量:&nbsp' + params[0].data.flow + 'GB';
                        //console.log(params);
                        return relVal;
                    },
                    showDelay: 0,
                    hideDelay: 50,
                    transitionDuration: 0,
                    backgroundColor: 'rgba(205,62,10,1)',
                    borderColor: '#aaa',
                    //showContent: true,
                    borderRadius: 8,
                    padding: 10,
                },
                //      dataZoom:[
                //       {
                //          type:'slider',
                //          show:true,
                //          height:20,
                //          backgroundColor:'rgba(38,227,189,0.3)',
                //          fillerColor: 'rgba(167,183,204,0.4)',
                //          borderColor:'#0a2b24'
                //       }
                //      ],
                axisPointer: {
                    type: 'line',
                    axis: 'auto',
                },
                legend: {
                    data: ['流量占比'],
                    show: false,
                },
                xAxis: {
                    axisTick: {show: false},
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                    axisLabel: {
                        color: '#fff',
                    },
                    data: ['深圳市', '广州市', '佛山市', '东莞市', '中山市', '韶关市', '惠州市', '珠海市', '清远市', '江门市'],
                },
                yAxis: {
                    splitLine: {show: false},
                    max: 45,
                    interval: 5,
                    axisTick: {show: false},
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}%',
                    },
                },
                grid: {
                    y: 5,
                    y2: 25,
                    x: 35,
                    x2: 10,
                },
                series: [{
                    name: '流量占比',
                    type: 'bar',
                    barMaxWidth: 60,
                    //data:[40.01,30.59,9.16,7.19,3.28,1.85,1.21,0.98,0.75,0.65],
                    data: [
                        {
                            value: 40.01,
                            flow: 223.01,
                        },
                        {
                            value: 30.59,
                            flow: 123.59,
                        },
                        {
                            value: 9.16,
                            flow: 231.34,
                        },
                        {
                            value: 7.19,
                            flow: 232,
                        },
                        {
                            value: 3.28,
                            flow: 787,
                        },
                        {
                            value: 1.85,
                            flow: 788,
                        },
                        {
                            value: 1.21,
                            flow: 123,
                        },
                        {
                            value: 0.98,
                            flow: 123,
                        },
                        {
                            value: 0.75,
                            flow: 123,
                        },
                        {
                            value: 0.65,
                            flow: 123,
                        }],
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0.7, [{
                                offset: 0,
                                color: 'rgba(252,242,0,1)',
                            }, {
                                offset: 1,
                                color: 'rgba(255,162,0,1)',
                            }]),
                            borderColor: '#FCF200',
                            borderWidth: 2,
                            opacity: 1,
                        },
                        emphasis: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(13,164,171,1)',
                            }, {
                                offset: 1,
                                color: 'rgba(64,180,157,.1)',
                            }]),
                            borderColor: '#0ea4a6',
                            borderWidth: 2,
                            barBorderRadius: [9, 9, 0, 0],
                            shadowBlur: 30,
                            shadowColor: 'rgba(32,188 ,157,0.8)',
                            opacity: 0.7,
                        },
                    },
                    markPoint: {
                        symbol: 'circle',
                        symbolSize: 50,
                        symbolOffset: [0, 0],
                        silent: true,
                    },
                }],
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%',
                        textStyle: {
                            color: '#fff',
                            fontSize: 14,
                        },
                    },
                    emphasis: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%',
                        textStyle: {
                            color: '#fff',
                            fontSize: 14,
                        },
                    },
                },
            };
            barChart.setOption(option);
            barChart.on('click', params => {
                //console.log(params.name);
                $scope.compareCity = params.name;
                $('#compareDialog').trigger('click');
            });
            if (isInitialize) {
                barChart.hideLoading();
            }
        },
    };

    /**echarts同比,环比折线图请求数据函数*/
    const lineCharts = {
        getSamePeriodLine: (isInitialize, loadingStyle) => {
            let lineChart = echarts.getInstanceByDom(document.getElementById('samePeriodChart'));
            if (isInitialize) {
                lineChart.showLoading(loadingStyle);
            }

            let contentX = ['10-26 00:00', '10-26 00:00', '10-26 00:00', '10-26 00:00', '10-26 00:00', '10-26 00:00', '10-26 00:00'];
            let contentY = [106395, 0, 106545, 106338, 106679, 0, 106461];

            let option = {
                title: {
                    text: '同比趋势——' + $scope.compareCity,
                    left: 'left',
                    top: 'top',
                    textStyle: {
                        fontWeight: 'bold',
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    formatter(arr) {
                        return '日期：' + arr[0].name + '<br/>数值：' + arr[0].value;
                    },
                },
                xAxis: {
                    type: 'category',
                    data: contentX,
                    axisLabel: {
                        interval: 0,
                        rotate: 45,
                    },
                    splitLine: {
                        show: false,
                    },
                    boundaryGap: false,
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    minInterval: 1,
                    splitLine: {
                        show: false,
                    },
                    splitArea: {
                        show: true,
                    },
                },
                series: [{
                    name: '',
                    type: 'line',
                    data: contentY,
                }],
            };
            lineChart.setOption(option);
            if (isInitialize) {
                lineChart.hideLoading();
            }
        },
        getChainPeriodLine: (isInitialize, loadingStyle) => {
            let lineChart = echarts.getInstanceByDom(document.getElementById('chainPeriodChart'));
            if (isInitialize) {
                lineChart.showLoading(loadingStyle);
            }

            let contentX = ['10-26 01:00', '10-26 02:00', '10-26 03:00', '10-26 04:00', '10-26 05:00', '10-26 06:00',
                '10-26 07:00', '10-26 08:00', '10-26 09:00', '10-26 10:00', '10-26 11:00', '10-26 12:00', '10-26 13:00',
                '10-26 14:00', '10-26 15:00', '10-26 16:00', '10-26 17:00', '10-26 18:00', '10-26 19:00', '10-26 19:00',
                '10-26 20:00', '10-26 21:00', '10-26 22:00', '10-26 23:00', '10-27 00:00'];
            let contentY = [106395, 0, 106545, 106338, 106679, 0, 106461, 0, 0, 0, 106395, 0, 106545, 106338, 106679,
                0, 106461, 80432, 50242, 106395, 0, 106545, 106338, 0, 0];

            let option = {
                title: {
                    text: '环比趋势——' + $scope.compareCity,
                    left: 'left',
                    top: 'top',
                    textStyle: {
                        fontWeight: 'bold',
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    formatter(arr) {
                        return '日期：' + arr[0].name + '<br/>数值：' + arr[0].value;
                    },
                },
                xAxis: {
                    type: 'category',
                    data: contentX,
                    axisLabel: {
                        interval: 0,
                        rotate: 45,
                    },
                    splitLine: {
                        show: false,
                    },
                    boundaryGap: false,
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    minInterval: 1,
                    splitLine: {
                        show: false,
                    },
                    splitArea: {
                        show: true,
                    },
                },
                series: [{
                    name: '',
                    type: 'line',
                    data: contentY,
                }],
            };

            lineChart.setOption(option);
            if (isInitialize) {
                lineChart.hideLoading();
            }
        },
    };

    /** 加载全部echarts图表 */
    const loadCharts = isInitialize => {
        let loadingStyle = {
            color: '#2BBCFF',
        };
        homeCharts.getGuangDongMap(isInitialize, loadingStyle, '', '', 60, $scope.timeSlot);
        homeCharts.getFlowBar(isInitialize, loadingStyle);
    };

    /** 初始化echarts加载图表 **/
    const initECharts = () => {
        /**地市图*/
        $('#gdMap').css('height', $('.left-side').height());
        echarts.init(document.getElementById('gdMap'));
        /**柱状图*/
        $('#flowBar').css('height', rightPanel.height() * 0.45);
        echarts.init(document.getElementById('flowBar'));
        /**同比环比*/
        $('.indicator-detail-view').find('.modal-content').css('height', window.screen.height * 0.85);
        $('.network-indicator-detail-chart').css('height', ($('.modal-content').height() - 35) * 0.49);
        echarts.init(document.getElementById('samePeriodChart'));
        echarts.init(document.getElementById('chainPeriodChart'));
        /**表格*/
        $('.tab-record').css('height', rightPanel.height() * 0.48);
        loadCharts(true);
    };

    /**数据表控件配置===============================================*/
    /**分页控件配置*/
    $scope.pageConfig = {
        rules: {
            selectPage: 1,
            lineNum: 10,//显示行数
            displayPage: 5,//用来设置遍历数组显示页数
            initDisplayPage: 5,//当点击...到第一页的时候加载这个,需和displayPage设置相同
            pageCount: 50,//最大页
            morePage: 5,//...按钮所展示的页数
            isLoading: false,//正在加载中
            onChangePage() {//页面变更回调
                $scope.rulesGridApi.pagination.seek($scope.pageConfig.rules.selectPage);
            },
        },
        records: {
            selectPage: 1,
            lineNum: 10,//显示行数
            displayPage: 5,//用来设置遍历数组显示页数
            initDisplayPage: 5,//当点击...到第一页的时候加载这个,需和displayPage设置相同
            pageCount: 50,//最大页
            morePage: 5,//...按钮所展示的页数
            isLoading: false,//正在加载中
            onChangePage() {//页面变更回调
                $scope.recordGridApi.pagination.seek($scope.pageConfig.records.selectPage);
            },
        },
    };
    /** 初始化数据表 */
    const initAutoAlertStatisticsGrid = () => {
        $scope.statisticsGridOptions = {
            enablePaginationControls: false,
            useExternalPagination: true,
            paginationPageSizes: [10, 20, 30],
            paginationPageSize: 10,
            cellTooltip: true,
            paginationTemplate: '<div></div>', //自定义底部分页代码
            //exporterCsvFilename: getCHByUS(selectedDimensionGroup) + '-' + ($scope.selectAlertValue.value === 'activeAlert' ? '活动' : '历史') + '.csv',
            exporterOlderExcelCompatibility: true,
            columnDefs: dataGridDefs,
            data: [
                {
                    timeName: '2017/10/10 12',
                    cityName: '深圳',
                    totalFlow: 23,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 99,
                    tcpReloadRate: 1.7,
                },
                {
                    timeName: '2017/10/10 12',
                    cityName: '广州',
                    totalFlow: 23,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 97,
                    tcpReloadRate: 1.3,
                },
                {
                    timeName: '2017/10/10 12',
                    cityName: '佛山',
                    totalFlow: 23,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 92.5,
                    tcpReloadRate: 3.95,
                },
                {
                    timeName: '2017/10/10 12',
                    cityName: '东莞',
                    totalFlow: 23,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 98.3,
                    tcpReloadRate: 2.1,
                },
                {
                    timeName: '2017/10/10 12',
                    cityName: '中山',
                    totalFlow: 23,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 93.65,
                    tcpReloadRate: 0.9,
                },
                {
                    timeName: '2017/10/10 12',
                    cityName: '韶关',
                    totalFlow: 23,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 80.07,
                    tcpReloadRate: 1,
                },
                {
                    timeName: '2017/10/10 13',
                    cityName: '深圳',
                    totalFlow: 22,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 99,
                    tcpReloadRate: 1.7,
                },
                {
                    timeName: '2017/10/10 13',
                    cityName: '广州',
                    totalFlow: 22,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 97,
                    tcpReloadRate: 1.3,
                },
                {
                    timeName: '2017/10/10 13',
                    cityName: '佛山',
                    totalFlow: 22,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 92.5,
                    tcpReloadRate: 3.95,
                },
                {
                    timeName: '2017/10/10 13',
                    cityName: '东莞',
                    totalFlow: 22,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 98.3,
                    tcpReloadRate: 2.1,
                },
                {
                    timeName: '2017/10/10 13',
                    cityName: '中山',
                    totalFlow: 22,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 93.65,
                    tcpReloadRate: 0.9,
                },
                {
                    timeName: '2017/10/10 13',
                    cityName: '韶关',
                    totalFlow: 22,
                    downloadFlow: 12,
                    uploadFlow: 11,
                    dnsAnalysisSuccessRate: 80.07,
                    tcpReloadRate: 1,
                },
            ],
        };
        $scope.statisticsGridOptions.appScopeProvider = $scope;
        $scope.statisticsGridOptions.onRegisterApi = function (gridApi) {
            $scope.recordGridApi = gridApi;
            gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
                // if (getStatisticsData) {
                //     getAutoAlertStatistics(newPage, pageSize);
                // }
            });
            gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
                // if (getStatisticsData) {
                //     if (sortColumns.length > 0) {
                //         paginationOptions.sort = sortColumns[0].sort.direction;
                //     } else {
                //         paginationOptions.sort = null;
                //     }
                //     getAutoAlertStatistics(grid.options.paginationPageSize, grid.options.paginationCurrentPage);
                // }
            });
        };
    };
    /**数据表加载数据*/
    const setDataForGrid = () => {
        let columns = [];
        rulesGridDefs.map(item => {
            let column;
            if (item.name === 'timeName') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('timeName'),
                    width: 100,
                }
            } else if (item.name === 'cityName') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('cityName'),
                    width: 100,
                }
            } else if (item.name === 'totalFlow') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('totalFlow'),
                    width: 300,
                }
            } else if (item.name === 'downloadFlow') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('downloadFlow'),
                    width: 300,
                }
            } else if (item.name === 'uploadFlow') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('uploadFlow'),
                    width: 300,
                }
            } else if (item.name === 'dnsAnalysisSuccessRate') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('dnsAnalysisSuccessRate'),
                    width: 350,
                }
            } else if (item.name === 'tcpReloadRate') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('tcpReloadRate'),
                    width: 270,
                }
            } else {
                column = item;
            }
            columns.push(column);
        });
        $scope.statisticsGridOptions.columnDefs = columns;
        //getAutoAlertRuleList(curPageIndex, curPageSize);
    };
    /**自定义单元格template*/
    const setCelltemplate = type => {
        if (type === 'firstTriggeredTime') {
            return '<span>{{grid.appScope.unixChangeCommonTime(row.entity.firstTriggeredTime)}}</span>'
        }
        switch (type) {
            case 'timeName':
                break;
            case 'cityName':
                break;
            case 'totalFlow':
                break;
            case 'downloadFlow':
                break;
            case 'uploadFlow':
                break;
            case 'dnsAnalysisSuccessRate':
                break;
            case 'tcpReloadRate':
                break;
        }
    };
    /**===========================================================*/


    /** 初始化加载Controller */
    const initController = () => {
        /** 初始化下拉列表中加载数据*/
        initSelectData();
        /**初始化时间控件*/
        initDatetimepicker();
        /** 初始化echarts加载图表 */
        initECharts();
        /** 初始化数据表 */
        initAutoAlertStatisticsGrid();
    };
    initController();
}
DataDirectCityAnalysisController.$inject = ['$scope', '$filter', 'HttpRequestService'];