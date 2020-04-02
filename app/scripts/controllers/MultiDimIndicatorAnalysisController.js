'use strict';

import echarts from 'echarts';
import swal from 'sweetalert2';
import APIS from '../configs/ApisConfig';
import DefaultData from '../data/MultiDimIndicatorAnalysisDataConfig';
import Loading from '../custom-pulgin/Loading';
import util from '../service/util';

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
export default function MultiDimIndicatorAnalysisController($scope, $state, $filter, HttpRequestService) {
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
    /**select插件内容翻译*/
    $scope.selectorText = {
        checkAll: '选择全部',
        uncheckAll: '取消全部',
        buttonDefaultText: '请选择',
        dynamicButtonTextSuffix: '个选择',
        searchPlaceholder: '搜索',
    };
    $scope.selectorDisabled = 'disabled';
    $scope.selectorTemplateDelete = {
        checkAll: '删除模板',
        uncheckAll: '取消全部',
        buttonDefaultText: '',
        dynamicButtonTextSuffix: '个选择',
        searchPlaceholder: '搜索',
        deleteItemText: '删除模板',
    };
    let isSelectedAll = {
        websiteType: false,
        website: false,
        app: false,
        subApp: false,
        indicator: false,
        device: false,
    };
    /**选择模板*/
    let isRecover = 0;
    $scope.templateSetting = {
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
        enableDelete: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.templateOptions = [];
    $scope.templateEvents = {
        onItemSelect: item => {
            $scope.templateText = '更新模板';
            selectedTemplate(item);
        },
        onItemDeselect: () => {
            $scope.interval = [{
                id: 1,
                name: '小时',
                value: 60,
            }];
            $scope.userType = [{
                id: 0,
                name: '全网',
            }];
            $scope.dimensionsModel = [{
                id: 4,
                name: '全维度',
                parameter: 'all',
                dimensionPro: 'allDimension',
            }];
            $scope.appModel = {
                app: [],
                device: [$scope.appOptions.device[0]],
                icp: [],
            };
            $scope.subAppModel = {
                app: [],
                device: [],
                icp: [],
            };
            $scope.indicatorModel = [{
                description: '统计周期内通过网络链路的所有上下行报文字节数大小总和',
                factor: 'sum(ul_ip_len)+sum(dl_ip_len)',
                hasNextLevel: 'N',
                id: '103',
                level: 1,
                name: '总流量',
                parameter: 'total_ip_len',
                parentId: '1',
                unit: 'MB',
            }];
            $scope.template = [];
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
        scrollableHeight: '98px',
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
    };
    $scope.intervalEvents = {
        onItemDeselect: () => {
            $scope.interval.push($scope.intervalOptions[0]);//时间粒度
            $scope.dateInterval = '60';
        },
        onItemSelect: item => {
            $scope.dateInterval = item.value + '';
        },
    };
    /**用户类型选择设置*/
    $scope.userTypesOptions = DefaultData.userTypesOptions;
    $scope.userTypeSetting = {
        scrollableHeight: '150px',
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
    };
    $scope.userTypeEvent = {
        onItemDeselect: item => {
            $scope.userType = [{
                id: 0,
                name: '全网',
            }];
        },
        onItemSelect: item => {
            switch (item.id) {
                case 0: {
                    $scope.appOptions.device = DefaultData.deviceAppOptions.wholeNetwork;
                    break;
                }
                case 3: {
                    $scope.appOptions.device = DefaultData.deviceAppOptions.familywide;
                    break;
                }
                case 5: {
                    $scope.appOptions.device = DefaultData.deviceAppOptions.specialline;
                    break;
                }
                default: {
                    $scope.appOptions.device = [];
                }
            }
        },
    };
    /**维度选择设置*/
    $scope.dimensionsOptions = DefaultData.dimensionsOptions;
    $scope.dimensionsSetting = {
        scrollableHeight: '150px',
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
    };
    $scope.dimensionsEvents = {
        onItemSelect: item => {
            switch (item.id) {
                case 1: {
                    switch ($scope.userType[0].id) {
                        case 0: {
                            $scope.selectorDisabled = '';
                            $scope.appOptions.device = DefaultData.deviceAppOptions.wholeNetwork;
                            break;
                        }
                        case 1: {
                            $scope.appOptions.device = DefaultData.deviceAppOptions.familywide;
                            break;
                        }
                        case 2: {
                            $scope.appOptions.device = DefaultData.deviceAppOptions.specialline;
                            break;
                        }
                        default: {
                            $scope.appOptions.device = DefaultData.deviceAppOptions.wholeNetwork;
                        }
                    }
                    if (isRecover <= 0) {
                        $scope.appModel.device = [$scope.appOptions.device[0]];
                        $scope.appEvents.device.onItemSelect($scope.appModel.device[0]);
                    } else {
                        isRecover--;
                    }
                    break;
                }
                case 2: {
                    HttpRequestService.get(APIS.device.applicationTypeList, {
                        pageIndex: 1,
                        pageSize: -1,
                    }, applicationTypeList => {
                        $scope.appOptions.app = applicationTypeList;
                    });
                    if (isRecover <= 0) {
                        $scope.appModel.app = [];
                    } else {
                        isRecover--;
                    }
                    $scope.subAppOptions.app = [];
                    break;
                }
                case 3: {
                    HttpRequestService.get(APIS.device.websiteTypeList, {
                        pageIndex: 1,
                        pageSize: 20,
                    }, webSiteTypeList => {
                        $scope.appOptions.icp = webSiteTypeList;
                    });
                    if (isRecover <= 0) {
                        $scope.appModel.icp = [];
                    } else {
                        isRecover--;
                    }
                    $scope.subAppOptions.icp = [];
                    break;
                }
                case 4: {
                    $scope.selectorDisabled = 'disabled';
                }
            }
            $scope.indicatorModel = [];
            getData.getIndicatorlist();
        },
        onItemDeselect: item => {
            $scope.dimensionsModel = [{
                id: 4,
                name: '全维度',
                parameter: 'all',
                dimensionPro: 'allDimension',
            }];
        },
    };
    /**所选维度大类设置*/
    let selectedApp;
    $scope.appSetting = {
        app: {
            scrollableHeight: '230px',
            showCheckAll: true,
            showUncheckAll: true,
            scrollable: true,
            enableSearch: true,
            // selectionLimit: 1,
            idProperty: 'id',
            displayProp: 'name',
            searchField: 'name',
            // closeOnSelect: true,
            buttonClasses: 'btn btn-default select-width-140',
            smartButtonTextProvider(selectionArray) {
                if (isSelectedAll.app) {
                    return '已选择全部';
                }
                return selectionArray.length + '个选择';
            },
        },
        device: {
            display: false,
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
        icp: {
            scrollableHeight: '230px',
            showCheckAll: true,
            showUncheckAll: true,
            scrollable: true,
            enableSearch: true,
            // selectionLimit: 1,
            idProperty: 'id',
            displayProp: 'name',
            searchField: 'name',
            buttonClasses: 'btn btn-default select-width-140',
            smartButtonTextProvider(selectionArray) {
                if (isSelectedAll.websiteType) {
                    return '已选择全部';
                }
                return selectionArray.length + '个选择';
            },
        },
    };
    $scope.appOptions = {
        app: [],
        device: DefaultData.deviceAppOptions.wholeNetwork,
        icp: [],
    };
    $scope.appEvents = {
        app: {
            onSelectionChanged: () => {
                if ($scope.appModel.app.length <= 0) {
                    $scope.subAppOptions.app = [];
                    $scope.subAppSearchOptions.app = [];
                    $scope.subAppModel.app = [];
                    return;
                }
                getData.getApplication($scope.subAppModel.app);
                isSelectedAll.app = $scope.appOptions.app.length === $scope.appModel.app.length;
            },
        },
        device: {
            onItemSelect: item => {
                selectedApp = item;
                let url = APIS.device.deviceList + '/' + item.id;
                HttpRequestService.get(url, {}, reponse => {
                    $scope.subAppOptions.device = [];
                    $scope.subAppOptions.device = reponse;
                    if (isRecover <= 0) {
                        $scope.subAppModel.device = [$scope.subAppOptions.device[0]];
                    } else {
                        isRecover--;
                    }
                });
            },
        },
        icp: {
            onSelectionChanged: () => {
                getData.getWebsite();
                isSelectedAll.websiteType = $scope.appOptions.icp.length === $scope.appModel.icp.length;
            },
            asyncSearchOptions: searchFilter => {
                let url = APIS.device.websiteTypeList;
                let params = {
                    searchKeyword: searchFilter,
                    pageIndex: 1,
                    pageSize: 20,
                };
                HttpRequestService.get(url, params, reponse => {
                    $scope.appSearchOptions = reponse;
                });
            },
        },
    };
    $scope.appIsWarning = {
        app: {
            isSearched: false,
            isWarned: false,
        },
        device: {
            isSearched: false,
            isWarned: false,
        },
        icp: {
            isSearched: false,
            isWarned: false,
        },
    };
    /**所选维度小类设置*/
    let allApplication = [];
    let allApplicationForSearch = [];
    $scope.subAppSetting = {
        app: {
            checkBoxes: true,
            scrollableHeight: '300px',
            scrollable: true,
            enableSearch: true,
            displayProp: 'name',
            searchField: 'name',
            enableAsyncSearch: true,
            alignRight: true,
            buttonClasses: 'btn btn-default select-width-140',
            selectedToTop: true,
            idProperty: 'id',
            smartButtonTextProvider(selectionArray) {
                if (isSelectedAll.subApp) {
                    return '已选择全部';
                }
                return selectionArray.length + '个选择';
            },
        },
        device: {
            display: false,
            checkBoxes: true,
            scrollableHeight: '300px',
            scrollable: true,
            enableSearch: true,
            displayProp: 'name',
            searchField: 'name',
            enableAsyncSearch: true,
            alignRight: true,
            buttonClasses: 'btn btn-default select-width-140',
            selectedToTop: true,
            idProperty: 'id',
            smartButtonTextProvider(selectionArray) {
                if (isSelectedAll.device) {
                    return '已选择全部';
                }
                return selectionArray.length + '个选择';
            },
        },
        icp: {
            checkBoxes: true,
            scrollableHeight: '300px',
            scrollable: true,
            enableSearch: true,
            displayProp: 'name',
            searchField: 'name',
            enableAsyncSearch: true,
            alignRight: true,
            buttonClasses: 'btn btn-default select-width-140',
            selectedToTop: true,
            idProperty: 'id',
            smartButtonTextProvider(selectionArray) {
                if (isSelectedAll.website) {
                    return '已选择全部';
                }
                return selectionArray.length + '个选择';
            },

        },
    };
    $scope.subAppOptions = {
        app: [],
        icp: [],
        device: [],
    };
    $scope.subAppSearchOptions = {
        app: [],
        icp: [],
        device: [],
    };
    $scope.subAppEvents = {
        app: {
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
                $scope.subAppSearchOptions.app = searchOption;
            },
            onSelectionChanged: () => {
                isSelectedAll.subApp = $scope.subAppOptions.app.length === $scope.subAppModel.app.length;
            },
        },
        icp: {
            asyncSearchOptions: searchFilter => {
                let url = APIS.device.websiteList;
                let websiteTypeIds = '';
                if (isSelectedAll.websiteType) {
                    websiteTypeIds = -1;
                } else {
                    $scope.appModel.icp.map(websiteType => {
                        websiteTypeIds += websiteType.id + ',';
                    });
                }
                let params = {
                    websiteType: websiteTypeIds,
                    searchKeyword: searchFilter,
                    pageIndex: 1,
                    pageSize: 20,
                };
                HttpRequestService.get(url, params, reponse => {
                    $scope.subAppSearchOptions.websites = [];
                    $scope.subAppSearchOptions.websites = reponse;
                });
            },
            onSelectionChanged: () => {
                isSelectedAll.website = $scope.subAppOptions.icp.length === $scope.subAppModel.icp.length;
            },
        },
        device: {
            asyncSearchOptions: searchFilter => {
                let url = APIS.device.deviceList + '/' + selectedApp.id;
                let params = {
                    searchKeyword: searchFilter,
                };
                HttpRequestService.get(url, params, reponse => {
                    $scope.subAppSearchOptions.device = [];
                    $scope.subAppSearchOptions.device = reponse;
                });
            },
            onSelectionChanged: () => {
                isSelectedAll.device = $scope.subAppOptions.device.length === $scope.subAppModel.device.length;
            },
        },
    };
    $scope.subAppIsWarning = {
        app: {
            isSearched: false,
            isWarned: false,
        },
        device: {
            isSearched: false,
            isWarned: false,
        },
        icp: {
            isSearched: false,
            isWarned: false,
        },
    };
    /**指标选择设置*/
    let groupIndicators = [];
    $scope.indicatorSetting = {
        //checkBoxes: true,
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        buttonClasses: 'btn btn-default select-width-140',
        idProperty: 'id',
        displayProp: 'name',
        searchField: 'name',
        groupByTextProvider: groupValue => groupIndicators[groupValue],
        smartButtonTextProvider(selectionArray) {
            if (isSelectedAll.indicator) {
                return '已选择全部';
            }
            return selectionArray.length + '个选择';
        },
        groupBy: 'parentId',
    };
    $scope.indicatorOptions = [];
    $scope.indicatorEvents = {
        onSelectionChanged: () => {
            isSelectedAll.indicator = $scope.indicatorOptions.length === $scope.indicatorModel.length;
        },
    };
    $scope.indicatorIsWarning = {
        isSearched: false,
        isWarned: false,
    };
    $scope.indicatorModel = [{
        description: '统计周期内通过网络链路的所有上下行报文字节数大小总和',
        factor: 'sum(ul_ip_len)+sum(dl_ip_len)',
        hasNextLevel: 'N',
        id: '103',
        level: 1,
        name: '总流量',
        parameter: 'total_ip_len',
        parentId: '1',
        unit: 'MB',
    }];
    /**echart展示指标选择设置*/
    $scope.indicatorSelectedSetting = {
        scrollableHeight: '300px',
        scrollable: true,
        enableSearch: true,
        closeOnSelect: true,
        showUncheckAll: false,
        selectionLimit: 1,
        buttonClasses: 'btn btn-default select-width-140',
        idProperty: 'id',
        displayProp: 'name',
        searchField: 'name',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.indicatorSelectedModel = [];
    $scope.indicatorSelectedEvents = {
        onItemSelect: item => {
            getDataForChart(item);
        },
    };
    /**升降序控制*/
    $scope.sortOptions = [
        {
            id: 1,
            name: '升序',
        },
        {
            id: 2,
            name: '降序',
        },
    ];
    $scope.sortModel = [
        {
            id: 2,
            name: '降序',
        }];
    $scope.sortSetting = {
        scrollableHeight: '70px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        selectionLimit: 1,
        idProperty: 'id',
        displayProp: 'name',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default select-width-140',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].name;
        },
    };
    $scope.sortEvents = {
        onItemDeselect: item => {
            if (item.id === 1) {
                $scope.sortModel = [
                    {
                        id: 2,
                        name: '降序',
                    }];
                getDataForChart($scope.indicatorSelectedModel[0]);
            } else {
                $scope.sortModel = [
                    {
                        id: 1,
                        name: '升序',
                    }];
                getDataForChart($scope.indicatorSelectedModel[0]);
            }
        },
        onItemSelect: item => {
            getDataForChart($scope.indicatorSelectedModel[0]);
        },
    };
    /**设置默认选项*/
    $scope.interval = [{
        id: 1,
        name: '小时',
        value: 60,
    }]; $scope.userType = [{
        id: 0,
        name: '全网',
    }];
    $scope.dimensionsModel = [{
        id: 4,
        name: '全维度',
        parameter: 'all',
        dimensionPro: 'allDimension',
    }];
    $scope.appModel = {
        app: [],
        device: [$scope.appOptions.device[0]],
        icp: [],
    };
    $scope.subAppModel = {
        app: [],
        device: [],
        icp: [],
    };
    $scope.indicatorModel = [{
        description: '统计周期内通过网络链路的所有上下行报文字节数大小总和',
        factor: 'sum(ul_ip_len)+sum(dl_ip_len)',
        hasNextLevel: 'N',
        id: '103',
        level: 1,
        name: '总流量',
        parameter: 'total_ip_len',
        parentId: '1',
        unit: 'MB',
    }];
    $scope.template = [];
    /**数据请求集合*/
    const getData = {
        /**所选大类的业务小类(前100个)*/
        getApplication: model => {
            /**请求对应的业务小类*/
            $scope.subAppOptions.app = [];
            $scope.subAppModel.app = [];
            //let applicationTypes = '';
            let applicationTypesArray = [];

            new Promise((resolve, reject) => {
                // let applicationType = $scope.applicationTypeModel;
                // resolve(applicationType);
                resolve($scope.applicationTypeModel);
            }).then(() => {
                $scope.appModel.app.map(type => {
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
                    $scope.subAppOptions.app = data;
                    if (model) {
                        model.map(item => {
                            /**之前选的小类是否包含在新的大类中*/
                            $scope.appModel.app.map(type => {
                                if (type.applicationType == item.applicationType) {
                                    /**若前100个小类中没有之前所选的小类，则进行添加*/
                                    if ($scope.subAppOptions.app.indexOf(item) == -1) {
                                        $scope.subAppOptions.app.push(item);
                                    }
                                    $scope.subAppModel.app.push(item);
                                }
                            })
                        });

                        /**数组去重*/
                        new Promise((resolve, reject) => {
                            let distinctOptions = $scope.subAppOptions.app;
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
                            $scope.subAppOptions.app = distinctOptions;
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
        /**所有业务小类*/
        getAllApplication: () => {
            let url = APIS.application.applications + '/tree';
            let param = {};
            HttpRequestService.get(url, param, data => {
                //console.log(data);
                allApplication = data;
            });
        },
        /**获取网站列表*/
        getWebsite: () => {
            let url = APIS.device.websiteList;
            let webSiteTypes = '';
            if ($scope.appModel.icp.length > 0) {
                $scope.appModel.icp.map(webSiteType => {
                    webSiteTypes += webSiteType.id + ',';
                });
            }
            let params = {
                websiteTypes: isSelectedAll.websiteType ? -1 : webSiteTypes,
                pageIndex: 1,
                pageSize: 20,
            };
            HttpRequestService.get(url, params, reponse => {
                if (isRecover <= 0) {
                    $scope.subAppModel.icp = [];
                } else {
                    isRecover--;
                }
                $scope.subAppOptions.icp = [];
                $scope.subAppOptions.icp = reponse;
            });
        },
        /**指标选择*/
        getIndicatorlist: () => {
            let url = APIS.indicator.indicators;
            let params = {
                module: 'MultiDim',
                dimension: $scope.dimensionsModel[0].parameter,
                isTree: true,
            };
            if ($scope.dimensionsModel[0].parameter == 'all') {
                params.dimension = 'device';
            }
            HttpRequestService.get(url, params, response => {
                $scope.indicatorOptions = [];
                response.map(indicator => {
                    if (indicator.branches) {
                        groupIndicators[indicator.id + ''] = indicator.name;
                        indicator.branches.map(subIndicator => {
                            $scope.indicatorOptions.push(subIndicator);
                        });
                    }
                });
            })
        },
    };
    /**checkedItemsQuery*/
    const checkQueryItems = () => {
        let isSelectedApp = false;
        let isSelectedSubApp = false;
        let isSelectedIndicator = false;
        let isSelectedDate = false;
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
        switch ($scope.dimensionsModel[0].id) {
            case 1: {
                /**设备类型未选*/
                if ($scope.appModel.device.length <= 0) {
                    $scope.appIsWarning.device.isSearched = true;
                    $scope.appIsWarning.device.isWarned = true;
                } else {
                    $scope.appIsWarning.device.isSearched = false;
                    $scope.appIsWarning.device.isWarned = false;
                    isSelectedApp = true;
                }
                /**设备名称未选*/
                if ($scope.subAppModel.device.length <= 0) {
                    $scope.subAppIsWarning.device.isWarned = true;
                    $scope.subAppIsWarning.device.isSearched = true;
                } else {
                    $scope.subAppIsWarning.device.isWarned = false;
                    $scope.subAppIsWarning.device.isSearched = false;
                    isSelectedSubApp = true;
                }
                //return true;
                break;
            }
            case 2: {
                /**业务大类未选*/
                if ($scope.appModel.app.length <= 0) {
                    $scope.appIsWarning.app.isSearched = true;
                    $scope.appIsWarning.app.isWarned = true;
                    //return false;
                } else {
                    $scope.appIsWarning.app.isSearched = false;
                    $scope.appIsWarning.app.isWarned = false;
                    isSelectedApp = true;
                }
                // /**业务小类未选*/
                // if ($scope.subAppModel.app.length <= 0) {
                //     $scope.subAppIsWarning.app.isWarned = true;
                //     $scope.subAppIsWarning.app.isSearched = true;
                //     //return false;
                // } else {
                //     $scope.subAppIsWarning.app.isWarned = false;
                //     $scope.subAppIsWarning.app.isSearched = false;
                //     isSelectedSubApp = true;
                // }
                    isSelectedSubApp = true;
                break;
            }
            case 3: {
                /**网站归属未选*/
                if ($scope.appModel.icp.length <= 0) {
                    $scope.appIsWarning.icp.isSearched = true;
                    $scope.appIsWarning.icp.isWarned = true;
                    //return false;
                } else {
                    $scope.appIsWarning.icp.isSearched = false;
                    $scope.appIsWarning.icp.isWarned = false;
                    isSelectedApp = true;
                }
                /**网站名称未选*/
                // if ($scope.subAppModel.icp.length <= 0) {
                //     $scope.subAppIsWarning.icp.isWarned = true;
                //     $scope.subAppIsWarning.icp.isSearched = true;
                //     //return false;
                // } else {
                //     $scope.subAppIsWarning.icp.isWarned = false;
                //     $scope.subAppIsWarning.icp.isSearched = false;
                //     isSelectedSubApp = true;
                // }
                isSelectedSubApp = true;
                //return true;
                break;
            }
            case 4: {
                isSelectedSubApp = true;
                isSelectedApp = true;
                break;
            }
        }
        if ($scope.indicatorModel.length <= 0) {
            $scope.indicatorIsWarning.isSearched = true;
            $scope.indicatorIsWarning.isWarned = true;
        } else {
            $scope.indicatorIsWarning.isSearched = false;
            $scope.indicatorIsWarning.isWarned = false;
            isSelectedIndicator = true;
        }
        if (isSelectedApp && isSelectedSubApp && isSelectedIndicator && isSelectedDate) {
            return true;
        }
        return false;
    };

    /**初始化echart*/
    let deviceIndicatorChart = echarts.init(document.getElementById('deviceIndicatorChart'), 'macarons');
    let deviceIndicatorChartOptions = {
        title: {
            text: '',
        },
        tooltip: {
            trigger: 'axis',
            formatter(params) {
                let toolStr = params[0].axisValueLabel;
                params.map(param => {
                    toolStr += '<br>' + param.marker + param.seriesName + ' : ' + param.value + $scope.indicatorSelectedModel[0].unit;
                });
                return toolStr;
            },
        },
        legend: {
            type: 'scroll',
            data: [],
            formatter(name) {
                if (name.length > 10) {
                    return name.substr(0, 9) + '...';
                } else {
                    return name;
                }
            },
        },
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
            boundaryGap: false,
            data: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
            // axisLabel: {
            //     formatter: function (value) {
            //         return util.formatTime(parseInt(value), 'MM-dd HH:mm');
            //     }
            // }
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                name: '对象一',
                type: 'line',
                stack: '总量',
                lineStyle: {
                    normal: {
                        width: 1,
                        color: DefaultData.echartThemeColor[1],
                        type: 'solid',
                        shadowBlur: 5,
                    },
                },
                data: [0],
            },
        ],
    };
    let hoverLegend = (function () {
        let $chart = $('#deviceIndicatorChart'), isShow = false;
        $chart.append('<div class="hoverLegend"></div>');
        let $hoverLegend = $('.hoverLegend');
        deviceIndicatorChart.on('highlight', function (e) {
            let seriesName = e.seriesName;
            if(seriesName) {
                isShow = true;
                $hoverLegend.text(seriesName);
            }else {
                isShow = false;
            }
        });
        $chart.on('mousemove', function (e) {
            let bodyW = document.body.clientWidth;
            let left = e.clientX, top = e.clientY;
            if(left + 300 > bodyW) {
                left = left - 150;
                top = top + 10;
            }
            isShow ? $hoverLegend.show().css({
                left: left+20+'px',
                top: top+10+'px'
            }) : $hoverLegend.hide();
        }).on('mouseout', function () {
            $hoverLegend.hide();
        });
    })();

    const initCharts = () => {
        deviceIndicatorChart.setOption(deviceIndicatorChartOptions);
    };
    /**初始化数据*/
    const getTemplates = () => {
        let url = APIS.template.templates + 'multiDimension';
        let params = {};
        HttpRequestService.get(url, params, response => {
            if (response) {
                $scope.templateOptions = response;
            }
        });
    };
    /**选择模板*/
    const selectedTemplate = template => {
        isRecover = 2;
        $scope.userType = util.cloneObj(template.userType);
        $scope.dimensionsModel = util.cloneObj(template.dimensionsModel);
        getData.getIndicatorlist();
        $scope.dimensionsEvents.onItemSelect(template.dimensionsModel[0]);
        if (!template.app.app[0]) {
            template.app.app = [];
        }
        if (!template.app.device[0]) {
            template.app.device = [];
        }
        if (!template.app.icp[0]) {
            template.app.icp = [];
        }
        $scope.appModel = util.cloneObj(template.app);
        if ($scope.appModel.app.length > 0) {
            $scope.appEvents.app.onSelectionChanged();
        }
        if ($scope.appModel.device.length > 0) {
            template.app.device.map(item => {
                $scope.appEvents.device.onItemSelect(item);
            })
        }
        if ($scope.appModel.icp.length > 0) {
            $scope.appEvents.icp.onSelectionChanged();
        }
        if (!template.subApp.app[0]) {
            template.subApp.app = [];
        }
        if (!template.subApp.device[0]) {
            template.subApp.device = [];
        }
        if (!template.subApp.icp[0]) {
            template.subApp.icp = [];
        }
        $scope.subAppModel = util.cloneObj(template.subApp);
        $scope.indicatorModel = util.cloneObj(template.indicatorModel);
        $scope.interval = util.cloneObj(template.interval);
        $scope.timeSlots = util.cloneObj(template.timeSlots);
        $scope.indicatorModel.length && $scope.indicatorEvents.onSelectionChanged();
        /*同步更新时间粒度到日期选择控件中*/
        $scope.dateInterval = $scope.interval[0].value + '';
    };
    /**查询栏校验恢复*/
    const resetCheckQueryItems = () => {
        //查询成功后消除红框
        for (let item in $scope.appIsWarning) {
            $scope.appIsWarning[item].isWarned = false;
            $scope.appIsWarning[item].isWarned = false;
        }
        for (let item in $scope.subAppIsWarning) {
            $scope.subAppIsWarning[item].isWarned = false;
            $scope.subAppIsWarning[item].isWarned = false;
        }
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
                                    reject('该模版名称已被其他模版使用！');
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
                        scope: 'multiDimension',
                        name: input,
                        userType: $scope.userType,
                        dimensionsModel: $scope.dimensionsModel,
                        app: $scope.appModel,
                        subApp: $scope.subAppModel,
                        indicatorModel: $scope.indicatorModel,
                        interval: $scope.interval,
                        appLabel: $scope.appLabel,
                        subApplabel: $scope.subApplabel,
                        timeSlots: $scope.timeSlots,
                    };
                    let url = APIS.template.templates + 'multiDimension';
                    HttpRequestService.post(url, {}, requestBody, response => {
                        getTemplates();
                        let subUrl = APIS.template.templates + 'multiDimension/' + response;
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
                    html: '<input id="templateInput" class="swal2-input"  style="display: block;"/>' +
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
    let templateSave = input => new Promise((resolve, reject) => {
        let errorText = '';
        $scope.templateOptions.map(template => {
            if (template.name === input) {
                errorText = '已有“' + input + '”模板，请重新输入名称';
            }
        });
        if (errorText !== '已有“' + input + '”模板，请重新输入名称') {
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
        if (errorText.length > 0) {
            $('#templateValidationError').css('display', 'block');
            $('#templateValidationError').text(errorText);
            reject();
        } else {
            $('#templateValidationError').css('display', 'none');
            resolve();
        }
    }).then(() => {
        $scope.startTime = $scope.startTimeMin;
        $scope.endTime = $scope.endTimeMin;
        let requestBody = {
            scope: 'multiDimension',
            name: input,
            userType: $scope.userType,
            dimensionsModel: $scope.dimensionsModel,
            app: $scope.appModel,
            subApp: $scope.subAppModel,
            indicatorModel: $scope.indicatorModel,
            interval: $scope.interval,
            appLabel: $scope.appLabel,
            subApplabel: $scope.subApplabel,
            timeSlots: $scope.timeSlots,
        };
        let url = APIS.template.templates + 'multiDimension';
        HttpRequestService.post(url, {}, requestBody, response => {
            getTemplates();
            let subUrl = APIS.template.templates + 'multiDimension/' + response;
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
    }, () => ({}));
    /**更新方法*/
    let templateUpdate = input => new Promise((resolve, reject) => {
        let errorText = '';
        // $scope.templateOptions.map(template => {
        //     if (template.name === input) {
        //         errorText = '该模版名称已被其他模版使用！';
        //     }
        // });
        if (errorText !== '该模版名称已被其他模版使用！') {
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
        if (errorText.length > 0) {
            $('#templateValidationError').css('display', 'block');
            $('#templateValidationError').text(errorText);
            reject();
        } else {
            $('#templateValidationError').css('display', 'none');
            resolve();
        }
    }).then(() => {
        let requestBody = {
            scope: 'multiDimension',
            id: $scope.template[0].id,
            name: input,
            userType: $scope.userType,
            dimensionsModel: $scope.dimensionsModel,
            app: $scope.appModel,
            subApp: $scope.subAppModel,
            indicatorModel: $scope.indicatorModel,
            interval: $scope.interval,
            appLabel: $scope.appLabel,
            subApplabel: $scope.subApplabel,
            timeSlots: $scope.timeSlots,
        };
        let url = APIS.template.templates + 'multiDimension';
        HttpRequestService.put(url, {}, requestBody, () => {
            getTemplates();
            swal({
                text: '更新模板成功!',
                type: 'success',
                allowOutsideClick: false,
            });
            let subUrl = APIS.template.templates + 'multiDimension/' + requestBody.id;
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
    /////////////////////////////////////////////////////////////////////

    /**表格数据处理*/
    let initColumn = [
        {
            displayName: '时间',
            name: 'statisticalTime',
            width: 200,
        },
        {
            displayName: '用户类型',
            name: 'userType',
            width: 200,
        },
    ];
    // let tableWidth = $('.show-grid-group').width() - 20;
    const fillColumn = () => {
        let columns = [
            {
                displayName: '时间',
                name: 'statisticalTime',
                width: 150,
            },
            {
                displayName: '用户类型',
                name: 'userType',
                width: 120,
            },
        ];
        switch ($scope.dimensionsModel[0].id) {
            case 1: {
                columns.push({
                    displayName: '设备名称',
                    name: 'deviceName',
                    width: 310,
                });
                break;
            }
            case 2: {
                columns.push({
                    displayName: '业务大类',
                    name: 'appTypeName',
                    width: 200,
                });
                if ($scope.subAppModel.app.length != 0) {
                    columns.push({
                    displayName: '业务小类',
                    name: 'appName',
                    width: 200,
                });
                }
                break;
            }
            case 3: {
                columns.push({
                    displayName: '网站归属',
                    name: 'websiteTypeName',
                    width: 200,
                });
                if ($scope.subAppModel.icp.length != 0) {
                    columns.push({
                        displayName: '网站名称',
                        name: 'websiteName',
                        width: 200,
                    });
                }
                break;
            }
        }
        if ($scope.indicatorModel.length > 0) {
            $scope.indicatorModel.map(indicator => {
                let column = {};
                column.name = indicator.parameter;
                if (indicator.unit) {
                    column.displayName = indicator.name + '(' + indicator.unit + ')';
                } else {
                    column.displayName = indicator.name;
                }

                // column.width = (tableWidth - 620)/$scope.indicatorModel.length;
                column.width = 200;
                column.cellTemplate = setCelltemplate();
                columns.push(column);
            });
        }
        $scope.DIAGridOption.columnDefs = columns;
    };


    /*转换关键指标为_level格式*/
    $scope.convertCol = col =>{
        return col+'_level';
    };
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

    };

    const getParamsInSearch = (pageIndex, pageSize, isCountotal) => {
        /**查询参数定义*/
        let requestParams = {};
        let dimensionIds = '';
        let dimensionTypes = '';
        switch ($scope.dimensionsModel[0].parameter) {
            case 'device': {
                if (isSelectedAll.device) {
                    dimensionIds = '-1';
                } else {
                    $scope.subAppModel.device.map(subApp => {
                        dimensionIds += (subApp.id + ',');
                    });
                }
                dimensionTypes = $scope.appModel.device[0].id;
                break;
            }
            case 'app': {
                if (isSelectedAll.subApp) {
                    dimensionIds = '-1';
                } else {
                    $scope.subAppModel.app.map(subApp => {
                        dimensionIds += (subApp.application + ',');
                    });
                }
                // dimensionTypes = $scope.appModel.app[0].applicationType;
                if ($scope.subAppModel.app.length == 0) {
                    $scope.appModel.app.map(type => {
                        dimensionTypes += (type.applicationType + ',');
                    });
                }
                break;
            }
            case 'icp': {
                if (isSelectedAll.website) {
                    dimensionIds = '-1';
                } else {
                    $scope.subAppModel.icp.map(subApp => {
                        dimensionIds += (subApp.id + ',');
                    });
                }
                // dimensionTypes = $scope.appModel.icp[0].id;
                if ($scope.subAppModel.icp.length == 0) {
                    $scope.appModel.icp.map(type => {
                        dimensionTypes += (type.id + ',');
                    });
                }
                // console.log($scope.appModel.icp);
                // console.log($scope.subAppModel.icp);
                break;
            }
        }
        let indicatorIds = '';
        $scope.indicatorModel.map(indicator => {
            indicatorIds += (indicator.id + ',');
        });
        if ($scope.dimensionsModel[0].parameter == 'app'
        ) {
            requestParams.applicationGroups = $scope.applicationGroups;
        }
        if ($scope.dimensionsModel[0].parameter == 'icp'
        ) {
            requestParams.websiteGroups = $scope.websiteGroups;
        }
        requestParams.userType = $scope.userType[0].id;
        requestParams.dimension = $scope.dimensionsModel[0].parameter;
        requestParams.dimensionType = dimensionTypes;
        requestParams.dimensionValues = dimensionIds;
        requestParams.interval = $scope.interval[0].value;
        requestParams.timeSlots = $scope.timeSlots.startDate + ',' + $scope.timeSlots.endDate;
        requestParams.indicatorIds = indicatorIds;
        requestParams.orderBys = 'statisticalTime\u0020asc';
        requestParams.pageIndex = pageIndex;
        requestParams.pageSize = pageSize;
        requestParams.isCountotal = isCountotal;
        requestParams.isGroupByTime = true;
        if ($scope.subAppModel.app.length == 0 && $scope.dimensionsModel[0].parameter == 'app') {
            requestParams.isGroupByApp = true;
        } else {
            requestParams.isGroupByApp = false;
        }
        if ($scope.subAppModel.icp.length == 0 && $scope.dimensionsModel[0].parameter == 'icp') {
            requestParams.isGroupByWebsiteType = true;
        } else {
            requestParams.isGroupByWebsiteType = false;
        }
        return requestParams;
    };

    const getParamsInSearchForAllData = (pageIndex, pageSize) => {
        /**查询参数定义*/
        let requestParams = {};
        let indicatorIds = '';
        $scope.indicatorModel.map(indicator => {
            indicatorIds += (indicator.id + ',');
        });
        requestParams.userType = $scope.userType[0].id;
        requestParams.dimension = $scope.dimensionsModel[0].parameter;
        requestParams.interval = $scope.interval[0].value;
        requestParams.timeSlots = $scope.timeSlots.startDate + ',' + $scope.timeSlots.endDate;
        requestParams.indicatorIds = indicatorIds;
        requestParams.orderBys = 'statisticalTime\u0020asc';
        requestParams.pageIndex = pageIndex;
        requestParams.pageSize = pageSize;
        return requestParams;
    };
    const initDIAGrid = () => {
        $scope.DIAGridOption = {
            enableGridMenu: true,
            enablePaginationControls: true,
            useExternalPagination: false,
            paginationPageSizes: [10, 30, 50],
            paginationPageSize: 10,
            paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
            cellTooltip: true,
            exporterCsvFilename: '设备维度查询数据表.csv',
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
        };
        /***导出数据*/
        let getDeviceIndicatorData = function () {
            return new Promise((resolve, reject) => {
                let url = APIS.device.indicatorAnalysis;
                let param = getParamsInSearch(1, -1, true);
                if ($scope.dimensionsModel[0].parameter == 'all') {
                    url = APIS.device.indicatorAnalysisAllDimension;
                    param = getParamsInSearchForAllData(1, -1);
                }
                HttpRequestService.get(url, param, data => {
                    $scope.DIAGridOption.data.length = 0;
                    data.map(row => {
                        $scope.DIAGridOption.data.push(row);
                    });
                    resolve();
                }, () => {
                    reject();
                });
            });
        };
        /**初始化列头*/
        fillColumn();
    };
    /**填充数据到echart图*/
    const setDataForChart = (data, dimension, indicatorName) => {
        let legendData = [];
        let xAxisData = [];
        let seriesData = [];
        data.entities.map(record => {
            if (legendData.indexOf(record[dimension]) === -1) {
                legendData.push(record[dimension]);
            }
        });
        data.entities.map(record => {
            if (xAxisData.indexOf($filter('date')(record.statisticalTime, 'MM-dd HH:mm')) === -1) {
                xAxisData.push($filter('date')(record.statisticalTime, 'MM-dd HH:mm'));
            }
        });
        let i = 0;
        legendData.map(legend => {
            let series = {
                name: legend,
                type: 'line',
                stack: '总量'+i,
                lineStyle: {
                    normal: {
                        width: 1,
                        color: DefaultData.echartThemeColor[i],
                        type: 'solid',
                        shadowBlur: 5,
                    },
                },
                data: [],
            };
            i++;
            xAxisData.map(xAxis => {
                data.entities.map(record => {
                    for (let key in record) {
                        if (typeof record[key] === 'number') {
                            record[key] = Math.round(record[key] * 100) / 100;
                            /**小数位限制为两位*/
                        }
                    }
                    if (record[dimension] === legend && $filter('date')(record.statisticalTime, 'MM-dd HH:mm') === xAxis) {
                        if(record[indicatorName] == null){
                            series.data.push(0)
                        }
                        else {
                            series.data.push(record[indicatorName]);
                        }
                    }
                })
            });
            seriesData.push(series);
        });
        deviceIndicatorChartOptions.legend.data = [];
        deviceIndicatorChartOptions.xAxis.data = [];
        deviceIndicatorChartOptions.series = [];
        deviceIndicatorChartOptions.legend.data = legendData;
        deviceIndicatorChartOptions.xAxis.data = xAxisData;
        // deviceIndicatorChartOptions.xAxis.data = xAxisData.sort(function (a, b) {
        //     return a-b;
        // });
        deviceIndicatorChartOptions.series = seriesData;
        deviceIndicatorChart.setOption(deviceIndicatorChartOptions, true);
        Loading.hideLoading('#deviceIndicatorChart');
    };
    const getDataForChart = indicator => {
        let url = APIS.device.indicatorAnalysisTop10;
        let requestParams = getParamsInSearch(1, 10, true);
        requestParams.indicatorIds = indicator.id;
        if ($scope.sortModel[0].id === 1) {
            requestParams.orderBys = indicator.parameter + '\u0020asc';
        } else {
            requestParams.orderBys = indicator.parameter + '\u0020desc';
        }
        requestParams.isGroupByTime = false;
        $scope.indicatorSelectedModel[0] = indicator;
        let applicationGroup = [];
        let websiteGroup = [];
        let dimensionValue = [];
        if ($scope.dimensionsModel[0].parameter == 'all') {
            url = APIS.device.indicatorAnalysisAllDimension;
            requestParams = getParamsInSearchForAllData(1, 10);
            // console.log('查全维度');
        }
        Loading.isLoading('#deviceIndicatorChart');
        HttpRequestService.get(url, requestParams, response => {
            if (response.entities) {
                response.entities.map(item => {
                    switch (requestParams.dimension) {
                        case 'device': {
                            dimensionValue += (item.device_id + ',');
                            break;
                        }
                        case 'app': {
                            if (item.appSubType == null) {
                                dimensionValue += (item.appType + ',');
                            } else {
                                dimensionValue += (item.appSubType + ',');
                                applicationGroup.push(item.appType + ',' + item.appSubType);
                            }
                            break;
                        }
                        case 'icp': {
                            //dimensionValue += (item.websiteId + ',');
                            if (item.websiteId == null) {
                                dimensionValue += (item.websiteType + ',');
                            } else {
                                dimensionValue += (item.websiteId + ',');
                                websiteGroup.push(item.websiteType + ',' + item.websiteId);
                            }
                            break;
                        }
                    }
                });
            }
            let urlR = APIS.device.indicatorAnalysis;
            let requestParamsR = getParamsInSearch(1, -1, true);
            if ($scope.dimensionsModel[0].parameter == 'all') {
                urlR = APIS.device.indicatorAnalysisAllDimension;
            }
            $scope.indicatorSelectedModel[0] = indicator;
            requestParamsR.applicationGroups = applicationGroup.join(';');
            requestParamsR.websiteGroups = websiteGroup.join(';');
            if (requestParamsR.dimension != 'app' && requestParamsR.dimension != 'icp' && dimensionValue.length != 0) {
                requestParamsR.dimensionValues = dimensionValue;
            }
            if ($scope.subAppModel.app.length == 0 && requestParamsR.dimension == 'app') {
                requestParamsR.dimensionType = dimensionValue;
            }
            if ($scope.subAppModel.app.length == 0 && requestParamsR.dimension == 'icp') {
                requestParamsR.dimensionType = dimensionValue;
            }
            requestParamsR.indicatorIds = indicator.id;

            if ($scope.dimensionsModel[0].parameter == 'all') {
                urlR = APIS.device.indicatorAnalysisAllDimension;
                requestParamsR = getParamsInSearchForAllData(1, -1);
            }
            HttpRequestService.get(urlR, requestParamsR, records => {
                if ($scope.dimensionsModel[0].dimensionPro == 'allDimension') {
                    setDataForChart(records, 'userType', $scope.indicatorSelectedModel[0].parameter);
                } else {
                setDataForChart(records, $scope.dimensionsModel[0].dimensionPro, $scope.indicatorSelectedModel[0].parameter);
                }
            });
            resetCheckQueryItems();
        });
    };
    /**填充数据到grid表*/
    const setDataForGrid = data => {
        fillColumn();
        $scope.DIAGridOption.data = [];
        data.map(rowData => {
            rowData.statisticalTime = util.formatTime(rowData.statisticalTime, 'yyyy/MM/dd HH:mm');
            /**时间格式化*/
            $scope.DIAGridOption.data.push(rowData);
        });
        Loading.hideLoading('.show-grid-group');
    };
    const getDataForGrid = () => {
        let url = APIS.device.indicatorAnalysis;
        let requestParams = getParamsInSearch(1, -1, true);
        if ($scope.dimensionsModel[0].parameter == 'all') {
            url = APIS.device.indicatorAnalysisAllDimension;
        }
        Loading.isLoading('.show-grid-group');
        HttpRequestService.get(url, requestParams, response => {
            let statistics = response.entities;
            $scope.togglePanel();
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
    /**查询点击事件*/
    $scope.searchData = () => {
        if (!checkQueryItems()) {
            return;
        }
        /**业务大小类判断**/
        //小类全选时
        if (isSelectedAll.subApp) {
            //大类全选，小类全选
            if (isSelectedAll.app) {
                $scope.applicationGroups = '-1,-1';
                //大类选部分,小类全选
            } else {
                let applicationGroupString = [];
                $scope.appModel.app.map(thisApplicationType => {
                    applicationGroupString.push(thisApplicationType.applicationType + ',-1');
                });
                $scope.applicationGroups = applicationGroupString.join(';');
            }
        } else {
            //大类选部分，小类选部分
            let applicationGroupString = [];
            $scope.subAppModel.app.map(thisApplication => {
                applicationGroupString.push(thisApplication.applicationType + ',' + thisApplication.application);
            });
            $scope.applicationGroups = applicationGroupString.join(';');
        }

        /**网站选择判断**/
        //网站全选时
        if (isSelectedAll.website) {
            //网站归属全选，网站全选
            if (isSelectedAll.websiteType) {
                $scope.websiteGroups = '-1,-1';
                //网站归属选部分,网站全选
            } else {
                let websiteGroupString = [];
                $scope.appModel.icp.map(thisWebsiteType => {
                    websiteGroupString.push(thisWebsiteType.id + ',-1');
                });
                $scope.websiteGroups = websiteGroupString.join(';');
            }
        } else {
            //网站归属选部分，网站选部分
            let websiteGroupString = [];
            if($scope.subAppModel.icp.length > 0){
                $scope.subAppModel.icp.map(thisWebsite => {
                    websiteGroupString.push(thisWebsite.websiteType + ',' + thisWebsite.id);
                });
            }
            $scope.websiteGroups = websiteGroupString.join(';');
        }
        $scope.indicatorSelectedOptions = [];
        $scope.indicatorModel.map(item => {
            $scope.indicatorSelectedOptions.push(item);
        });
        getDataForChart($scope.indicatorModel[0]);
        getDataForGrid();
    };
    /**窗口大小改变*/
    window.onresize = () => {
        $('#deviceIndicatorChart').css('height', $('#show-chart-group').height() * 0.9);
        deviceIndicatorChart.resize();
    };
    /******************** 初始化加载页面 *******************************/
    const initController = () => {
        /**初始化时间控件*/
        $scope.appEvents.device.onItemSelect({
            id: 4,
            name: '全维度',
            parameter: 'all',
            dimensionPro: 'allDimension',
        });
        /**初始化echart*/
        initCharts();
        /**获取模板列表*/
        getTemplates();
        /**获取默认指标列表*/
        getData.getIndicatorlist();
        /**初始化表格*/
        initDIAGrid();
        /**请求全部的业务小类*/
        getData.getAllApplication();
    };
    initController();
}
MultiDimIndicatorAnalysisController.$inject = ['$scope', '$state', '$filter', 'HttpRequestService'];