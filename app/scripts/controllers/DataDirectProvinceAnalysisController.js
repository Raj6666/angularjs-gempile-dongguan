'use strict';

const echarts = require('echarts');
import swal from 'sweetalert2';
import APIS from '../configs/ApisConfig';
import Loading from '../custom-pulgin/Loading';
import {NOW,ONE_HOUR_MS} from '../constants/CommonConst';
import DefaultData from '../data/DataDirectAnalysisDataConfig';
import {formatYText} from '../service/DataCtrlService';

/**
 * Data Direct Province Analysis Controller
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function DataDirectProvinceAnalysisController($scope, $filter, HttpRequestService) {
    // /** 统计时间，早上5点更新，显示前一天数据 */
    // const analysisTime = NOW  - ((NOW + (ONE_HOUR_MS * 8) - (ONE_HOUR_MS * 5)) % ONE_DAY_MS) - ONE_DAY_MS - (ONE_HOUR_MS * 5);
    // $scope.currentDayTime = $filter('date')(analysisTime, 'yyyy-MM-dd');
    // $scope.currentStatisticalTime = '统计时间： ' + $scope.currentDayTime;
    /**面板实例*/
    let rightPanel = $('.right-side');
    let leftPanel = $('.left-side');
    /**查询下拉框设置===============================================================*/
    // let testOptions2 = [
    //     {
    //         id: 11,
    //         label: '1限定ke户',
    //     },
    //     {
    //         id: 21,
    //         label: '1限定商家',
    //     },
    //     {
    //         id: 31,
    //         label: '1限定使用次数',
    //     },
    //     {
    //         id: 41,
    //         label: '1限定药品',
    //     },
    //     {
    //         id: 51,
    //         label: '1与其它优惠共享',
    //     }];
    /**更新时间*/
    $scope.upDateDate = (timeSlots, isWarning) => {
        $scope.timeSlots = timeSlots;
        $scope.isWarning = isWarning;
    };
    /**select内容翻译*/
    $scope.selectorText = {
        checkAll: '选择全部',
        uncheckAll: '取消全部',
        buttonDefaultText: '请选择',
        dynamicButtonTextSuffix: '个选择',
        searchPlaceholder: '搜索',
    };
    /**select内容翻译*/
    $scope.selectorTemplateDelete = {
        checkAll: '选择全部',
        uncheckAll: '取消全部',
        buttonDefaultText: '',
        dynamicButtonTextSuffix: '个选择',
        searchPlaceholder: '搜索',
        deleteItemText: '删除模板',
    };
    /**选择模板*/
    $scope.templateSetting = {
        scrollableHeight: '140px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        enableSearch: true,
        enableDelete: true,
        selectionLimit: 1,
        selectedToTop: true,
        idProperty: 'id',
        displayProp: 'name',
        searchField: 'name',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.templateOptions = [];
    $scope.templateEvents = {
        onItemSelect: item => {
            selectedTemplate(item);
            $scope.templateText = '更新模板';
        },
        onItemDeselect: () => {
            $scope.templateText = '保存模板';
        },
        onDeleteItem: item => {
            swal({
                title: '确认删除该模板',
                text: item.name,
                type: 'warning',
                confirmButtonText: '确认删除',
                showCancelButton: true,
                cancelButtonText: '取消删除',
                cancelButtonColor: '#DD3333',
                allowOutsideClick: false,
            }).then(() => {
                let requestBody = {
                    id: item.id,
                };
                let url = APIS.template.templates + requestBody.id;
                HttpRequestService.put(url, {}, requestBody, () => {
                    getTemplates();
                    swal({
                        text: '删除模板成功!',
                        type: 'success',
                        allowOutsideClick: false,
                    });
                    $scope.template = [];
                    $scope.templateText = '保存模板';
                }, () => {
                    swal({
                        text: '删除模板失败!',
                        type: 'error',
                        allowOutsideClick: false,
                    });
                });
            })
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
        onItemSelect:item => {
            $scope.dateInterval= item.value + '';
        },
    };
    /**省份选择设置*/
    $scope.provinceOptions = DefaultData.provinceOptions;
    $scope.provinceSetting = {
        scrollableHeight: '250px',
        showCheckAll: true,
        showUncheckAll: true,
        scrollable: true,
        enableSearch: true,
        checkBoxes: true,
        idProperty: 'id',
        searchField: 'label',
        closeOnSelect: false,
        buttonClasses: 'btn btn-default select-width-140',
    };
    /**所选业务大类设置*/
    let isSelectApplicationType = false;
    let isSelectAllApplicationTypes = false;
    $scope.applicationTypeOptions = [];
    $scope.applicationTypeSetting = {
        checkBoxes: true,
        scrollableHeight: '250px',
        showCheckAll: true,
        showUncheckAll: true,
        scrollable: true,
        enableSearch: true,
        selectionLimit: 0,
        idProperty: 'id',
        displayProp: 'name',
        searchField: 'name',
        buttonClasses: 'btn btn-default select-width-140',
    };
    $scope.applicationTypeEvents = {
        onItemSelect: () => {
            selectData.getApplication($scope.applicationModel);
            isSelectAllApplicationTypes = $scope.applicationTypeModel.length === $scope.applicationTypeOptions.length;
        },
        onItemDeselect: () => {
            if($scope.applicationTypeModel.length <= 0){
                $scope.applicationOptions = [];
                $scope.applicationModel = [];
            }else{
                selectData.getApplication($scope.applicationModel);
            }
            isSelectAllApplicationTypes = false;
            //isSelectAll = false;
        },
        onSelectAll: () => {
            selectData.getApplication($scope.applicationModel);
            isSelectAllApplicationTypes = true;
            //isSelectAll = false;
        },
        onDeselectAll: () => {
            //selectData.getApplication($scope.applicationModel);
            // $scope.applicationOptions = $scope.applicationModel;
            $scope.applicationOptions = [];
            $scope.applicationModel = [];
            isSelectAllApplicationTypes = false;
        },
    };
    $scope.applicationTypeIsWarning = {
        isSearched : false,
        isWarned : false,
    };
    /**所选业务小类设置*/
    let allApplication = [];
    let allApplicationForSearch = [];
    let isSelectApplication = false;
    let isSelectAllApplications = false;
    //let isSelectAll = false;
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
        searchField: 'name',
        smartButtonTextProvider(selectionArray) {
            if (isSelectAllApplications) {
                return '已选择全部';
            }
            return selectionArray.length + ' 个选择';
        },
    };
    $scope.applicationOptions = [];
    $scope.applicationEvents = {
        asyncSearchOptions: searchFilter => {
            let searchOption = [];
            let counter = 0;
            for (let i = 0; i < allApplicationForSearch.length; i++) {
                if (allApplicationForSearch[i].name.indexOf(searchFilter) >= 0) {
                    searchOption.push(allApplicationForSearch[i]);
                    counter++;
                }
                if (counter > 20) {
                    break;
                }
            }
            $scope.applicationSearchOptions = searchOption;
        },
        onSelectAll: () => {
            //isSelectAll = true;
            if($scope.applicationOptions.length != 0){
                isSelectAllApplications = true;
            }else{
                isSelectAllApplications = false;
            }
            // $scope.applicationGroups = '';
            // $scope.applicationTypeModel.map(model => {
            //     $scope.applicationGroups += model.applicationType + ',-1;'
            // })
        },
        onDeselectAll: () => {
            //isSelectAll = false;
            isSelectAllApplications = false;
            // $scope.applicationGroups = '';
        },
        onItemDeselect: () => {
            //isSelectAll = false;
            isSelectAllApplications = false;
            // $scope.applicationGroups = '';
        },
        onItemSelect: () => {
            isSelectAllApplications = false;
        },
    };
    $scope.applicationIsWarning = {
        isSearched : false,
        isWarned : false,
    };
    /**指标选择设置*/
    let groupIndicators = [];
    let indicators = [];
    $scope.indicatorSetting = {
        //checkBoxes: true,
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        buttonClasses: 'btn btn-default select-width-170',
        idProperty: 'id',
        displayProp: 'name',
        searchField: 'name',
        alignRight: true,

        groupByTextProvider: groupValue => groupIndicators[groupValue],
        groupBy: 'parentId',
    };
    $scope.indicatorOptions = indicators;
    $scope.indicatorEvents = {
        // onItemSelect: item => {
        //     //console.log($scope.indicatorModel);
        // },
        onItemDeselect: () => {
            if ($scope.indicatorModel.length === 0) {
                $scope.singleIndicatorModel = [{
                    id: 103,
                    name: '总流量',
                    parameter: 'total_ip_len',
                }];
            }
        },
        onDeselectAll: () => {
            $scope.singleIndicatorModel = [{
                id: 103,
                name: '总流量',
                parameter: 'total_ip_len',
            }];
        },
    };
    $scope.indicatorIsWarning = {
        isSearched : false,
        isWarned : false,
    };
    /**设置默认选项*/
    $scope.template = []; //选择模板
    $scope.interval = [{
        id: 2,
        label: '小时',
        value: 60,
    }];//时间粒度
    $scope.provinceModel = [{
        id: 0,
        label: '广东省',
        value: '44',
    }]; //省份
    $scope.provinceIsWarning = {
        isSearched : false,
        isWarned : false,
    };
    $scope.applicationTypeModel = []; //业务大类
    $scope.indicatorModel = [{
        id: '103',
        name: '总流量',
        parameter: 'total_ip_len',
        unit: 'Mb',
    }]; //指标
    $scope.applicationModel = [];//业务小类
    $scope.applicationGroups = '';

    /**定义时间变量*/
        //let startDate;
    let endDate = NOW;
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
        /**所选大类的业务小类(前100个)*/
        getApplication: model => {
            /**请求对应的业务小类*/
            $scope.applicationOptions = [];
            $scope.applicationModel = [];
            //let applicationTypes = '';
            let applicationTypesArray = [];

            new Promise((resolve, reject) => {
                // let applicationType = $scope.applicationTypeModel;
                // resolve(applicationType);
                resolve($scope.applicationTypeModel);
            }).then(() => {
                $scope.applicationTypeModel.map(type => {
                    //applicationTypes += type.applicationType + ',';
                    applicationTypesArray.push(type.applicationType);
                });
                /**获取所选的大类的前100个类*/
                    // selectData.getApplication(applicationTypes);
                let url = APIS.application.applications;
                let param = {
                    applicationTypes: Array.isArray(applicationTypesArray) ? applicationTypesArray.join(',') : null,
                    pageIndex: 1,
                    pageSize: 100,
                };
                HttpRequestService.get(url, param, data => {
                    $scope.applicationOptions = data;
                    if (model) {
                        model.map(item => {
                            /**之前选的小类是否包含在新的大类中*/
                            $scope.applicationTypeModel.map(type => {
                                if (type.applicationType == item.applicationType) {
                                    /**若前100个小类中没有之前所选的小类，则进行添加*/
                                    if ($scope.applicationOptions.indexOf(item) == -1) {
                                        $scope.applicationOptions.push(item);
                                    }
                                    $scope.applicationModel.push(item);
                                }
                            })
                        });

                        /**数组去重*/
                        new Promise((resolve, reject) => {
                            let distinctOptions = $scope.applicationOptions;
                            model.map(item => {
                                let hasModel = 0;
                                let arrayLength = distinctOptions.length;
                                for (let i = 0; i < arrayLength; i++) {
                                    if (distinctOptions[i]) {
                                        if (distinctOptions[i].id === item.id) {
                                            hasModel++;
                                            if (hasModel == 2) {
                                                delete distinctOptions[i];
                                            }
                                        }
                                    }
                                }
                            });
                            resolve(distinctOptions);
                        }).then(distinctOptions => {
                            $scope.applicationOptions = distinctOptions;
                        });
                    }
                    //$scope.applicationModel = model;
                });
                /**根据所选的大类，把所有所选的小类填充到异步查询所用数组*/
                allApplicationForSearch = [];
                applicationTypesArray.map(selectedType => {
                    allApplication.map(app => {
                        if (app.applicationType == selectedType) {
                            app.branches.map(appInBranches => {
                                allApplicationForSearch.push(appInBranches);
                            })
                        }
                    });
                });
            });
            // console.log(allApplicationForSearch);
        },
        /**指标*/
        getIndicatorlist: () => {
            let url = APIS.indicator.indicators;
            let params = {
                module: 'DataDirect',
                isTree: true,
            };
            HttpRequestService.get(url, params, response => {
                response.map(indicator => {
                    if (indicator.branches) {
                        groupIndicators[indicator.id + ''] = indicator.name;
                        indicator.branches.map(subIndicator => {
                            indicators.push(subIndicator);
                        });
                    }
                });
            })
        },
        /**所有业务小类*/
        getAllApplication: () => {
            let url = APIS.application.applications + '/tree';
            let param = {};
            HttpRequestService.get(url, param, data => {
                //console.log(data);
                allApplication = data;
            });
        },
    };

    /** 初始化下拉列表中数据*/
    const initSelectData = () => {
        selectData.getApplicationType();
        selectData.getIndicatorlist();
    };

    /**获取数组中的最大值*/
    Array.prototype.max = function () {
        return Math.max.apply({}, this)
    };

    /**点击下拉箭头*/
    $scope.showSearchPanel = true;
    $scope.togglePanel = () => {
        $scope.showSearchPanel = !$scope.showSearchPanel;
        $('#query-panel-body').slideToggle('normal');
    };

    /**查询栏校验*/
    const checkQueryItems = () => {
        let isSeletedDate = false;
        let isSeletedProvince = false;
        let isSeletedIndicator = false;
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
        //省份未选时
        if ($scope.provinceModel.length <= 0){
            $scope.provinceIsWarning .isWarned = true;
            $scope.provinceIsWarning.isSearched = true;
            isSeletedProvince = false;
        } else {
            $scope.provinceIsWarning .isWarned = false;
            $scope.provinceIsWarning.isSearched = false;
            isSeletedProvince = true;
        }
        // if ($scope.indicatorModel.length <= 0) {
            // /**大类未选时*/
            // if ($scope.applicationOptions.length <= 0) {
            //     $scope.applicationTypeIsWarning.isWarned = true;
            //     $scope.applicationTypeIsWarning.isSearched = true;
            // } else {
            //     $scope.applicationTypeIsWarning.isWarned = false;
            //     $scope.applicationTypeIsWarning.isSearched = false;
            // }
            // /**小类未选时*/
            // if ($scope.applicationModel.length <= 0) {
            //     //warining += '请至少选择一个业务小类\n';
            //     $scope.applicationIsWarning.isWarned = true;
            //     $scope.applicationIsWarning.isSearched = true;
            // }
            // else {
            //     $scope.applicationIsWarning.isWarned = false;
            //     $scope.applicationIsWarning.isSearched = false;
            // }
            /**指标未选时*/
            if ($scope.indicatorModel.length <= 0) {
                //warining += '请至少选择一个指标\n';
                $scope.indicatorIsWarning.isWarned = true;
                $scope.indicatorIsWarning.isSearched = true;
                isSeletedIndicator = false;
            } else {
                $scope.indicatorIsWarning.isWarned = false;
                $scope.indicatorIsWarning.isSearched = false;
                isSeletedIndicator = true;
            }
        // }
        // resetCheckQueryItems();
        return isSeletedDate && isSeletedProvince && isSeletedIndicator;
    };
    /**查询栏校验恢复*/
    const resetCheckQueryItems = () => {
        $scope.applicationTypeIsWarning.isWarned = false;
        $scope.applicationTypeIsWarning.isSearched = false;
        $scope.applicationIsWarning.isWarned = false;
        $scope.applicationIsWarning.isSearched = false;
        $scope.indicatorIsWarning.isWarned = false;
        $scope.indicatorIsWarning.isSearched = false;
        $scope.provinceIsWarning.isWarned = false;
        $scope.provinceIsWarning.isSearched = false;
    };

    /** 点击查询*/
    $scope.searchData = isInitialize => {
        if (checkQueryItems()) {
            let loadingStyle = {
                color: '#2BBCFF',
            };
            let provinceNames = '';
            for (let i = 0; i < $scope.provinceModel.length; i++) {
                provinceNames += $scope.provinceModel[i].value + ',';
            }
            // if (!isSelectAll) {
            //     $scope.applicationGroups = '';
            //     $scope.applicationModel.map(model => {
            //         $scope.applicationGroups += model.applicationType + ',' + model.application + ';'
            //     });
            // }
            /**业务大小类判断**/
            //小类全选时
            if (isSelectAllApplications) {
                  //大类全选，小类全选
                if (isSelectAllApplicationTypes) {
                    $scope.applicationGroups = '-1,-1';
                    isSelectApplicationType = true;
                    isSelectApplication = true;
                  //大类不选,小类全选
                } else if (!Array.isArray($scope.applicationTypeModel) || $scope.applicationTypeModel.length === 0) {
                    $scope.applicationGroups = '';
                    isSelectApplicationType = false;
                    isSelectApplication = false;
                  //大类选部分，小类全选
                } else {
                    let applicationGroupString = [];
                    $scope.applicationTypeModel.map(thisApplicationType => {
                        applicationGroupString.push(thisApplicationType.applicationType + ',-1');
                    });
                    $scope.applicationGroups = applicationGroupString.join(';');
                    isSelectApplicationType = true;
                    isSelectApplication = true;
                }
            //小类不选时
            } else if (!Array.isArray($scope.applicationModel) || $scope.applicationModel.length === 0) {
                //大类全选，小类不选
                if (isSelectAllApplicationTypes) {
                    $scope.applicationGroups = '-1,';
                    isSelectApplicationType = true;
                    isSelectApplication = false;
                //大类不选，小类不选
                } else if (!Array.isArray($scope.applicationTypeModel) || $scope.applicationTypeModel.length === 0) {
                    $scope.applicationGroups = '';
                    isSelectApplicationType = false;
                    isSelectApplication = false;
                //大类选部分，小类不选
                } else {
                    let applicationGroupString = [];
                    $scope.applicationTypeModel.map(thisApplicationType => {
                        applicationGroupString.push(thisApplicationType.applicationType + ',');
                    });
                    $scope.applicationGroups = applicationGroupString.join(';');
                    isSelectApplicationType = true;
                    isSelectApplication = false;
                }
            //小类选部分时
            } else {
                //大类选部分，小类选部分
                let applicationGroupString = [];
                $scope.applicationModel.map(thisApplication => {
                    applicationGroupString.push(thisApplication.applicationType + ',' + thisApplication.application);
                });
                $scope.applicationGroups = applicationGroupString.join(';');
                isSelectApplicationType = true;
                isSelectApplication = true;
            }

            /**成功查询后更新柱形图可选择的指标数据，与搜索栏的指标同步*/
            if($scope.indicatorSelectedModel.length == 0){
                $scope.indicatorSelectedModel = [{
                    id: '103',
                    name: '总流量',
                    parameter: 'total_ip_len',
                    unit: 'Mb',
                }];
            }
            $scope.indicatorSelectedOptions = [];
            $scope.indicatorModel.map(item => {
                $scope.indicatorSelectedOptions.push(item);
            });
            /**成功查询后重置柱形图的已选指标数据为总流量*/
            $scope.indicatorSelectedModel = [{
                id: '103',
                name: '总流量',
                parameter: 'total_ip_len',
                unit: 'Mb',
            }];
            /**成功查询后更新‘结束时间’，用于柱形图的点击，表格中出口的点击*/
            endDate = $scope.timeSlots.endDate;
            $scope.endTimeStore = $scope.timeSlots.endDate;
            /**重新渲染地图与柱形图*/
            Loading.isLoading('#chinaMap');
            Loading.isLoading('#flowBar');
            homeCharts.getChinaMap(isInitialize, loadingStyle, provinceNames, '103', $scope.applicationGroups, $scope.interval[0].value,$scope.timeSlots.startDate + ','+ $scope.timeSlots.endDate);
            homeCharts.getFlowBar(isInitialize, loadingStyle, provinceNames, $scope.indicatorSelectedModel[0].id, $scope.applicationGroups, $scope.interval[0].value,$scope.timeSlots.startDate + ','+ $scope.timeSlots.endDate);
            /**请求表格数据*/
            Loading.isLoading('.tab-record');
            getDataForGrid();
            /**结束请求后收起查询栏*/
            $scope.togglePanel();
            /**点击查询后刷新状态为已点击查询（用于更新同比环比界面）*/
            searchClicked = true;
            /**成功查询后取消红框*/
            resetCheckQueryItems();
            /**保存查询参数*/
            paramForSearch.dimensionValues = provinceNames;
            paramForSearch.indicatorIds = $scope.indicatorSelectedModel[0].id;
            paramForSearch.applicationGroups = $scope.applicationGroups;
            paramForSearch.interval = $scope.interval[0].value;
            paramForSearch.timeSlot = $scope.timeSlots.startDate + ','+ $scope.timeSlots.endDate;
            /**查询后才可使用指标趋势的指标选择功能*/
            isAllowSwitch = true;
        }
    };
    /**初始化模板*/
    const getTemplates = () => {
        let url = APIS.template.templates + 'dataDirectProvinceAnalysis';
        let params = {};
        HttpRequestService.get(url, params, response => {
            if (response) {
                $scope.templateOptions = response;
            }
        });
        // console.log($scope.templateOptions);
    };

    /**选择模板*/
    const selectedTemplate = template => {
        getTemplates();
        $scope.template = [];
        $scope.template.push(template);
        $scope.provinceModel = template.provinceModel;
        $scope.applicationTypeModel = template.applicationTypeModel;
        $scope.applicationModel = template.applicationModel;
        $scope.indicatorModel = template.indicatorModel;
        $scope.interval = template.interval;
        $scope.timeSlots=template.timeSlots;
        /*同步更新时间粒度到日期选择控件中*/
        $scope.dateInterval = $scope.interval[0].value + '';
        //startDate = template.startDate;
        endDate = template.endDate;
        $scope.endTimeStore = endDate;
        /**重新请求对应的业务小类*/
        $scope.applicationOptions = [];
        selectData.getApplication($scope.applicationModel);
        /**是否全选业务小类*/
        isSelectAllApplications = template.isSelectAllApplication;
        if(isSelectAllApplications){
            $scope.applicationGroups = '';
            $scope.applicationTypeModel.map(model => {
                $scope.applicationGroups += model.applicationType +',-1;'
            })
        }
        /**更新同比环比列表*/
        $scope.singleIndicatorOptions = $scope.indicatorModel;
    };

    /**保存模板*/
    $scope.saveTemplate = () => {
        if (!$scope.templateOptions) {
            getTemplates();
        }
        if (checkQueryItems()) {
            if ($scope.template.length <= 0) {
                swal({
                    text: '请输入模板名称',
                    input: 'text',
                    confirmButtonText: '确认',
                    showCancelButton: true,
                    cancelButtonText: '取消',
                    cancelButtonColor: '#DD3333',
                    allowOutsideClick: false,
                    preConfirm(input) {
                        return new Promise((resolve, reject) => {
                            $scope.templateOptions.map(template => {
                                if (template.name === input) {
                                    reject('已有“'+input+'”模板，请重新输入名称');
                                }
                            });
                            if (input.length === 0) {
                                reject('输入内容不能为空！');
                            } else if (input.length > 20) {
                                reject('模版名称不大于20个字符！');
                            } else if ($filter('inputIsIllegal')(input, 'templateName')) {
                                resolve();
                            } else {
                                reject('只能使用中文、英文、数字、下划线或者连字符');
                            }
                        })
                    },
                }).then(input => {
                    $scope.startTime = $scope.startTimeMin;
                    $scope.endTime = $scope.endTimeMin;
                    let requestBody = {
                        scope: 'dataDirectProvinceAnalysis',
                        name: input,
                        provinceModel: $scope.provinceModel,
                        applicationTypeModel: $scope.applicationTypeModel,
                        applicationModel: $scope.applicationModel,
                        indicatorModel: $scope.indicatorModel,
                        interval: $scope.interval,
                        timeSlots:$scope.timeSlots,
                        startDate: $scope.timeSlots.startDate,
                        endDate: $scope.timeSlots.endDate,
                        isSelectAllApplication: isSelectAllApplications,
                    };
                    let url = APIS.template.templates + 'dataDirectProvinceAnalysis';
                    HttpRequestService.post(url, {}, requestBody, response => {
                        getTemplates();
                        let subUrl = APIS.template.templates + 'dataDirectProvinceAnalysis/' + response;
                        HttpRequestService.get(subUrl, {}, subResponse => {
                            selectedTemplate(subResponse);
                        });
                        swal({
                            text: '添加模板成功!',
                            type: 'success',
                            allowOutsideClick: false,
                        });
                        $scope.templateText = '更新模板';
                        resetCheckQueryItems();
                    }, () => {
                        swal({
                            text: '添加模板失败!',
                            type: 'error',
                            allowOutsideClick: false,
                        });
                    });
                }, () => ({}));
            } else {
                swal({
                    title: '更新模板',
                    inputValue: $scope.template[0].name,
                    showConfirmButton: false,
                    html:
                    '<input id="templateInput" class="swal2-input"  style="display: block;"/>' +
                    '<div id="templateValidationError" class="swal2-validationerror" style="display: block;"></div>' +
                    '<button id="templateUpdate" class="templateButton confirmBtn swal2-styled">更新</button>&nbsp' +
                    '<button id="templateSave" class="templateButton confirmBtn swal2-styled">另存为</button>&nbsp' +
                    '<button id="templateCancel" class="templateButton cancelBtn swal2-styled" style="">取消</button>',
                    customClass: 'templateButton',
                });
                $('#templateInput').val($scope.template[0].name);
                //模板更新
                $('#templateUpdate').click(() => {
                    templateUpdate($('#templateInput').val());
                });
                //模板另存为
                $('#templateSave').click(() => {
                    templateSave($('#templateInput').val());
                });
                $('#templateCancel').click(() => {
                    swal.close();
                })
            }
        }
    };
    /**保存模板按钮字段*/
    $scope.templateText = '保存模板';
    /**保存方法*/
    let templateSave = input => new Promise((resolve, reject) =>
    {
        let errorText = '';
        $scope.templateOptions.map(template => {
            if (template.name === input) {
                errorText = '已有“'+input+'”模板，请重新输入名称';
            }
        });
        if(errorText !== '已有“'+input+'”模板，请重新输入名称'){
            if (input.length === 0) {
                errorText = '输入内容不能为空！';
            } else if (input.length > 20) {
                errorText = '模版名称不大于20个字符！';
            } else if ($filter('inputIsIllegal')(input, 'templateName')) {
                errorText = '';
            } else {
                errorText = '只能使用中文、英文、数字、下划线或者连字符';
            }
        }
        if(errorText.length > 0){
            $('#templateValidationError').css('display','block');
            $('#templateValidationError').text(errorText);
            reject();
        }else{
            $('#templateValidationError').css('display','none');
            resolve();
        }
    }).then(() =>
    {
        $scope.startTime = $scope.startTimeMin;
        $scope.endTime = $scope.endTimeMin;
        let requestBody = {
            scope: 'flowProvincetAnalysis',
            name: input,
            provinceModel: $scope.provinceModel,
            applicationTypeModel: $scope.applicationTypeModel,
            applicationModel: $scope.applicationModel,
            indicatorModel: $scope.indicatorModel,
            interval: $scope.interval,
            timeSlots:$scope.timeSlots,
            startDate: $scope.timeSlots.startDate,
            endDate: $scope.timeSlots.endDate,
            isSelectAllApplication: isSelectAllApplications,
        };
        let url = APIS.template.templates + 'dataDirectProvinceAnalysis';
        HttpRequestService.post(url, {}, requestBody, response => {
            getTemplates();
            let subUrl = APIS.template.templates + 'dataDirectProvinceAnalysis/' + response;
            HttpRequestService.get(subUrl, {}, subResponse => {
                selectedTemplate(subResponse);
            });
            swal({
                text: '添加模板成功!',
                type: 'success',
                allowOutsideClick: false,
            });
            resetCheckQueryItems();
        }, () => {
            swal({
                text: '添加模板失败!',
                type: 'error',
                allowOutsideClick: false,
            });
        });
    },() => ({}));
    /**更新方法*/
    let templateUpdate = input => new Promise((resolve, reject) =>
    {
        let errorText = '';
        // $scope.templateOptions.map(template => {
        //     if (template.name === input) {
        //         errorText = '该模版名称已被其他模版使用！';
        //     }
        // });
        if(errorText !== '该模版名称已被其他模版使用！'){
            if (input.length === 0) {
                errorText = '输入内容不能为空！';
            } else if (input.length > 20) {
                errorText = '模版名称不大于20个字符！';
            } else if ($filter('inputIsIllegal')(input, 'templateName')) {
                errorText = '';
            } else {
                errorText = '只能使用中文、英文、数字、下划线或者连字符';
            }
        }
        if(errorText.length > 0){
            $('#templateValidationError').css('display','block');
            $('#templateValidationError').text(errorText);
            reject();
        }else{
            $('#templateValidationError').css('display','none');
            resolve();
        }
    }).then(() =>
    {
        let requestBody = {
            scope: 'dataDirectProvinceAnalysis',
            name: input,
            id: $scope.template[0].id,
            provinceModel: $scope.provinceModel,
            applicationTypeModel: $scope.applicationTypeModel,
            applicationModel: $scope.applicationModel,
            indicatorModel: $scope.indicatorModel,
            interval: $scope.interval,
            timeSlots:$scope.timeSlots,
            startDate: $scope.timeSlots.startDate,
            endDate: $scope.timeSlots.endDate,
            isSelectAllApplication: isSelectAllApplications,
        };
        let url = APIS.template.templates + 'dataDirectProvinceAnalysis';
        HttpRequestService.put(url, {}, requestBody, () => {
            getTemplates();
            swal({
                text: '更新模板成功!',
                type: 'success',
                allowOutsideClick: false,
            });
            let subUrl = APIS.template.templates + 'dataDirectProvinceAnalysis/' + requestBody.id;
            HttpRequestService.get(subUrl, {}, subResponse => {
                $scope.template = [];
                $scope.template.push(subResponse);
            });
            resetCheckQueryItems();
        }, () => {
            swal({
                text: '更新模板失败!',
                type: 'error',
                allowOutsideClick: false,
            });
        });
    }, () => ({}));
    /**===========================================================================*/

    /**同比环比具体地市*/
    $scope.compareCity = '';
    $scope.compareEndTime = '';
    let searchClicked = false;
    /**同比环比指标选择*/
    $scope.$watch($scope.indicatorModel, () => {
        $scope.singleIndicatorOptions = $scope.indicatorModel;
    });
    $scope.singleIndicatorSetting = {
        scrollableHeight: '140px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        enableSearch: true,
        selectionLimit: 1,
        idProperty: 'id',
        displayProp: 'name',
        searchField: 'name',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default select-width-190',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.singleIndicatorModel = [{
        id: '103',
        name: '总流量',
        parameter: 'total_ip_len',
        unit: 'Mb',
    }];
    $scope.singleIndicatorEvents = {
        onItemSelect: item => {
            let loadingStyle = {
                color: '#c1080d',
            };
            lineCharts.getChainPeriodLine(true, loadingStyle, $scope.compareCity,
                $scope.applicationGroups, paramForSearch.interval, endDate, item.parameter);
            lineCharts.getSamePeriodLine(true, loadingStyle, $scope.compareCity,
                $scope.applicationGroups, paramForSearch.interval, endDate, item.parameter);
        },
        onItemDeselect: () => {
            let loadingStyle = {
                color: '#c1080d',
            };
            $scope.singleIndicatorModel = [{
                id: '103',
                name: '总流量',
                parameter: 'total_ip_len',
                unit: 'Mb',
            }];
            lineCharts.getChainPeriodLine(true, loadingStyle, $scope.compareCity,
                $scope.applicationGroups, paramForSearch.interval, endDate, $scope.singleIndicatorModel[0].parameter);
            lineCharts.getSamePeriodLine(true, loadingStyle, $scope.compareCity,
                $scope.applicationGroups, paramForSearch.interval, endDate, $scope.singleIndicatorModel[0].parameter);
        },
    };

    /**打开同比环比弹窗*/
    $scope.openCompareDialog = () => {
        // let loadingStyle = {
        //     color: '#c1080d',
        // };
        // if($scope.singleIndicatorModel.length === 1 && $scope.singleIndicatorModel[0].id === 27) {
        //     lineCharts.getSamePeriodLine(true, loadingStyle, $scope.compareCity, '', '', $scope.interval[0].value, endDate, 'total_ip_len');
        //     lineCharts.getChainPeriodLine(true, loadingStyle, $scope.compareCity, '', '', $scope.interval[0].value, endDate, 'total_ip_len');
        // }
    };
    /**===========================================================================*/
    /**柱形图指标选择设置*/
    let isAllowSwitch = false;
    $scope.indicatorSelectedSetting = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        closeOnSelect: true,
        showUncheckAll: false,
        selectionLimit: 1,
        buttonClasses: 'btn btn-default select-width-130',
        idProperty: 'id',
        displayProp: 'name',
        searchField: 'name',
        alignRight: true,
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.indicatorSelectedOptions = [{
        id: '103',
        name: '总流量',
        parameter: 'total_ip_len',
        unit: 'Mb',
    }];
    $scope.indicatorSelectedModel = [{
        id: '103',
        name: '总流量',
        parameter: 'total_ip_len',
        unit: 'Mb',
    }];
    $scope.indicatorSelectedEvents = {
        onItemSelect: item => {
            if (isAllowSwitch) {
                Loading.isLoading('#flowBar');
                homeCharts.getFlowBar(false, {color: '#2BBCFF'},paramForSearch.dimensionValues, item.id, paramForSearch.applicationGroups, paramForSearch.interval,paramForSearch.timeSlot);
            }
        },
        onItemDeselect: () => {
            $scope.indicatorSelectedModel = [{
                id: '103',
                name: '总流量',
                parameter: 'total_ip_len',
                unit: 'Mb',
            }];
            if (isAllowSwitch) {
                Loading.isLoading('#flowBar');
                homeCharts.getFlowBar(false, {color: '#2BBCFF'}, paramForSearch.dimensionValues, $scope.indicatorSelectedModel[0].id, paramForSearch.applicationGroups, paramForSearch.interval, paramForSearch.timeSlot);
            }
        },
    };
    /** define a parameter object for searching */
    const paramForSearch = {
        dimensionValues: null,
        indicatorIds: null,
        applicationGroups: null,
        interval: null,
        timeSlot: null,
    };
    /**===========================================================================*/
    /**屏幕自适应 ——浏览器大小改变时重置echarts表格大小*/
    window.onresize = function () {
        //左侧地图
        let mapChart = echarts.getInstanceByDom(document.getElementById('chinaMap'));
        $('#chinaMap').css('height', leftPanel.height());
        mapChart.resize();
        //右侧柱形图
        currentScreenWidth = document.body.offsetWidth;
        if(currentScreenWidth !== prevScreenWidth &&  (currentScreenWidth <= 1007 || prevScreenWidth <= 1007)){
            let barChart = echarts.getInstanceByDom(document.getElementById('flowBar'));
            let option = barChart.getOption();
            let button = document.getElementById('barIndicatorInput').getElementsByTagName('button')[0];
            if(currentScreenWidth <= 1007){
                button.style.width = '80px';
                button.getElementsByTagName('input')[0].style.width = '80%';
                option.label.normal.textStyle.fontSize = 12;
                option.xAxis[0].axisLabel.rotate = 15;
                barChart.setOption(option);
            } else {
                button.style.width = '130px';
                button.getElementsByTagName('input')[0].style.width = '90%';
                option.label.normal.textStyle.fontSize = 14;
                option.xAxis[0].axisLabel.rotate = 0;
                barChart.setOption(option);
            }
        }
        prevScreenWidth = currentScreenWidth;
        let barChart = echarts.getInstanceByDom(document.getElementById('flowBar'));
        $('#flowBar').css('height', rightPanel.height() * 0.45);
        barChart.resize();
        /**同比环比*/
        $('.indicator-detail-view').find('.modal-content').css('height', window.screen.height * 0.78);
        $('.network-indicator-detail-chart').css('height', ($('.modal-content').height() - 35) * 0.48);
        let lineChart1 = echarts.getInstanceByDom(document.getElementById('samePeriodChart'));
        let lineChart2 = echarts.getInstanceByDom(document.getElementById('chainPeriodChart'));
        lineChart1.resize();
        lineChart2.resize();
        //右侧表格
        $('.tab-record').css('height', rightPanel.height() * 0.55);
        //$scope.statisticsGridOptions.rowHeight = (rightPanel.height() * 0.48 - 31) * 0.19;
    };
    /**屏幕自适应 ——浏览器页面加载完毕时重置柱状图指标趋势输入框大小*/
    $(document).ready(function(){
        if(document.body.offsetWidth <= 1007) {
            let button = document.getElementById('barIndicatorInput').getElementsByTagName('button')[0];
            button.style.width = '80px';
            button.getElementsByTagName('input')[0].style.width = '80%';
        }
    });

    /**echarts图表请求数据函数*/
    const homeCharts = {
        /** 广东地图区域 */
        getChinaMap: (isInitialize, loadingStyle, dimensionValues, indicatorIds, applicationGroups, interval, timeSlot) => {
            let url = APIS.flow.dataDirectAnalysis;
            let param = {
                dimensionType: 3,
                dimensionValues,
                indicatorIds,
                applicationGroups,
                interval,
                //timeSlots: '1510185600306,1510272000306',
                timeSlots: timeSlot,
            };
            HttpRequestService.get(url, param, data => {
                let flowData = [];
                for (let i = 0; i < data.length; i++) {
                    if(data[i].total_ip_len > 0){
                        flowData.push([
                            {
                                name: '东莞市',
                            }, {
                                name: data[i].dimensionName,
                                value: data[i].ratio * 100,
                                flow: Math.round(data[i].total_ip_len * 100) / 100,
                            }]);
                    }
                }
                let uploadedDataURL = require('../../assets/maps/china_map.json');
                let mapChart = echarts.getInstanceByDom(document.getElementById('chinaMap'));
                if (isInitialize) {
                    mapChart.showLoading(loadingStyle);
                }
                let myHosName = '东莞市';
                let geoCoordMap = {
                    '东莞市': [113.14, 23.08],
                    '安徽': [117.17, 31.52],
                    '北京': [116.24, 39.55],
                    '重庆': [106.54, 29.59],
                    '福建': [119.18, 26.05],
                    '甘肃': [103.51, 36.04],
                    '广东': [113.14, 23.08],
                    '东莞': [113.14, 23.08],
                    '广西': [108.19, 22.48],
                    '贵州': [106.42, 26.35],
                    '香港': [114.277102, 22.339401],
                    '河北': [114.30, 38.02],
                    '河南': [113.40, 34.46],
                    '黑龙江': [128.36, 45.44],
                    '湖北': [112.27, 30.15],
                    '湖南': [112.59, 28.12],
                    '吉林': [125.19, 43.54],
                    '江苏': [118.46, 32.03],
                    '江西': [115.55, 28.40],
                    '辽宁': [123.25, 41.48],
                    '内蒙古': [108.41, 40.48],
                    '宁夏': [106.16, 38.27],
                    '青海': [101.48, 36.38],
                    '山东': [118.00, 36.40],
                    '山西': [112.33, 37.54],
                    '陕西': [108.57, 34.17],
                    '上海': [121.29, 31.14],
                    '海南': [108.77, 19.10],
                    '四川': [104.04, 30.40],
                    '天津': [117.12, 39.02],
                    '西藏': [91.08, 29.39],
                    '新疆': [87.36, 43.45],
                    '云南': [102.42, 25.04],
                    '浙江': [120.10, 30.16],
                    '澳门': [113.207389, 21.969732],
                    '台湾': [121.21, 23.53],
                };
                // let BJData = [
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '上海',
                //         value: 35,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '澳门',
                //         value: 5,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '广东',
                //         value: 37,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '辽宁',
                //         value: 4,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '湖北',
                //         value: 5,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '内蒙古',
                //         value: 3,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '江苏',
                //         value: 3,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '新疆',
                //         value: 5,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '四川',
                //         value: 5,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '云南',
                //         value: 12,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '黑龙江',
                //         value: 15,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '甘肃',
                //         value: 31,
                //         flow: 123,
                //     }],
                //     [{
                //         name: '东莞市',
                //     }, {
                //         name: '西藏',
                //         value: 2,
                //         flow: 123,
                //     }],
                // ];
                let planePath = 'path://M917.965523 917.331585c0 22.469758-17.891486 40.699957-39.913035 40.699957-22.058388 0-39.913035-18.2302-39.913035-40.699957l-0.075725-0.490164-1.087774 0c-18.945491-157.665903-148.177807-280.296871-306.821991-285.4748-3.412726 0.151449-6.751774 0.562818-10.240225 0.562818-3.450589 0-6.789637-0.410346-10.202363-0.524956-158.606321 5.139044-287.839661 127.806851-306.784128 285.436938l-1.014096 0 0.075725 0.490164c0 22.469758-17.854647 40.699957-39.913035 40.699957s-39.915082-18.2302-39.915082-40.699957l-0.373507-3.789303c0-6.751774 2.026146-12.903891 4.91494-18.531052 21.082154-140.712789 111.075795-258.241552 235.432057-312.784796C288.420387 530.831904 239.989351 444.515003 239.989351 346.604042c0-157.591201 125.33352-285.361213 279.924387-285.361213 154.62873 0 279.960203 127.770012 279.960203 285.361213 0 97.873098-48.391127 184.15316-122.103966 235.545644 124.843356 54.732555 215.099986 172.863023 235.808634 314.211285 2.437515 5.290493 4.01443 10.992355 4.01443 17.181311L917.965523 917.331585zM719.822744 346.679767c0-112.576985-89.544409-203.808826-199.983707-203.808826-110.402459 0-199.944821 91.232864-199.944821 203.808826s89.542362 203.808826 199.944821 203.808826C630.278335 550.488593 719.822744 459.256752 719.822744 346.679767z';
                let convertData = function (conData) {
                    let res = [];
                    for (let i = 0; i < conData.length; i++) {
                        let dataItem = conData[i];
                        let fromCoord = geoCoordMap[dataItem[0].name];
                        let toCoord = geoCoordMap[dataItem[1].name];
                        if (fromCoord && toCoord) {
                            res.push({
                                fromName: dataItem[0].name,
                                toName: dataItem[1].name,
                                coords: [fromCoord, toCoord],
                            });
                        }
                    }
                    return res;
                };
                let color = ['#a6c84c', '#ffa022', '#46bee9'];
                /**描绘地图中的点，线，圈*/
                let mySeries = [];
                [
                    [myHosName, flowData],
                ].forEach(item => {
                    mySeries.push(
                        { //线
                            name: item[0],
                            //                      name: item[0] + ' Top10',
                            type: 'lines',
                            zlevel: 1,
                            effect: {
                                show: true,
                                period: 6,
                                trailLength: 0.7,
                                color: '#fff',
                                symbolSize: 3,
                            },
                            lineStyle: {
                                normal: {
                                    color: color[0],
                                    width: 0,
                                    curveness: 0.2,
                                },
                            },
                            data: convertData(item[1]),
                        },
                        { //移动 点
                            name: item[0],
                            //                      name: item[0] + ' Top10',
                            type: 'lines',
                            zlevel: 2,
                            effect: {
                                show: true,
                                period: 6,
                                trailLength: 0,
                                symbol: planePath,
                                symbolSize: 15,
                            },
                            lineStyle: {
                                normal: {
                                    color: color[1],
                                    width: 1,
                                    opacity: 0.4,
                                    curveness: 0.2,
                                },
                            },
                            data: convertData(item[1]),
                        },
                        { //省份圆点
                            name: item[0],
                            //                      name: item[0] + ' Top10',
                            type: 'effectScatter',
                            coordinateSystem: 'geo',
                            zlevel: 2,
                            rippleEffect: {
                                brushType: 'stroke',
                            },
                            label: {
                                normal: {
                                    show: true,
                                    color: '#ffffff',
                                    position: 'right',
                                    formatter(params) {
                                        return params.name;
                                    },
                                },
                            },
                            symbolSize(val) {
                                let tmp = val[2];
                                if (tmp <= 10) {
                                    return tmp * 3;
                                } else if (tmp >= 30) {
                                    if (tmp >= 50) {
                                        return tmp / 2;
                                    }
                                    return tmp;
                                }
                                return tmp * 1.5;
                            },
                            itemStyle: {
                                normal: {
                                    color(params) {
                                        let tmp = params.data.value[2];
                                        if (tmp <= 10) {
                                            return 'lightgreen';
                                        } else if (tmp >= 30) {
                                            return 'red'
                                        }
                                        return 'yellow';
                                    },
                                },
                            },
                            data: item[1].map(dataItem => ({
                                    name: dataItem[1].name,
                                    value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]),
                                    flow: geoCoordMap[dataItem[1].name].concat([dataItem[1].flow]),
                                })
                            ),
                        });
                });
                /**地图加载*/
                // $.get(uploadedDataURL, geoJson => {
                    echarts.registerMap('china', uploadedDataURL);
                    let option = {
                        backgroundColor: '#404a59',
                        title: {
                            text: '',
                            show: false,
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter(params) {
                                //console.log(params);
                                if (params.seriesIndex === 2 || params.seriesIndex === 5 || params.seriesIndex === 8) {
                                    return params.name + ':<br>' + params.data.flow[2] + 'GB , ' + params.data.value[2].toFixed(2) + '%';
                                } else if (params.seriesIndex === 1 || params.seriesIndex === 4 || params.seriesIndex === 7) {
                                    return params.data.fromName + '→' + params.data.toName;
                                }
                            },
                        },
                        legend: {
                            show: false,
                        },
                        geo: {
                            map: 'china',
                            layoutCenter: ['50%', '50%'],
                            layoutSize: '116%',
                            label: {
                                emphasis: {
                                    show: false,
                                },
                            },
                            roam: true,
                            itemStyle: {
                                normal: {
                                    areaColor: '#323c48',
                                    borderColor: '#404a59',
                                },
                                emphasis: {
                                    areaColor: '#2a333d',
                                },
                            },
                        },
                        series: mySeries,
                    };
                    if (option && typeof option === 'object') {
                        mapChart.setOption(option, true);
                    }
                // });

                if (isInitialize) {
                    mapChart.hideLoading();
                }
                Loading.hideLoading('#chinaMap');
            });
        },
        /** 总流量对比柱形图 */
        getFlowBar: (isInitialize, loadingStyle, dimensionValues, indicatorIds, applicationGroups, interval, timeSlot) => {
            let barChart = echarts.getInstanceByDom(document.getElementById('flowBar'));
            if (isInitialize) {
                barChart.showLoading(loadingStyle);
            }
            let url = APIS.flow.dataDirectAnalysis;
            let param = {
                dimensionType: 3,
                dimensionValues,
                indicatorIds,
                applicationGroups,
                interval,
                timeSlots: timeSlot,
                //timeSlots: '1510185600306,1510272000306',
            };

            HttpRequestService.get(url, param, data => {
                let provinceNames = [];
                let flowData = [];
                //let yData = [];
                let dataLength = data.length;
                // if (!isInitialize) {
                //     dataLength = data.length;
                // }
                for (let i = 0; i < dataLength; i++) {
                    if (data[i]) {
                        provinceNames.push(data[i].dimensionName);
                        //yData.push((data[i].ratio * 100).toFixed(2));
                        if(indicatorIds == '103'){
                            flowData.push(
                                {
                                    value: (data[i].ratio * 100).toFixed(2),
                                    flow: (data[i].total_ip_len * 100).toFixed(2),
                                });
                        }else{
                            let indicatorValue = data[i].indicators[$scope.indicatorSelectedModel[0].parameter];
                            if(indicatorValue.toString().split('.')[1]){
                                flowData.push(
                                    {
                                        value: indicatorValue.toString().split('.')[1].length > 2? indicatorValue.toFixed(2) : indicatorValue,
                                        rate: (data[i].ratio * 100).toFixed(2),
                                    });
                            }
                            else{
                                flowData.push(
                                    {
                                        value: indicatorValue,
                                        rate: (data[i].ratio * 100).toFixed(2),
                                    });
                            }
                        }
                    }
                    if (i === 9) {
                        break;
                    }
                }
                let isSmallest = document.body.offsetWidth <= 1007;
                let fontsize,angle;
                if(isSmallest){
                    fontsize = 12;
                    angle = 15;
                } else {
                    fontsize = 14;
                    angle = 0;
                }
                let option = {
                    backgroundColor: '#fff',
                    title: {
                        show: false,
                        text: '流量top10省份',
                        top: '-5',
                        left: 'center',
                        textStyle: {
                            color: '#000',
                        },
                    },
                    tooltip: {
                        show: true,
                        trigger: 'axis',
                        formatter(params) {
                            let relVal = params[0].name;
                            if(indicatorIds == '103'){
                                relVal += '<br/>流量占比:&nbsp' + params[0].value + '%<br/>';
                                relVal += '流量:&nbsp' + params[0].data.flow + $scope.indicatorSelectedModel[0].unit;
                            }else{
                                relVal += '<br/>流量占比:&nbsp' + params[0].data.rate + '%<br/>';
                                relVal += $scope.indicatorSelectedModel[0].name+':&nbsp' + params[0].data.value + $scope.indicatorSelectedModel[0].unit;
                            }
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
                    xAxis: {
                        axisTick: {show: false},
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#666',
                            },
                        },
                        axisLabel: {
                            color: '#666',
                            interval: 0,
                            rotate: angle,
                        },
                        // data: ['广东', '北京', '上海', '湖南', '浙江', '天津', '湖北', '广西', '香港', '澳门'],
                        data: provinceNames,
                    },
                    yAxis: {
                        splitLine: {show: false},
                        //max: 95,
                        //interval: 10,
                        axisTick: {show: false},
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#666',
                            },
                        },
                        axisLabel: {
                            color: '#666',
                            rotate:40,
                            interval: 0,
                            margin: 5,
                            formatter(params){
                                if(indicatorIds == '103' || $scope.indicatorSelectedModel[0].unit == '%'){
                                    return params+'%';
                                }
                                return formatYText(params);
                            },
                        },
                    },
                    grid: {
                        y: 5,
                        y2: 25,
                        x: 38,
                        x2: 10,
                        top: 35,
                    },
                    series: [{
                        name: '流量占比',
                        type: 'bar',
                        barMaxWidth: 40,
                        //data:[40.01,30.59,9.16,7.19,3.28,1.85,1.21,0.98,0.75,0.65],
                        // data: [
                        //     {
                        //         value: 56.12,
                        //         flow: 223.01,
                        //     },
                        //     {
                        //         value: 10.59,
                        //         flow: 123.59,
                        //     },
                        //     {
                        //         value: 9.16,
                        //         flow: 231.34,
                        //     },
                        //     {
                        //         value: 6.19,
                        //         flow: 232,
                        //     },
                        //     {
                        //         value: 5.78,
                        //         flow: 787,
                        //     },
                        //     {
                        //         value: 4.15,
                        //         flow: 788,
                        //     },
                        //     {
                        //         value: 2.91,
                        //         flow: 123,
                        //     },
                        //     {
                        //         value: 2.28,
                        //         flow: 123,
                        //     },
                        //     {
                        //         value: 1.75,
                        //         flow: 123,
                        //     },
                        //     {
                        //         value: 1.25,
                        //         flow: 123,
                        //     }],
                        data: flowData,
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
                                borderWidth: 1,
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
                            offset: [0, 4],
                            formatter(params){
                                if(indicatorIds == '103' || $scope.indicatorSelectedModel[0].unit == '%'){
                                    return params.value+'%';
                                }
                                return formatYText(params.value);
                            },
                            textStyle: {
                                color: '#000',
                                fontSize: fontsize,
                            },
                        },
                        emphasis: {
                            show: true,
                            position: 'top',
                            offset: [0, 4],
                            formatter(params){
                                if(indicatorIds == '103' || $scope.indicatorSelectedModel[0].unit == '%'){
                                    return params.value+'%';
                                }
                                return formatYText(params.value);
                            },
                            textStyle: {
                                color: '#000',
                                fontSize: fontsize,
                            },
                        },
                    },
                };
                if (dataLength > 10 ) {
                    //if (!isInitialize) {
                        option.title.show = true;
                    //}
                }
                // if (yData.max() > 88) {
                //     option.yAxis.max = 105;
                // }
                barChart.setOption(option);
                barChart.on('click', params => {
                    $scope.reloadComparePanel(params.name, endDate);
                });
                if (isInitialize) {
                    barChart.hideLoading();
                }
                Loading.hideLoading('#flowBar');
            });
        },
    };

    /**点击表格内出口名称时唤起同比环比弹窗*/
    $scope.reloadComparePanel = (name, staticTime) => {
        /**查询的同比环比省份改变时，或查询的结束时间改变时，或重新选择业务大小类并点击查询时，重置同比环比界面*/
        if ($scope.compareCity !== name || $scope.compareEndTime !== staticTime || searchClicked) {
            lineCharts.getSamePeriodLine(true, {color: '#c1080d'}, name, $scope.applicationGroups, paramForSearch.interval, staticTime, 'total_ip_len');
            lineCharts.getChainPeriodLine(true, {color: '#c1080d'}, name, $scope.applicationGroups, paramForSearch.interval, staticTime, 'total_ip_len');
            $scope.singleIndicatorModel = [{
                id: '103',
                name: '总流量',
                parameter: 'total_ip_len',
                unit: 'Mb',
            }];
            searchClicked = false;
        }
        $scope.compareCity = name;
        $scope.compareEndTime = staticTime;
        $('#compareDialog').trigger('click');
    };

    let prevScreenWidth,currentScreenWidth;
    /**echarts同比,环比折线图请求数据函数*/
    const lineCharts = {
        getSamePeriodLine: (isInitialize, loadingStyle, dimensionValues, applicationGroups, interval, time, indicatorParam) => {
            let lineChart = echarts.getInstanceByDom(document.getElementById('samePeriodChart'));
            if (isInitialize) {
                lineChart.showLoading(loadingStyle);
            }
            /**根据省份名称找到其对应的序列号*/
            let provinceID = '';
            DefaultData.provinceOptions.forEach(item => {
                if (item.label.indexOf(dimensionValues) >= 0) {
                    // console.log(item.value);
                    provinceID = item.value
                }
            });
            /**获取列表中的指标ID，参数名*/
            let indicatorIds = '';
            let indicatorDataArray = [];
            $scope.singleIndicatorOptions.forEach(item => {
                indicatorIds += item.id + ',';
                /**有多少个指标，创造多少个对应数组*/
                indicatorDataArray.push(
                    {
                        indicatorName: item.parameter,
                        indicatorData: [],
                    });
            });
            /**当初始化，即用户未选择指标时，查询指标为总流量*/
            if (indicatorIds === '') {
                indicatorIds = '103';
                indicatorDataArray.push({
                    indicatorName: 'total_ip_len',
                    indicatorData: [],
                });
            } else {/**当用户有选择指标，但未选择总流量指标时*/
                /**无论怎么选择指标，最后都添加上总流量的指标*/
                indicatorIds = indicatorIds + '103';
                indicatorDataArray.push(
                    {
                        indicatorName: 'total_ip_len',
                        indicatorData: [],
                    });
            }
            let url = APIS.flow.dataDirectAnalysis + '/detail';
            let param = {
                dimensionType: 3,
                dimensionValue: provinceID,
                indicatorIds,
                applicationGroups,
                interval,
                statisticalTime: time,
                type: 0,
                //timeSlots: '1510185600306,1510272000306',
            };
            // let contentX = ['10-26 00:00', '10-26 00:00', '10-26 00:00', '10-26 00:00', '10-26 00:00', '10-26 00:00', '10-26 00:00'];
            // let contentY = [106395, 0, 106545, 106338, 106679, 0, 106461];
            HttpRequestService.get(url, param, data => {
                let times = [];
                let yData = [];
                data.forEach(item => {
                    times.push($filter('date')(item.statisticalTime, 'MM-dd HH:mm'));
                    //给指标数组赋值
                    indicatorDataArray.forEach(idtData => {
                        if (item.indicators[idtData.indicatorName]) {
                            idtData.indicatorData.push(item.indicators[idtData.indicatorName]);
                        } else {
                            idtData.indicatorData.push(0);
                        }
                    })
                });
                //根据下拉列表的选择，选择出显示的指标
                indicatorDataArray.forEach(item => {
                    if (item.indicatorName == indicatorParam) {
                        yData = item.indicatorData;
                    }
                });
                let option = {
                    title: {
                        text: '同比趋势——' + $scope.compareCity,
                        left: 'left',
                        top: 'top',
                        textStyle: {
                            fontWeight: 'bold',
                        },
                        subtext: $scope.singleIndicatorModel[0].unit,
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter(arr) {
                            return '日期：' + arr[0].name + '<br/>数值：' + arr[0].value + '('+$scope.singleIndicatorModel[0].unit+')';
                        },
                    },
                    xAxis: {
                        type: 'category',
                        data: times,
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
                        axisLabel: {
                            formatter(params){
                                return formatYText(params);
                            },
                        },
                    },
                    series: [{
                        name: '',
                        type: 'line',
                        lineStyle: {
                            normal: {
                                width: 1,
                                type: 'solid',
                                color: '#FF0A00',
                                shadowBlur: 5,
                            },
                        },
                        data: yData,
                    }],
                };
                lineChart.setOption(option);
                if (isInitialize) {
                    lineChart.hideLoading();
                }
            });
        },
        getChainPeriodLine: (isInitialize, loadingStyle, dimensionValues, applicationGroups, interval, time, indicatorParam) => {
            let lineChart = echarts.getInstanceByDom(document.getElementById('chainPeriodChart'));
            if (isInitialize) {
                lineChart.showLoading(loadingStyle);
            }
            /**根据省份名称找到其对应的序列号*/
            let provinceID = '';
            DefaultData.provinceOptions.forEach(item => {
                if (item.label.indexOf(dimensionValues) >= 0) {
                    provinceID = item.value
                }
            });
            /**获取列表中的指标ID，参数名*/
            let indicatorIds = '';
            let indicatorDataArray = [];
            $scope.singleIndicatorOptions.forEach(item => {
                indicatorIds += item.id + ',';
                /**有多少个指标，创造多少个对应数组*/
                indicatorDataArray.push(
                    {
                        indicatorName: item.parameter,
                        indicatorData: [],
                    });
            });
            /**当初始化，即用户未选择指标时，查询指标为总流量*/
            if (indicatorIds === '') {
                indicatorIds = '103';
                indicatorDataArray.push({
                    indicatorName: 'total_ip_len',
                    indicatorData: [],
                });
            } else {/**当用户有选择指标，但未选择总流量指标时*/
                /**无论怎么选择指标，最后都添加上总流量的指标*/
                indicatorIds = indicatorIds + '103';
                indicatorDataArray.push(
                    {
                        indicatorName: 'total_ip_len',
                        indicatorData: [],
                    });
            }
            let url = APIS.flow.dataDirectAnalysis + '/detail';
            let param = {
                dimensionType: 3,
                dimensionValue: provinceID,
                indicatorIds,
                applicationGroups,
                interval,
                statisticalTime: time,
                type: 1,
                //timeSlots: '1510185600306,1510272000306',
            };
            // let contentX = ['10-26 01:00', '10-26 02:00', '10-26 03:00', '10-26 04:00', '10-26 05:00', '10-26 06:00', '10-26 07:00',
            // '10-26 08:00', '10-26 09:00', '10-26 10:00', '10-26 11:00', '10-26 12:00', '10-26 13:00', '10-26 14:00', '10-26 15:00',
            // '10-26 16:00', '10-26 17:00', '10-26 18:00', '10-26 19:00', '10-26 19:00', '10-26 20:00', '10-26 21:00', '10-26 22:00',
            // '10-26 23:00', '10-27 00:00'];
            // let contentY = [106395, 0, 106545, 106338, 106679, 0, 106461, 0, 0, 0, 106395, 0, 106545, 106338, 106679, 0, 106461, 80432,
            // 50242, 106395, 0, 106545, 106338, 0, 0];
            HttpRequestService.get(url, param, data => {
                let times = [];
                let yData = [];
                data.forEach(item => {
                    times.push($filter('date')(item.statisticalTime, 'MM-dd HH:mm'));
                    //给指标数组赋值
                    indicatorDataArray.forEach(idtData => {
                        if (item.indicators[idtData.indicatorName]) {
                            idtData.indicatorData.push(item.indicators[idtData.indicatorName]);
                        } else {
                            idtData.indicatorData.push(0);
                        }
                    })
                });
                //根据下拉列表的选择，选择出显示的指标
                indicatorDataArray.forEach(item => {
                    if (item.indicatorName == indicatorParam) {
                        yData = item.indicatorData;
                    }
                });
                let option = {
                    title: {
                        text: '环比趋势——' + $scope.compareCity,
                        left: 'left',
                        top: 'top',
                        textStyle: {
                            fontWeight: 'bold',
                        },
                        subtext: $scope.singleIndicatorModel[0].unit,
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter(arr) {
                            return '日期：' + arr[0].name + '<br/>数值：' + arr[0].value+ '('+$scope.singleIndicatorModel[0].unit+')';
                        },
                    },
                    xAxis: {
                        type: 'category',
                        data: times,
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
                        axisLabel: {
                            formatter(params){
                                return formatYText(params);
                            },
                        },
                    },
                    series: [{
                        name: '',
                        type: 'line',
                        lineStyle: {
                            normal: {
                                width: 1,
                                type: 'solid',
                                color: '#FF0A00',
                                shadowBlur: 5,
                            },
                        },
                        data: yData,
                    }],
                };
                lineChart.setOption(option);
                if (isInitialize) {
                    lineChart.hideLoading();
                }
            });
        },
    };

    /**去除时间的分钟和秒*/
    const formatDate = date => {
        let newDate = new Date(date);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        return newDate.getTime();
    };

    /** 加载全部echarts图表 */
    const loadCharts = isInitialize => {
        let loadingStyle = {
            color: '#2BBCFF',
        };
        currentScreenWidth = document.body.offsetWidth;
        prevScreenWidth = currentScreenWidth;
        /**默认显示所有出口与所有业务大小类的流量信息*/
        homeCharts.getChinaMap(isInitialize, loadingStyle, '', '103', '', $scope.interval[0].value, formatDate(NOW - (3 * ONE_HOUR_MS))+','+formatDate(NOW - (2 * ONE_HOUR_MS)));
        homeCharts.getFlowBar(isInitialize, loadingStyle, '', '103', '', $scope.interval[0].value, formatDate(NOW - (3 * ONE_HOUR_MS))+','+formatDate(NOW - (2 * ONE_HOUR_MS)));
        paramForSearch.interval = $scope.interval[0].value;
    };

    /** 初始化echarts加载图表 **/
    const initECharts = () => {
        /**地市图*/
        $('#chinaMap').css('height', $('.left-side').height());
        echarts.init(document.getElementById('chinaMap'));
        /**柱状图*/
        $('#flowBar').css('height', rightPanel.height() * 0.45);
        echarts.init(document.getElementById('flowBar'));
        /**同比环比*/
        $('.indicator-detail-view').find('.modal-content').css('height', window.screen.height * 0.78);
        $('.network-indicator-detail-chart').css('height', ($('.modal-content').height() - 35) * 0.48);
        echarts.init(document.getElementById('samePeriodChart'));
        echarts.init(document.getElementById('chainPeriodChart'));
        /**表格*/
        $('.tab-record').css('height', rightPanel.height() * 0.55);
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
            /**表头*/
            let columns = [
                {
                    displayName: '时间',
                    name: 'statisticalTime',
                    width: 150,
                },
                {
                    displayName: '省份',
                    name: 'dimensionName',
                    width: 100,
                    cellTemplate: `<div class="ui-grid-cell-contents ng-binding ng-scope" ng-click="grid.appScope.reloadComparePanel(row.entity.dimensionName,grid.appScope.endTimeStore)" style="cursor: pointer">{{COL_FIELD CUSTOM_FILTERS}}</div>`,
                },
                // {
                //     displayName: '业务大类',
                //     name: 'appTypeName',
                //     width: 120,
                // },
                // {
                //     displayName: '业务小类',
                //     name: 'appSubTypeName',
                //     width: 120,
                // },
            ];
            if (isSelectApplicationType) {
                columns.push({
                    displayName: '业务大类',
                    name: 'appTypeName',
                    width: 120,
                });
            }
            if (isSelectApplication) {
                columns.push({
                    displayName: '业务小类',
                    name: 'appSubTypeName',
                    width: 120,
                });
            }
            $scope.indicatorModel.map(indicator => {
                let column = {};
                column.name = indicator.parameter;
                if (indicator.unit) {
                    column.displayName = indicator.name + '(' + indicator.unit + ')';
                } else {
                    column.displayName = indicator.name;
                }
                column.width = 245;

                column.cellTemplate = setCelltemplate();
                columns.push(column);
            });
            $scope.FAGridOption.columnDefs = columns;
        };

    /*转换关键指标为_level格式*/
    $scope.convertCol = col =>{
        return col+'_level';
    }
    /**自定义单元格template*/
    const setCelltemplate = () => {
        return `<div class="ui-grid-cell-contents ng-binding ng-scope" ng-show="row.entity[grid.appScope.convertCol(col.colDef.name)] == 1" ng-class="{'waringLevel1' : row.entity[grid.appScope.convertCol(col.colDef.name)] == 1}"  style="white-space:nowrap">
                        <span >{{COL_FIELD CUSTOM_FILTERS}}</span>
                </div>
                <div class="ui-grid-cell-contents ng-binding ng-scope" ng-show="row.entity[grid.appScope.convertCol(col.colDef.name)] == 2" ng-class="{'waringLevel2' : row.entity[grid.appScope.convertCol(col.colDef.name)] == 2}"  style="white-space:nowrap">
                        <span >{{COL_FIELD CUSTOM_FILTERS}}</span>
                </div>
                <div class="ui-grid-cell-contents ng-binding ng-scope" ng-show="row.entity[grid.appScope.convertCol(col.colDef.name)] == 3" ng-class="{'waringLevel3' : row.entity[grid.appScope.convertCol(col.colDef.name)] == 3}"  style="white-space:nowrap">
                        <span >{{COL_FIELD CUSTOM_FILTERS}}</span>
                </div>
                <div class="ui-grid-cell-contents ng-binding ng-scope" ng-show="row.entity[grid.appScope.convertCol(col.colDef.name)] == null"  style="white-space:nowrap">
                        <span >{{COL_FIELD CUSTOM_FILTERS}}</span>
                </div>`;

    }

    // let curPageSize;
    // let curPageIndex;
    const getParamsInSearch = (pageIndex, pageSize, isCountotal) => {
        let params = {};
        let provinceNames = '';
        $scope.provinceModel.map(item => {
            provinceNames += (item.value + ',');
        });

        let indicatorIds = '';
        $scope.indicatorModel.map(indicator => {
            indicatorIds += (indicator.id + ',');
        });
        params.dimensionType = 3;
        params.dimensionValues = provinceNames;
        params.indicatorIds = indicatorIds;
        params.interval = $scope.interval[0].value;
        params.applicationGroups = $scope.applicationGroups;
        params.timeSlots = $scope.timeSlots.startDate + ','+ $scope.timeSlots.endDate;
        params.orderBys = 'statisticalTime\u0020asc';
        params.pageIndex = pageIndex;
        params.pageSize = pageSize;
        params.isCountotal = isCountotal;
        return params;
    };
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
            exporterCsvFilename: '省份流向查询数据表.csv',
            exporterOlderExcelCompatibility: true,
            columnDefs: [],
            // exporterAllDataFn: function () {
            //     return getDeviceIndicatorData()
            //         .then(() => {
            //                 $scope.FAGridOption.useExternalPagination = false;
            //                 $scope.FAGridOption.useExternalSorting = false;
            //                 getDeviceIndicatorData = null;
            //             }
            //         );
            // },
        };
        $scope.FAGridOption.useExternalSorting = false;
        $scope.FAGridOption.onRegisterApi = function (gridApi) {
            $scope.FAGridApi = gridApi;
            // gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            //     if (getDeviceIndicatorData) {
            //         curPageSize = pageSize;
            //         curPageIndex = newPage;
            //         setDataForGrid(curPageIndex, curPageSize);
            //     }
            // });
            // gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
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
        /***导出数据*/
        // let getDeviceIndicatorData = function () {
        //     return new Promise((resolve, reject) => {
        //         let url = APIS.flow.dataDirectAnalysis + '/statistic';
        //         let param = getParamsInSearch(1, -1, true);
        //         HttpRequestService.get(url, param, data => {
        //             $scope.FAGridOption.data.length = 0;
        //             data.map(row => {
        //                 $scope.FAGridOption.data.push(row);
        //             });
        //             resolve();
        //         }, () => {
        //             reject();
        //         });
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
        //console.log(data);
        data.map(rowData => {
            rowData.statisticalTime = $filter('date')(rowData.statisticalTime, 'yyyy/MM/dd HH:mm');
            // rowData.ce
            /**时间格式化*/
            if(rowData.ul_ip_len > 50){
                $scope.warntest = '123';
            }else{
                $scope.warntest = '456';
            }
            $scope.FAGridOption.data.push(rowData);
        });
        Loading.hideLoading('.tab-record');
    };
    const getDataForGrid = () => {
        let url = APIS.flow.dataDirectAnalysis + '/statistic';
        let params = getParamsInSearch(1, -1, true);
        HttpRequestService.get(url, params, response => {
            let statistics = response.statistic;
            statistics.map(statistic => {
                for (let key in statistic) {
                    if (typeof statistic[key] === 'number') {
                        statistic[key] = Math.round(statistic[key] * 100) / 100;
                        /**小数位限制为两位*/
                    }
                }
            });
            setDataForGrid(statistics);
        });
    };
    /**===========================================================*/
    /** 初始化加载Controller */
    const initController = () => {
        /** 初始化下拉列表中加载数据*/
        initSelectData();
        /**获取模板列表*/
        getTemplates();
        /** 初始化echarts加载图表 */
        initECharts();
        /**初始化表格*/
        initDIAGrid();
        /**获取所有业务小类*/
        selectData.getAllApplication();
    };
    initController();
}
DataDirectProvinceAnalysisController.$inject = ['$scope', '$filter', 'HttpRequestService'];
