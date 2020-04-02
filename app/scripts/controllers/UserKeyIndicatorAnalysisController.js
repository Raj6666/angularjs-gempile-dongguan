'use strict';

import swal from 'sweetalert2';
import Loading from '../custom-pulgin/Loading';
import ShakeWarning from '../custom-pulgin/ShakeWarning';
import APIS from '../configs/ApisConfig';
import DefaultData from '../data/UserKeyIndicatorAnalysisDataConfig';

/**
 * UserKeyIndicatorAnalysisController
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function UserKeyIndicatorAnalysisController($scope, $filter, HttpRequestService) {
    /**点击下拉箭头*/
    $scope.showSearchPanel = true;
    $scope.togglePanel = () => {
        $scope.showSearchPanel = !$scope.showSearchPanel;
        $('#queryPanelBody').slideToggle('normal');
    };
    /**更新时间*/
    $scope.upDateDate = (timeSlots, isWarning) => {
        $scope.timeSlots = timeSlots;
        $scope.isWarning = isWarning;
    };
    /** multi-select Localize */
    $scope.selectorText = {
        checkAll: '选择全部',
        uncheckAll: '取消全部',
        buttonDefaultText: '请选择',
        dynamicButtonTextSuffix: '个选择',
        searchPlaceholder: '搜索',
    };

    /** userType */
    $scope.userTypeOptions = DefaultData.userTypes;
    $scope.userType = [
        $scope.userTypeOptions[0],
    ];
    $scope.userTypeSetting = {
        scrollableHeight: '70px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        selectionLimit: 1,
        idProperty: 'id',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default multi-select-width',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].label;
        },
    };
    $scope.userTypeEvents = {
        onItemDeselect: () => {
            $scope.userType = [$scope.userTypeOptions[0]];
        },
        onSelectionChanged: () => {
            $scope.onAccountChange();
        },
    };

    /** interval */
    $scope.intervalOptions = DefaultData.intervals;
    $scope.interval = [
        $scope.intervalOptions[0],
    ];
    $scope.intervalSetting = {
        scrollableHeight: '40px',
        showCheckAll: false,
        showUncheckAll: false,
        scrollable: true,
        selectionLimit: 1,
        idProperty: 'id',
        closeOnSelect: true,
        buttonClasses: 'btn btn-default multi-select-width',
        smartButtonTextProvider(selectionArray) {
            return selectionArray[0].label;
        },
    };
    $scope.intervalEvents = {
        onItemDeselect: () => {
            $scope.interval = [
                $scope.intervalOptions[0],
            ];
        },
        onItemSelect: item => {
            $scope.dateInterval = item.value + '';
        },
    };

    /** account */
    let isCheckedAccount = false;
    /** 检查是否为合法帐号 */
    $scope.checkAccount = () => {
        if ($scope.account == null || $scope.account.length == 0) {
            swal({
                text: '账号不能为空',
                type: 'warning',
                allowOutsideClick: false,
            });
            ShakeWarning.isWarning('#account');
            return;
        }
        if ($filter('inputIsIllegal')($scope.account, 'chinese') || $filter('inputIsIllegal')($scope.account, 'account')) {
            swal({
                text: '请正确填写帐号！',
                type: 'warning',
                allowOutsideClick: false,
            });
            ShakeWarning.isWarning('#account');
            return;
        }
        let url = APIS.user.accountNumberInfo + '/' + $scope.account;
        HttpRequestService.get(url, null, accountConfig => {
            if (accountConfig == null || accountConfig == '') {
                swal({
                    text: '此账户未在配置中！',
                    type: 'warning',
                    allowOutsideClick: false,
                });
                ShakeWarning.isWarning('#account');
            } else if (accountConfig.userType != $scope.userType[0].value) {
                swal({
                    text: '此账户与用户类型不匹配！',
                    type: 'warning',
                    allowOutsideClick: false,
                });
                ShakeWarning.isWarning('#account');
            } else {
                swal({
                    text: '存在该帐号！',
                    type: 'success',
                    allowOutsideClick: false,
                });
                ShakeWarning.hideWarning('#account');
                isCheckedAccount = true;
            }
        }, () => {
            swal({
                text: '请求失败,请检查网络',
                type: 'warning',
                allowOutsideClick: false,
            });
        });
    };
    /** 账号搜索输入框，键盘回车事件 */
    $scope.onAccountKeyUp = event => {
        let keyCode = window.event ? event.keyCode : event.which;
        if (keyCode === 13) {
            $scope.checkAccount();
        }
    };
    $scope.onAccountChange = () => {
        isCheckedAccount = false;
    };

    /** ApplicationType */
    let isSelectAllApplicationTypes = false;
    $scope.applicationType = [];
    $scope.applicationTypeOptions = [];
    $scope.applicationTypeSetting = {
        checkBoxes: true,
        scrollableHeight: '250px',
        scrollable: true,
        enableSearch: true,
        selectionLimit: 0,
        idProperty: 'id',
        displayProp: 'name',
        buttonClasses: 'btn btn-default multi-select-width',
        smartButtonTextProvider(selectionArray) {
            if (isSelectAllApplicationTypes) {
                return '已选择全部';
            }
            return selectionArray.length + ' 个选择';
        },
    };
    $scope.applicationTypeEvents = {
        onItemSelect: () => {
            isSelectAllApplicationTypes = $scope.applicationType.length === $scope.applicationTypeOptions.length;
            getApplication($scope.application);
        },
        onItemDeselect: () => {
            isSelectAllApplicationTypes = false;
            if ($scope.applicationType.length <= 0) {
                $scope.application = [];
                $scope.applicationOptions = [];
            } else {
                getApplication($scope.application);
            }
        },
        onSelectAll: () => {
            isSelectAllApplicationTypes = true;
            getApplication($scope.application);
        },
        onDeselectAll: () => {
            isSelectAllApplicationTypes = false;
            $scope.application = [];
            $scope.applicationOptions = [];
            applicationsForSearch = [];
        },
    };
    const getApplicationTypeList = () => {
        HttpRequestService.get(APIS.application.applicationTypes, {
            pageIndex: 1,
            pageSize: -1,
        }, result => {
            $scope.applicationTypeOptions = result;
        });
    };

    /** Application */
    let applicationTree = [];
    let applicationsForSearch = [];
    let isSelectAllApplications = false;
    $scope.application = [];
    $scope.applicationOptions = [];
    $scope.applicationSetting = {
        checkBoxes: true,
        scrollableHeight: '250px',
        scrollable: true,
        enableSearch: true,
        enableAsyncSearch: true,
        selectedToTop: true,
        idProperty: 'id',
        displayProp: 'name',
        buttonClasses: 'btn btn-default multi-select-width',
        smartButtonTextProvider(selectionArray) {
            if (isSelectAllApplications) {
                return '已选择全部';
            }
            return selectionArray.length + ' 个选择';
        },
    };
    $scope.applicationEvents = {
        asyncSearchOptions: searchFilter => {
            let searchOption = [];
            let counter = 0;
            for (let i = 0; i < applicationsForSearch.length; i++) {
                if (applicationsForSearch[i].name.indexOf(searchFilter) >= 0) {
                    searchOption.push(applicationsForSearch[i]);
                    counter++;
                }
                if (counter > 20) {
                    break;
                }
            }
            $scope.applicationSearchOptions = searchOption;
        },
        onItemSelect: () => {
            isSelectAllApplications = false;
        },
        onItemDeselect: () => {
            isSelectAllApplications = false;
        },
        onSelectAll: () => {
            if ($scope.applicationOptions.length != 0) {
                isSelectAllApplications = true;
            } else {
                isSelectAllApplications = false;
            }
        },
        onDeselectAll: () => {
            isSelectAllApplications = false;
        },
    };
    const getApplication = selectedApplications => {
        /**请求对应的业务小类*/
        $scope.application = [];
        $scope.applicationOptions = [];
        new Promise((resolve, reject) => {
            resolve($scope.applicationType);
        }).then(() => {
            let applicationTypeList = [];
            $scope.applicationType.map(thisApplicationType => {
                applicationTypeList.push(thisApplicationType.applicationType);
            });
            /**获取所选的大类的前100个类*/
            HttpRequestService.get(APIS.application.applications, {
                applicationTypes: Array.isArray(applicationTypeList) ? applicationTypeList.join(',') : null,
                pageIndex: 1,
                pageSize: 100,
            }, result => {
                $scope.applicationOptions = result;
                if (selectedApplications) {
                    selectedApplications.map(thisSelectedApplication => {
                        // /**若前100个小类中没有之前所选的小类，则进行添加*/
                        // if ($scope.applicationOptions.indexOf(thisSelectedApplication) == -1) {
                        //     $scope.applicationOptions.push(thisSelectedApplication);
                        // }
                        /**之前选的小类是否包含在新的大类中*/
                        $scope.applicationType.map(type => {
                            if (type.applicationType == thisSelectedApplication.applicationType) {
                                /**若前100个小类中没有之前所选的小类，则进行添加*/
                                if ($scope.applicationOptions.indexOf(thisSelectedApplication) == -1) {
                                    $scope.applicationOptions.push(thisSelectedApplication);
                                }
                                $scope.application.push(thisSelectedApplication);
                            }
                        })
                    });

                    /**数组去重*/
                    new Promise((resolve, reject) => {
                        let distinctOptions = $scope.applicationOptions;
                        selectedApplications.map(item => {
                            let hasModel = 0;
                            for (let i = 0; i < distinctOptions.length; i++) {
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
                //$scope.application = selectedApplications;
            });
            /**根据所选的大类，把所有所选的小类填充到异步查询所用数组*/
            // applicationsForSearch = [];
            // if (Array.isArray(applicationTypeList) && applicationTypeList.length > 0) {
            //     applicationTree.map(thisApplicationBranch => {
            //         for (let i = 0; i < applicationTypeList.length; i++) {
            //             if (thisApplicationBranch.applicationType === applicationTypeList[i]) {
            //                 applicationsForSearch.push(thisApplicationBranch.branches);
            //                 break;
            //             }
            //         }
            //     });
            // }
            /**根据所选的大类，把所有所选的小类填充到异步查询所用数组*/
            applicationsForSearch = [];
            applicationTypeList.map(selectedType => {
                applicationTree.map(app => {
                    if (app.applicationType == selectedType) {
                        app.branches.map(appInBranches => {
                            applicationsForSearch.push(appInBranches);
                        })
                    }
                });
            });
        });
    };
    const getApplicationTree = () => {
        HttpRequestService.get(APIS.application.applicationTree, null, result => {
            applicationTree = result;
        });
    };

    /** Indicator */
    let indicatorGroupMap = new Map();
    $scope.indicator = [{
        description: '统计周期内通过网络链路的所有上下行报文字节数大小总和',
        factor: 'sum(ul_ip_len)+sum(dl_ip_len)',
        hasNextLevel: 'N',
        id: '103',
        level: 1,
        name: '总流量',
        parameter: 'total_ip_len',
        parentId: '1',
        unit: 'Byte',
    }];
    $scope.indicatorOptions = [];
    $scope.indicatorSetting = {
        scrollableHeight: '250px',
        scrollable: true,
        enableSearch: true,
        buttonClasses: 'btn btn-default multi-select-width',
        idProperty: 'id',
        displayProp: 'name',
        alignRight: true,
        groupBy: 'parentId',
        groupByTextProvider: indicatorGroupId => indicatorGroupMap.get(indicatorGroupId),
    };
    $scope.indicatorIsWarning = {
        isSearched: false,
        isWarned: false,
    };
    const getIndicatorList = () => {
        HttpRequestService.get(APIS.indicator.indicators, {
            module: 'KeyIndicator',
            isTree: true,
        }, response => {
            let indicators = [];
            response.map(indicator => {
                if (indicator.branches) {
                    indicatorGroupMap.set(indicator.id + '', indicator.name);
                    indicator.branches.map(subIndicator => {
                        indicators.push(subIndicator);
                    });
                }
            });
            $scope.indicatorOptions = indicators;
        });
    };

    /** click the search button to do searching */
    $scope.doSearch = () => {
        getParamForSearch().then(() => {
            loadUserKeyIndicatorStatistic.getStatistics(1, 10);
            loadStandardXdrRetrieval.getStatistics(1, 10);
            loadHttpXdrRetrieval.getStatistics(1, 10);
            loadDnsXdrRetrieval.getStatistics(1, 10);
            loadRadiusXdrRetrieval.getStatistics(1, 10);
            /**结束请求后收起查询栏*/
            $scope.togglePanel();
        });
    };

    /** define a parameter object for searching */
    const paramForSearch = {
        userType: null,
        account: null,
        applicationGroups: null,
        indicatorIds: null,
        interval: null,
        timeSlot: null,
        isSelectApplicationType: false,
        isSelectApplication: false,
    };
    /** get parameters for searching */
    const getParamForSearch = () => {
        let isSelectedUserType = false;
        let isLegalAccount = false;
        let isSelectedInterval = false;
        let isSelectedDate = false;
        let isSelectedIndicator = false;
        return new Promise((resolve, reject) => {
            // account
            if (!isCheckedAccount) {
                if ($scope.account == null || $scope.account.length == 0) {
                    swal({
                        text: '账号不能为空',
                        type: 'warning',
                        allowOutsideClick: false,
                    });
                    ShakeWarning.isWarning('#account');
                    reject();
                } else if ($filter('inputIsIllegal')($scope.account, 'chinese') || $filter('inputIsIllegal')($scope.account, 'account')) {
                    swal({
                        text: '请正确填写帐号！',
                        type: 'warning',
                        allowOutsideClick: false,
                    });
                    ShakeWarning.isWarning('#account');
                    reject();
                } else {
                    let url = APIS.user.accountNumberInfo + '/' + $scope.account;
                    HttpRequestService.get(url, null, accountConfig => {
                        if (accountConfig == null || accountConfig == '') {
                            swal({
                                text: '此账户未在配置中！',
                                type: 'warning',
                                allowOutsideClick: false,
                            });
                            ShakeWarning.isWarning('#account');
                            reject();
                        } else if (accountConfig.userType != $scope.userType[0].value) {
                            swal({
                                text: '此账户与用户类型不匹配！',
                                type: 'warning',
                                allowOutsideClick: false,
                            });
                            ShakeWarning.isWarning('#account');
                            reject();
                        } else {
                            ShakeWarning.hideWarning('#account');
                            isCheckedAccount = true;
                            isLegalAccount = true;
                            resolve();
                        }
                    }, () => {
                        swal({
                            text: '请求失败,请检查网络',
                            type: 'warning',
                            allowOutsideClick: false,
                        });
                        reject();
                    });
                }
            } else {
                isLegalAccount = true;
                resolve();
            }
        }).then(() => {
            // userType
            if (!Array.isArray($scope.userType) || $scope.userType.length === 0) {
                swal({
                    text: '请选择业务！',
                    type: 'warning',
                    allowOutsideClick: false,
                });
            } else {
                isSelectedUserType = true;
            }

            // interval
            if (!Array.isArray($scope.interval) || $scope.interval.length === 0) {
                swal({
                    text: '请选择时间粒度！',
                    type: 'warning',
                    allowOutsideClick: false,
                });
            } else {
                isSelectedInterval = true;
            }

            // check time
            if ($scope.isWarning === 'long') {
                swal({
                    type: 'warning',
                    text: '你选择的时间区间过长！请重新选择时间',
                    allowOutsideClick: false,
                });
                $scope.isWarning = 'yes';
            } else if ($scope.isWarning === 'empty') {
                $scope.isWarning = 'yes';
            } else {
                $scope.isWarning = 'no';
                isSelectedDate = true;
            }

            // indicator
            if (!Array.isArray($scope.indicator) || $scope.indicator.length === 0) {
                $scope.indicatorIsWarning.isWarned = true;
                $scope.indicatorIsWarning.isSearched = true;
            } else {
                $scope.indicatorIsWarning.isWarned = false;
                $scope.indicatorIsWarning.isSearched = false;
                isSelectedIndicator = true;
            }

            // set parameters
            if (isSelectedUserType && isLegalAccount && isSelectedInterval && isSelectedDate && isSelectedIndicator) {
                // userType
                paramForSearch.userType = $scope.userType[0].value;
                // account
                paramForSearch.account = $scope.account;
                // interval
                paramForSearch.interval = $scope.interval[0].value;
                // timeSlot
                paramForSearch.timeSlot = $scope.timeSlots.startDate + ',' + $scope.timeSlots.endDate;

                // indicator
                let indicatorIds = [];
                $scope.indicator.map(thisIndicator => {
                    indicatorIds.push(thisIndicator.id);
                });
                paramForSearch.indicatorIds = indicatorIds.join(',');

                // applicationType/application
                if (isSelectAllApplications) {
                    if (isSelectAllApplicationTypes) {
                        paramForSearch.applicationGroups = '-1,-1';
                        paramForSearch.isSelectApplicationType = true;
                        paramForSearch.isSelectApplication = true;
                    } else if (!Array.isArray($scope.applicationType) || $scope.applicationType.length === 0) {
                        paramForSearch.applicationGroups = '';
                        paramForSearch.isSelectApplicationType = false;
                        paramForSearch.isSelectApplication = false;
                    } else {
                        let applicationGroupString = [];
                        $scope.applicationType.map(thisApplicationType => {
                            applicationGroupString.push(thisApplicationType.applicationType + ',-1');
                        });
                        paramForSearch.applicationGroups = applicationGroupString.join(';');
                        paramForSearch.isSelectApplicationType = true;
                        paramForSearch.isSelectApplication = true;
                    }
                } else if (!Array.isArray($scope.application) || $scope.application.length === 0) {
                    if (isSelectAllApplicationTypes) {
                        paramForSearch.applicationGroups = '-1,';
                        paramForSearch.isSelectApplicationType = true;
                        paramForSearch.isSelectApplication = false;
                    } else if (!Array.isArray($scope.applicationType) || $scope.applicationType.length === 0) {
                        paramForSearch.applicationGroups = '';
                        paramForSearch.isSelectApplicationType = false;
                        paramForSearch.isSelectApplication = false;
                    } else {
                        let applicationGroupString = [];
                        $scope.applicationType.map(thisApplicationType => {
                            applicationGroupString.push(thisApplicationType.applicationType + ',');
                        });
                        paramForSearch.applicationGroups = applicationGroupString.join(';');
                        paramForSearch.isSelectApplicationType = true;
                        paramForSearch.isSelectApplication = false;
                    }
                } else {
                    let applicationGroupString = [];
                    $scope.application.map(thisApplication => {
                        applicationGroupString.push(thisApplication.applicationType + ',' + thisApplication.application);
                    });
                    paramForSearch.applicationGroups = applicationGroupString.join(';');
                    paramForSearch.isSelectApplicationType = true;
                    paramForSearch.isSelectApplication = true;
                }
                return new Promise(resolve => {
                    resolve();
                });
            }
            return new Promise((resolve, reject) => {
                reject();
            });
        });
    };

    const loadUserKeyIndicatorStatistic = {
        initGrid: () => {
            $scope.userKeyIndicatorStatisticGrid = {
                enableGridMenu: true,
                columnDefs: [],
                useExternalPagination: true,
                paginationPageSizes: [10, 30, 50],
                paginationPageSize: 10,
                paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
                exporterCsvFilename: '用户关键指标数据表.csv',
                exporterOlderExcelCompatibility: true,
                exporterAllDataFn() {
                    return loadUserKeyIndicatorStatistic.getStatistics(1, -1).then(() => {
                        $scope.userKeyIndicatorStatisticGrid.useExternalPagination = false;
                        loadUserKeyIndicatorStatistic.getStatistics = null;
                    });
                },
            };
            $scope.userKeyIndicatorStatisticGrid.onRegisterApi = function (gridApi) {
                $scope.userKeyIndicatorStatisticGridApi = gridApi;
                gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
                    if (loadRadiusXdrRetrieval.getStatistics) {
                        loadUserKeyIndicatorStatistic.getStatistics(newPage, pageSize).then(() => null);
                    }
                })
            };
            loadUserKeyIndicatorStatistic.setColumnNames();
        },
        setColumnNames: () => {
            let columns = [
                {
                    displayName: '时间',
                    name: 'statisticalTime',
                    width: 150,
                }, {
                    displayName: '用户类型',
                    name: 'userType',
                    width: 100,
                }, {
                    displayName: '用户帐号',
                    name: 'account',
                    width: 170,
                },
            ];
            if (paramForSearch.isSelectApplicationType) {
                columns.push({
                    displayName: '业务大类',
                    name: 'appTypeName',
                    width: 120,
                });
            }
            if (paramForSearch.isSelectApplication) {
                columns.push({
                    displayName: '业务小类',
                    name: 'appSubTypeName',
                    width: 120,
                });
            }
            if ($scope.indicator.length > 0) {
                $scope.indicator.map(thisIndicator => {
                    columns.push({
                        displayName: thisIndicator.name,
                        name: thisIndicator.parameter,
                        width: 200,
                    });
                });
            }
            $scope.userKeyIndicatorStatisticGrid.columnDefs = columns;
        },
        getStatistics: (newPage, pageSize) => {
            let url = APIS.userKeyIndicatorAnalysis.statistic;
            let param = {
                userType: paramForSearch.userType,
                account: paramForSearch.account,
                indicatorIds: paramForSearch.indicatorIds,
                applicationGroups: paramForSearch.applicationGroups,
                interval: paramForSearch.interval,
                timeSlots: paramForSearch.timeSlot,
                orderBys: 'statisticalTime desc',
                pageIndex: newPage,
                pageSize,
                isCountTotal: true,
            };

            return new Promise((resolve, reject) => {
                Loading.isLoading('#userKeyIndicatorStatisticDiv');
                HttpRequestService.get(url, param, response => {
                    loadUserKeyIndicatorStatistic.setColumnNames();
                    $scope.userKeyIndicatorStatisticGrid.data = [];
                    response.statistic.map(rowData => {
                        rowData.statisticalTime = $filter('date')(rowData.statisticalTime, 'yyyy/MM/dd hh:mm');
                        $scope.userKeyIndicatorStatisticGrid.columnDefs.map(columnTitle => {
                            if (rowData[columnTitle.name] == null || rowData[columnTitle.name] == '') {
                                rowData[columnTitle.name] = '-';
                            }
                        });
                        $scope.userKeyIndicatorStatisticGrid.data.push(rowData);
                    });
                    $scope.userKeyIndicatorStatisticGrid.totalItems = response.totalCount;
                    Loading.hideLoading('#userKeyIndicatorStatisticDiv');
                    resolve();
                }, () => {
                    Loading.hideLoading('#userKeyIndicatorStatisticDiv');
                });
            });
        },
    };

    const loadStandardXdrRetrieval = {
        initGrid: () => {
            $scope.standardXdrRetrievalGrid = {
                enableGridMenu: true,
                columnDefs: [],
                paginationPageSizes: [10, 30, 50],
                paginationPageSize: 10,
                paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
                exporterCsvFilename: '通用话单数据表.csv',
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                exporterAllDataFn() {
                    return loadStandardXdrRetrieval.getStatistics(1, -1).then(() => {
                        $scope.standardXdrRetrievalGrid.useExternalPagination = false;
                        loadStandardXdrRetrieval.getStatistics = null;
                    });
                },
            };
            $scope.standardXdrRetrievalGrid.onRegisterApi = function (gridApi) {
                $scope.standardXdrRetrievalGridApi = gridApi;
                gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
                    if (loadStandardXdrRetrieval.getStatistics) {
                        loadStandardXdrRetrieval.getStatistics(newPage, pageSize).then(() => null);
                    }
                })
            };
            loadStandardXdrRetrieval.setColumnNames();
        },
        setColumnNames: () => {
            $scope.standardXdrRetrievalGrid.columnDefs = DefaultData.standardXdrRetrievalGridColumnNames;
        },
        getStatistics: (newPage, pageSize) => {
            let url = APIS.xdrRetrieval.getXdr;
            let param = {
                userType: paramForSearch.userType,
                xdrType: 'wb_standard',
                timeSlots: paramForSearch.timeSlot,
                account: paramForSearch.account,
                pageIndex: newPage,
                pageSize,
            };
            return new Promise((resolve, reject) => {
                Loading.isLoading('#standardXdrRetrievalDiv');
                HttpRequestService.get(url, param, response => {
                    loadStandardXdrRetrieval.setColumnNames();
                    $scope.standardXdrRetrievalGrid.data = [];
                    response.map(rowData => {
                        rowData.user_type = rowData.user_type == 3 ? '家宽' : rowData.user_type == 5 ? '专线' : rowData.user_type;
                        rowData.procedure_start_time = (rowData.procedure_start_time == null || rowData.procedure_start_time == '') ? rowData.procedure_start_time : $filter('date')((rowData.procedure_start_time / 1000), 'yyyy/MM/dd hh:mm');
                        rowData.procedure_end_time = (rowData.procedure_end_time == null || rowData.procedure_end_time == '') ? rowData.procedure_end_time : $filter('date')((rowData.procedure_end_time / 1000), 'yyyy/MM/dd hh:mm');
                        DefaultData.standardXdrRetrievalGridColumnNames.map(columnTitle => {
                            if (rowData[columnTitle.name] == null || rowData[columnTitle.name] == '') {
                                rowData[columnTitle.name] = '-';
                            }
                        });
                        $scope.standardXdrRetrievalGrid.data.push(rowData);
                    });
                    if (pageSize != -1) {
                        if (Array.isArray(response) && response.length != 0) {
                            $scope.standardXdrRetrievalGrid.totalItems = (newPage + 1) * pageSize;
                        } else if (newPage != 1) {
                            $scope.standardXdrRetrievalGrid.totalItems = newPage * pageSize;
                            swal({
                                text: '通用话单已无更多数据！',
                                type: 'warning',
                                allowOutsideClick: false,
                            });
                        }
                    }
                    Loading.hideLoading('#standardXdrRetrievalDiv');
                    resolve();
                }, () => {
                    Loading.hideLoading('#standardXdrRetrievalDiv');
                });
            });
        },
    };

    const loadHttpXdrRetrieval = {
        initGrid: () => {
            $scope.httpXdrRetrievalGrid = {
                enableGridMenu: true,
                columnDefs: [],
                paginationPageSizes: [10, 30, 50],
                paginationPageSize: 10,
                paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
                exporterCsvFilename: 'HTTP话单数据表.csv',
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                exporterAllDataFn() {
                    return loadHttpXdrRetrieval.getStatistics(1, -1).then(() => {
                        $scope.httpXdrRetrievalGrid.useExternalPagination = false;
                        loadHttpXdrRetrieval.getStatistics = null;
                    });
                },
            };
            $scope.httpXdrRetrievalGrid.onRegisterApi = function (gridApi) {
                $scope.httpXdrRetrievalGridApi = gridApi;
                gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
                    if (loadHttpXdrRetrieval.getStatistics) {
                        loadHttpXdrRetrieval.getStatistics(newPage, pageSize).then(() => null);
                    }
                })
            };
            loadHttpXdrRetrieval.setColumnNames();
        },
        setColumnNames: () => {
            $scope.httpXdrRetrievalGrid.columnDefs = DefaultData.httpXdrRetrievalGridColumnNames;
        },
        getStatistics: (newPage, pageSize) => {
            let url = APIS.xdrRetrieval.getXdr;
            let param = {
                userType: paramForSearch.userType,
                xdrType: 'wb_http',
                timeSlots: paramForSearch.timeSlot,
                account: paramForSearch.account,
                pageIndex: newPage,
                pageSize,
            };

            return new Promise((resolve, reject) => {
                Loading.isLoading('#httpXdrRetrievalDiv');
                HttpRequestService.get(url, param, response => {
                    loadHttpXdrRetrieval.setColumnNames();
                    $scope.httpXdrRetrievalGrid.data = [];
                    response.map(rowData => {
                        rowData.user_type = rowData.user_type == 3 ? '家宽' : rowData.user_type == 5 ? '专线' : rowData.user_type;
                        rowData.procedure_start_time = (rowData.procedure_start_time == null || rowData.procedure_start_time == '') ? rowData.procedure_start_time : $filter('date')((rowData.procedure_start_time / 1000), 'yyyy/MM/dd hh:mm');
                        rowData.procedure_end_time = (rowData.procedure_end_time == null || rowData.procedure_end_time == '') ? rowData.procedure_end_time : $filter('date')((rowData.procedure_end_time / 1000), 'yyyy/MM/dd hh:mm');
                        DefaultData.httpXdrRetrievalGridColumnNames.map(columnTitle => {
                            if (rowData[columnTitle.name] == null || rowData[columnTitle.name] == '') {
                                rowData[columnTitle.name] = '-';
                            }
                        });
                        $scope.httpXdrRetrievalGrid.data.push(rowData);
                    });
                    if (pageSize != -1) {
                        if (Array.isArray(response) && response.length != 0) {
                            $scope.httpXdrRetrievalGrid.totalItems = (newPage + 1) * pageSize;
                        } else if (newPage != 1) {
                            $scope.httpXdrRetrievalGrid.totalItems = newPage * pageSize;
                            swal({
                                text: 'HTTP话单已无更多数据！',
                                type: 'warning',
                                allowOutsideClick: false,
                            });
                        }
                    }
                    Loading.hideLoading('#httpXdrRetrievalDiv');
                    resolve();
                }, () => {
                    Loading.hideLoading('#httpXdrRetrievalDiv');
                });
            });
        },
    };

    const loadDnsXdrRetrieval = {
        initGrid: () => {
            $scope.dnsXdrRetrievalGrid = {
                enableGridMenu: true,
                columnDefs: [],
                paginationPageSizes: [10, 30, 50],
                paginationPageSize: 10,
                paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
                exporterCsvFilename: 'DNS话单数据表.csv',
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                exporterAllDataFn() {
                    return loadDnsXdrRetrieval.getStatistics(1, -1).then(() => {
                        $scope.dnsXdrRetrievalGrid.useExternalPagination = false;
                        loadDnsXdrRetrieval.getStatistics = null;
                    });
                },
            };
            $scope.dnsXdrRetrievalGrid.onRegisterApi = function (gridApi) {
                $scope.dnsXdrRetrievalGridApi = gridApi;
                gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
                    if (loadDnsXdrRetrieval.getStatistics) {
                        loadDnsXdrRetrieval.getStatistics(newPage, pageSize).then(() => null);
                    }
                })
            };
            loadDnsXdrRetrieval.setColumnNames();
        },
        setColumnNames: () => {
            $scope.dnsXdrRetrievalGrid.columnDefs = DefaultData.dnsXdrRetrievalGridColumnNames;
        },
        getStatistics: (newPage, pageSize) => {
            let url = APIS.xdrRetrieval.getXdr;
            let param = {
                userType: paramForSearch.userType,
                xdrType: 'wb_dns',
                timeSlots: paramForSearch.timeSlot,
                account: paramForSearch.account,
                pageIndex: newPage,
                pageSize,
            };
            return new Promise((resolve, reject) => {
                Loading.isLoading('#dnsXdrRetrievalDiv');
                HttpRequestService.get(url, param, response => {
                    loadDnsXdrRetrieval.setColumnNames();
                    $scope.dnsXdrRetrievalGrid.data = [];
                    response.map(rowData => {
                        rowData.user_type = rowData.user_type == 3 ? '家宽' : rowData.user_type == 5 ? '专线' : rowData.user_type;
                        rowData.procedure_start_time = (rowData.procedure_start_time == null || rowData.procedure_start_time == '') ? rowData.procedure_start_time : $filter('date')((rowData.procedure_start_time / 1000), 'yyyy/MM/dd hh:mm');
                        rowData.procedure_end_time = (rowData.procedure_end_time == null || rowData.procedure_end_time == '') ? rowData.procedure_end_time : $filter('date')((rowData.procedure_end_time / 1000), 'yyyy/MM/dd hh:mm');
                        DefaultData.dnsXdrRetrievalGridColumnNames.map(columnTitle => {
                            if (rowData[columnTitle.name] == null || rowData[columnTitle.name] == '') {
                                rowData[columnTitle.name] = '-';
                            }
                        });
                        $scope.dnsXdrRetrievalGrid.data.push(rowData);
                    });
                    if (pageSize != -1) {
                        if (Array.isArray(response) && response.length != 0) {
                            $scope.dnsXdrRetrievalGrid.totalItems = (newPage + 1) * pageSize;
                        } else if (newPage != 1) {
                            $scope.dnsXdrRetrievalGrid.totalItems = newPage * pageSize;
                            swal({
                                text: 'DNS话单已无更多数据！',
                                type: 'warning',
                                allowOutsideClick: false,
                            });
                        }
                    }
                    Loading.hideLoading('#dnsXdrRetrievalDiv');
                    resolve();
                }, () => {
                    Loading.hideLoading('#dnsXdrRetrievalDiv');
                });
            });
        },
    };

    const loadRadiusXdrRetrieval = {
        initGrid: () => {
            $scope.radiusXdrRetrievalGrid = {
                enableGridMenu: true,
                columnDefs: [],
                paginationPageSizes: [10, 30, 50],
                paginationPageSize: 10,
                paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
                exporterCsvFilename: 'Radius话单数据表.csv',
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                exporterAllDataFn() {
                    return loadRadiusXdrRetrieval.getStatistics(1, -1).then(() => {
                        $scope.radiusXdrRetrievalGrid.useExternalPagination = false;
                        loadRadiusXdrRetrieval.getStatistics = null;
                    }, () => null);
                },
            };
            $scope.radiusXdrRetrievalGrid.onRegisterApi = function (gridApi) {
                $scope.radiusXdrRetrievalGridApi = gridApi;
                gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
                    if (loadRadiusXdrRetrieval.getStatistics) {
                        loadRadiusXdrRetrieval.getStatistics(newPage, pageSize).then(() => null);
                    }
                })
            };
            loadRadiusXdrRetrieval.setColumnNames();
        },
        setColumnNames: () => {
            $scope.radiusXdrRetrievalGrid.columnDefs = DefaultData.radiusXdrRetrievalGridColumnNames;
        },
        getStatistics: (newPage, pageSize) => {
            let url = APIS.xdrRetrieval.getXdr;
            let param = {
                userType: paramForSearch.userType,
                xdrType: 'wb_radius',
                timeSlots: paramForSearch.timeSlot,
                account: paramForSearch.account,
                pageIndex: newPage,
                pageSize,
            };
            return new Promise((resolve, reject) => {
                if (paramForSearch.userType == 2) {
                    resolve();
                } else {
                    Loading.isLoading('#radiusXdrRetrievalDiv');
                    HttpRequestService.get(url, param, response => {
                        loadRadiusXdrRetrieval.setColumnNames();
                        $scope.radiusXdrRetrievalGrid.data = [];
                        response.map(rowData => {
                            // TODO format
                            rowData.user_type = rowData.user_type == 3 ? '家宽' : rowData.user_type == 5 ? '专线' : rowData.user_type;
                            rowData.start_date_time = (rowData.start_date_time == null || rowData.start_date_time == '') ? rowData.start_date_time : $filter('date')((rowData.start_date_time), 'yyyy/MM/dd hh:mm');
                            rowData.end_date_time = (rowData.end_date_time == null || rowData.end_date_time == '') ? rowData.end_date_time : $filter('date')((rowData.end_date_time), 'yyyy/MM/dd hh:mm');
                            DefaultData.radiusXdrRetrievalGridColumnNames.map(columnTitle => {
                                if (rowData[columnTitle.name] == null || rowData[columnTitle.name] == '') {
                                    rowData[columnTitle.name] = '-';
                                }
                            });
                            $scope.radiusXdrRetrievalGrid.data.push(rowData);
                        });
                        if (pageSize != -1) {
                            if (Array.isArray(response) && response.length != 0) {
                                $scope.radiusXdrRetrievalGrid.totalItems = (newPage + 1) * pageSize;
                            } else if (newPage != 1) {
                                $scope.radiusXdrRetrievalGrid.totalItems = newPage * pageSize;
                                swal({
                                    text: 'Radius话单已无更多数据！',
                                    type: 'warning',
                                    allowOutsideClick: false,
                                });
                            }
                        }
                        Loading.hideLoading('#radiusXdrRetrievalDiv');
                        resolve();
                    }, () => {
                        Loading.hideLoading('#radiusXdrRetrievalDiv');
                    });
                }
            });
        },
    };

    /** 初始化加载Controller */
    const initController = () => {
        /** 加载业务大类 */
        getApplicationTypeList();
        /** 加载全部业务小类 */
        getApplicationTree();
        /** 加载指标列表 */
        getIndicatorList();

        /** 初始化表格 */
        loadUserKeyIndicatorStatistic.initGrid();
        loadStandardXdrRetrieval.initGrid();
        loadHttpXdrRetrieval.initGrid();
        loadDnsXdrRetrieval.initGrid();
        loadRadiusXdrRetrieval.initGrid();
    };
    initController();
}
UserKeyIndicatorAnalysisController.$inject = ['$scope', '$filter', 'HttpRequestService'];