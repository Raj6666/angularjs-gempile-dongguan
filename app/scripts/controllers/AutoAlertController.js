'use strict';

import angular from 'angular';
import echarts from 'echarts';
import swal from 'sweetalert2';
import APIS from '../configs/ApisConfig';
import Loading from '../custom-pulgin/Loading';
import {autoAlertDataConfig} from '../data/AutoAlertDataConfig';
import {NOW, ONE_DAY_MS} from '../constants/CommonConst';

/**
 * @ngdoc Auto Alert Controller
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 * @export
 */
export default function AutoAlertController($scope, $filter, HttpRequestService) {
    /** 规则列表 */
    $scope.autoAlertRuleList = [];
    /** 规则数是否达到上限*/
    $scope.isRulesCountOverMaxLimit = false;
    /** 选中的规则 */
    let selectedRule = null;
    /** 活动告警数据列表 */
    $scope.activeAutoAlertStatisticList = [];
    /** 已清除告警数据列表 */
    $scope.clearAutoAlertStatisticList = [];
    /** 接口列表 */
    $scope.interfaceList = autoAlertDataConfig.interface;
    /** 选中的接口 */
    $scope.selectedInterface = $scope.interfaceList[0] ? $scope.interfaceList[0].value : '';
    /** 维度列表 */
    $scope.dimensionList = autoAlertDataConfig.dimension[$scope.selectedInterface];
    /** 选中的维度 */
    $scope.selectedDimension = $scope.dimensionList[0] ? $scope.dimensionList[0].value : '';
    /** 当前的指标列表 */
    $scope.indicatorTree = [];
    /** 当前选中的指标 */
    $scope.selectedIndicator = null;
    /** 选择指标输入框搜索关键字*/
    $scope.indicatorSearching = [];
    /** 告警数据数量统计 */
    $scope.activeHighLevelCount = 0;
    $scope.activeMiddleLevelCount = 0;
    $scope.activeLowLevelCount = 0;
    $scope.clearHighLevelCount = 0;
    $scope.clearMiddleLevelCount = 0;
    $scope.clearLowLevelCount = 0;
    /** 告警类型选中颜色 */
    $scope.allColor = true; // 默认选中全网告警
    $scope.elementsColor = false;
    $scope.areaColor = false;
    $scope.appColor = false;
    $scope.edit_type = 0;
    /**是否可选五分钟粒度*/
    $scope.isSelectInverve = false;
    /** 告警规则数据列表 */
    $scope.alertingRulesStatisticList = [];
    /** 告警记录数据列表 */
    $scope.alertingRecordsStatisticList = [];
    /** 校验告警级别数值的结果 */
    let checkThresholdResult = '';
    /**当前选择的告警记录维度*/
    let selectedDimensionGroup = 'whole_network';
    /***记录当前规则表的页面*/
    let curPageIndex = 1;
    let curPageSize = 10;
    /**当前规则表填充数据*/
    let curAutoAlertRules = [];
    /**当前显示的告警值*/
    let curAlertData = [];
    /** 时间控件是否初始化 */
    let datePickerInited = false;
    /**新增/编辑告警规则——指标选择设置*/
    let groupIndicators = [];
    let indicators = [];
    /**新增/编辑告警规则——所有具体对象选择设置*/
    let allObjectsForSearch = [];
    /**新增/编辑告警规则条件栏设置*/
    $scope.queryTool = {
        /**select插件内容翻译*/
        selectorText: {
            checkAll: '选择全部',
            uncheckAll: '取消全部',
            buttonDefaultText: '请选择',
            dynamicButtonTextSuffix: '个选择',
            searchPlaceholder: '搜索',
        },
        //维度
        dimensions: {
            options: autoAlertDataConfig.interface,
            model: [],
            setting: {
                scrollableHeight: '180px',
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
                    //$scope.queryTool.city.model = [StaticData.queryToolData.city.options[0]];
                    $scope.selectInterface(item.value);
                },
                onItemDeselect: () => {
                    $scope.queryTool.dimensions.model = [];
                    $scope.queryTool.dimensions.model.push($scope.queryTool.dimensions.options[0]);
                    $scope.selectInterface('whole_network');
                },
            },
        },
        //对象
        objectTypes: {
            options: autoAlertDataConfig.dimension.whole_network,
            model: [],
            setting: {
                scrollableHeight: '160px',
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
                onItemDeselect: () => {
                    // $scope.queryTool.interval.model = [StaticData.queryToolData.interval.options[1]];
                    // $scope.interval = '60';
                    $scope.queryTool.objectTypes.model = [];
                    $scope.queryTool.objectTypes.model.push($scope.queryTool.objectTypes.options[0]);
                    $scope.selectDimension($scope.queryTool.objectTypes.options[0].value);
                },
                onItemSelect: item => {
                    $scope.selectDimension(item.value);
                },
            },
        },
        //具体对象
        objects: {
            searchOptions : [],
            options: autoAlertDataConfig.dimension.whole_network,
            model: [],
            setting: {
                scrollableHeight: '240px',
                showCheckAll: true,
                showUncheckAll: true,
                scrollable: true,
                enableSearch: true,
                enableAsyncSearch: true,
                // selectedToTop: true,
                idProperty: 'name',
                displayProp: 'name',
                searchField: 'name',
                buttonClasses: 'btn btn-default select-width-140',
                // smartButtonTextProvider(selectionArray) {
                //     return selectionArray[0].name;
                // },
            },
            events: {
                asyncSearchOptions: searchFilter => {
                    let searchOption = [];
                    let counter = 0;
                    for (let i = 0; i < allObjectsForSearch.length; i++) {
                        if (allObjectsForSearch[i].name.indexOf(searchFilter) >= 0) {
                            searchOption.push(allObjectsForSearch[i]);
                            counter++;
                        }
                        if (counter > 20) {
                            break;
                        }
                    }
                    $scope.queryTool.objects.searchOptions = searchOption;
                },
                onSelectAll: () => {
                    if(allObjectsForSearch.length == 0){
                        HttpRequestService.get(APIS.autoAlert.dimension.dimensionTypeValues, {
                            dimensionType: $scope.selectedDimension,
                            searchName: $scope.networkElementSearching.keyword,
                            pageIndex: 1,
                            pageSize: -1,
                        }, response => {
                            allObjectsForSearch = [];
                            if (response && response.length !== 0) {
                                response.map(networkElement => {
                                    allObjectsForSearch.push(networkElement);
                                });
                            }
                            $scope.queryTool.objects.model = allObjectsForSearch;
                        });
                    }else{
                        $scope.queryTool.objects.model = allObjectsForSearch;
                    }
                },
            },
            IsWarning : {
                isSearched : false,
                isWarned : false,
            },
        },
        //指标
        indicators: {
            options: [],
            model: [],
            setting: {
                scrollableHeight: '320px',
                showCheckAll: false,
                showUncheckAll: false,
                scrollable: true,
                enableSearch: true,
                idProperty: 'id',
                displayProp: 'name',
                searchField: 'name',
                selectionLimit: 1,
                closeOnSelect: true,
                buttonClasses: 'btn btn-default select-width-140',
                groupByTextProvider: groupValue => groupIndicators[groupValue],
                groupBy: 'parentId',
                smartButtonTextProvider(selectionArray) {
                    return selectionArray[0].name;
                },
            },
            events: {
                onItemSelect: item => {
                    $scope.selectedIndicator = item;
                },
                onItemDeselect: () => {
                    $scope.selectedIndicator = null;
                },
            },
            IsWarning : {
                isSearched : false,
                isWarned : false,
            },
        },
    };

    /**新增/编辑告警规则界面 初始化**/
    const initRuleInterface = () => {
        $scope.queryTool.dimensions.model = [];
        $scope.queryTool.dimensions.model.push($scope.queryTool.dimensions.options[0]);
        $scope.queryTool.objectTypes.model.push($scope.queryTool.objectTypes.options[0]);
        //$scope.getIndicatorList();
    }

    /** 加载所有网元方法 */
    $scope.getTopNetworkElementList = selectedObject => {
        HttpRequestService.get(APIS.autoAlert.dimension.dimensionTypeValues, {
            dimensionType: $scope.selectedDimension,
            searchName: $scope.networkElementSearching.keyword,
            pageIndex: 1,
            pageSize: -1,
        }, response => {
            $scope.queryTool.objects.options = [];
            $scope.queryTool.objects.model = [];
            allObjectsForSearch = [];
            if (response && response.length !== 0) {
                // $scope.networkElementSearching.page++;
                // response.map(networkElement => {
                //     $scope.queryTool.objects.options.push(networkElement);
                // });
                for (let i = 0; i < response.length; i++) {
                    $scope.queryTool.objects.options.push(response[i]);
                    if (i > 100) {
                        break;
                    }
                }
                response.map(networkElement => {
                    allObjectsForSearch.push(networkElement);
                });
                if(selectedObject){
                    $scope.queryTool.objects.model = selectedObject;
                }
            }
        });
    };

    /**转化数据到grid数据格式*/
    const convertToGridData = (data, type) => {
        if (type === 'rules') {
            data.map(rule => {
                let tmpRule = rule;
                if (rule.dimensionType === 'app_sub_type') {
                    let tmpDimensionValues = [];
                    rule.applicationDimensions.map(dimension => {
                        let tmpDimension = {};
                        tmpDimension.id = '';
                        tmpDimension.name = dimension.appType;
                        tmpDimension.value = dimension.appSubType;
                        tmpDimensionValues.push(tmpDimension);
                    });
                    tmpRule.dimensionValues = tmpDimensionValues;
                }
                switch (rule.interval) {
                    case 5:
                        tmpRule.interval = '5分钟';
                        break;
                    case 60:
                        tmpRule.interval = '小时';
                        break;
                    case 1440:
                        tmpRule.interval = '天';
                        break;
                    default:
                        break;
                }
                tmpRule.alertRules = rule.emergentAlertRelationalOperator + rule.emergentAlertThreshold + ';' + rule.majorAlertRelationalOperator + rule.majorAlertThreshold + ';' + rule.commonlyAlertRelationalOperator + rule.commonlyAlertThreshold;
                tmpRule.modifiedTime = $scope.unixChangeCommonTime(rule.modifiedTime);
                tmpRule.dimensionName = autoAlertDataConfig.dimensionNameByValue[rule.dimensionType];
                tmpRule.indicatorName = rule.indicator.name;
                curAutoAlertRules.push(tmpRule);
            });
        } else if (type === 'records') {
            curAlertData.length = 0;
            data.map(record => {
                let tmpRecord = record;
                switch (record.alertLevel) {
                    case 1: {
                        tmpRecord.alertLevel = '紧急告警';
                        break;
                    }
                    case 2: {
                        tmpRecord.alertLevel = '重要告警';
                        break;
                    }
                    case 3: {
                        tmpRecord.alertLevel = '一般告警';
                        break;
                    }
                    default:
                        break;
                }
                switch (record.interval) {
                    case 5:
                        tmpRecord.interval = '5分钟';
                        break;
                    case 60:
                        tmpRecord.interval = '小时';
                        break;
                    case 1440:
                        tmpRecord.interval = '天';
                        break;
                    default:
                        break;
                }
                if (record.rule) {
                    tmpRecord.ruleName = record.rule.ruleName;
                    tmpRecord.indicatorName = record.rule.indicator.name;
                } else {
                    tmpRecord.ruleName = '规则已删除';
                }
                tmpRecord.operator = '恢复或清除操作';
                if (record.unit === '%') {
                    // tmpRecord.latestAutoAlertValue = Math.floor(record.latestAutoAlertValue * 10000) / 100 + '%';
                    tmpRecord.latestAutoAlertValue = Math.floor(record.latestAutoAlertValue) + '%';
                }
                curAlertData.push(tmpRecord);
            });
        }
    };

    /** 获取告警规则列表 */
    const getAutoAlertRuleList = (pageIndex, pageSize) => {
        let param = {
            'filter': 2,
            'pageIndex': pageIndex,
            'pageSize': pageSize,
        };
        Loading.isLoading('#auto_alert_rules');
        HttpRequestService.get(APIS.autoAlert.rule.searchRuleList, param, data => {
            $scope.ruleGridOptions.data.length = 0;
            curAutoAlertRules.length = 0;
            $scope.ruleGridOptions.totalItems = data.totalCount;
            convertToGridData(data.autoAlertRuleList, 'rules');
            angular.forEach(curAutoAlertRules, row => {
                $scope.ruleGridOptions.data.push(row);
            });
            Loading.hideLoading('#auto_alert_rules');
            $scope.pageConfig.rules.pageCount = $scope.rulesGridApi.pagination.getTotalPages();
            let displayPage = [];
            if ($scope.rulesGridApi.pagination.getTotalPages() <= 5) {
                $scope.pageConfig.rules.initDisplayPage = $scope.rulesGridApi.pagination.getTotalPages();
                for (let i = 1; i <= $scope.rulesGridApi.pagination.getTotalPages(); i++) {
                    displayPage.push(i)
                }
                $scope.pageConfig.rules.displayPage = displayPage;
            } else if ($scope.pageConfig.rules.selectPage <= 5) {
                for (let i = 1; i <= 5; i++) {
                    displayPage.push(i)
                }
                $scope.pageConfig.rules.displayPage = displayPage;
                $scope.pageConfig.rules.initDisplayPage = 5;
            }
        }, () => {
            Loading.hideLoading('#auto_alert_rules');
        });
    };

    /*** 获取请求告警记录的的参数param */
    const getParamForStatistics = (pageIndex, pageSize) => {
        let params = {
            'timeSlots': '',
            'dimension': selectedDimensionGroup,
            'active': '',
            'pageIndex': pageIndex,
            'pageSize': pageSize,
        };
        //todo  第一次点击历史告警，默认时间应为: 当前时间到前一天时间；其他情况，时间应为时间控件选择的时间。
        if (datePickerInited) {
            params.timeSlots = $scope.timeSlots.str;
        } else {
            params.timeSlots = (NOW - ONE_DAY_MS) + ',' + NOW;
        }
        if ($scope.selectAlertValue.value === 'activeAlert') {
            params.active = true;
            params.timeSlots = '';
        } else {
            params.active = false;
        }
        return params;
    };

    /** 根据当前选择参数查询告警记录表 */
    const getAutoAlertStatistics = (pageIndex, pageSize) => {
        let url = APIS.autoAlert.statistics.searchStatistics;
        let params = getParamForStatistics(pageIndex, pageSize);
        Loading.isLoading('#auto_alert_statistics');
        HttpRequestService.get(url, params, data => {
            $scope.statisticsGridOptions.data.length = 0;
            convertToGridData(data.autoAlertStatisticalRecordList, 'records');
            angular.forEach(curAlertData, row => {
                $scope.statisticsGridOptions.data.push(row);
            });
            $(() => {
                $('[data-toggle=\'popover\']').popover();
            });
            $scope.statisticsGridOptions.totalItems = data.totalCount;
            $scope.emergencyAlertCount = data.emergencyAlertCount;
            $scope.majorAlertCount = data.majorAlertCount;
            $scope.commonAlertCount = data.commonAlertCount;
            Loading.hideLoading('#auto_alert_statistics');
            $scope.pageConfig.records.pageCount = $scope.recordGridApi.pagination.getTotalPages();
            let displayPage = [];
            if ($scope.recordGridApi.pagination.getTotalPages() <= 5) {
                $scope.pageConfig.records.initDisplayPage = $scope.recordGridApi.pagination.getTotalPages();
                for (let i = 1; i <= $scope.recordGridApi.pagination.getTotalPages(); i++) {
                    displayPage.push(i)
                }
                $scope.pageConfig.records.displayPage = displayPage;
            } else if ($scope.pageConfig.records.selectPage <= 5) {
                for (let i = 1; i <= 5; i++) {
                    displayPage.push(i)
                }
                $scope.pageConfig.records.displayPage = displayPage;
                $scope.pageConfig.records.initDisplayPage = 5;
            }
        }, () => {
            Loading.hideLoading('#auto_alert_statistics');
        });
    };

    /** 删除告警规则 */
    $scope.deleteAutoAlertRule = ruleId => {
        swal({
            text: '删除此告警规则？',
            type: 'warning',
            confirmButtonText: '确定',
            showCancelButton: true,
            cancelButtonColor: '#DD3333',
            cancelButtonText: '取消',
        }).then(() => {
            let url = APIS.autoAlert.rule.rule + '/' + ruleId;
            HttpRequestService.delete(url, {}, () => {
                getAutoAlertRuleList();
            });
        }, () => ({}));
    };

    /** 重置告警记录状态*/
    $scope.resetAlertRecord = (recordId, active) => {
        swal({
            text: active === true ? '恢复本条规则？' : '清除本条告警？',
            type: 'warning',
            confirmButtonText: '确定',
            showCancelButton: true,
            cancelButtonColor: '#DD3333',
            cancelButtonText: '取消',
        }).then(() => {
            let url = APIS.autoAlert.statistics.resetStatistic;
            let params = {
                'id': recordId,
                'active': active,
            };
            HttpRequestService.put(url, params, {}, () => {
                getAutoAlertStatistics(curPageIndex, curPageSize);
            });
        }, () => ({}));
    };

    /** 获取维度列表 */
    const getDimensionList = () => {
        $scope.dimensionList = autoAlertDataConfig.dimension[$scope.selectedInterface];
        $scope.queryTool.objectTypes.options = $scope.dimensionList;
        $scope.queryTool.objectTypes.model = [];
        $scope.queryTool.objectTypes.model.push($scope.queryTool.objectTypes.options[0]);
        $scope.selectedDimension = $scope.dimensionList && $scope.dimensionList.length > 0 ? $scope.dimensionList[0].value : '';
        $scope.networkElementSearching.keyword = '';
        //$scope.clearSelectedNetworkElementList();
        $scope.searchNetworkElementList();
    };

    /** 点击选择接口 */
    $scope.selectInterface = thisInterface => {
        $scope.selectedInterface = thisInterface;
        getDimensionList();
        $scope.getIndicatorList();
    };

    /** 点击选择维度 */
    $scope.selectDimension = thisDimension => {
        $scope.selectedDimension = thisDimension;
        $scope.networkElementSearching.keyword = '';
        //$scope.clearSelectedNetworkElementList();
        $scope.searchNetworkElementList();
        //$scope.getIndicatorList();
    };

    /** 是否选中当前接口 */
    $scope.isSelectedInterface = thisInterface => $scope.selectedInterface === thisInterface ? require('../../assets/images/autoAlert/icon_checked.png') : require('../../assets/images/autoAlert/icon_unchecked.png');

    /** 是否选中当前维度 */
    $scope.isSelectedDimension = thisDimension => $scope.selectedDimension === thisDimension ? require('../../assets/images/autoAlert/icon_checked.png') : require('../../assets/images/autoAlert/icon_unchecked.png');

    /** 指标列表填充 */
    $scope.getIndicatorList = selectedIndicator => {
        let url = APIS.indicator.indicators;
        let dimension = ($scope.selectedInterface === 'application' || $scope.selectedInterface === 'whole_network') ? 'app' : $scope.selectedInterface;
        let param = {
            module: 'MultiDim',
            dimension,
            isTree: true,
        };
        HttpRequestService.get(url, param, response => {
            $scope.indicatorTree = response;
            $scope.allIndCount = 0;
            for (let i = 0; i < $scope.indicatorTree.length; i++) {
                $scope.allIndCount += $scope.indicatorTree[i].branches.length;
            }
            indicators = [];
            $scope.queryTool.indicators.model = [];
            response.map(indicator => {
                if (indicator.branches) {
                    groupIndicators[indicator.id + ''] = indicator.name;
                    indicator.branches.map(subIndicator => {
                        indicators.push(subIndicator);
                    });
                }
            });
            $scope.queryTool.indicators.options = indicators;
            if(selectedIndicator){
                $scope.queryTool.indicators.model.push(selectedIndicator);
            }
        });
    };

    /** 当前指标的下层子列表 */
    $scope.atutoAlertIndicatorsById = id => {
        if (id === 'all') {
            let $all = $('#all');
            if ($all.attr('src').indexOf('icon_downward.png') !== -1) {
                $all.attr('src', require('../../assets/images/autoAlert/icon_downward2.png'));
                $('.Nshow14').show();
            } else {
                $all.attr('src', require('../../assets/images/autoAlert/icon_downward.png'));
                $('.Nshow14').hide();
            }
            return;
        }
        let $ele = $('#' + id);
        if ($ele.css('display') === 'block') {
            $ele.hide();
            $('#sub' + id).attr('src', require('../../assets/images/autoAlert/icon_downward.png'));
        } else {
            $('.Nshow4').hide();
            $('.Nshow').attr('src', require('../../assets/images/autoAlert/icon_downward.png'));
            $ele.show();
            $('#sub' + id).attr('src', require('../../assets/images/autoAlert/icon_downward2.png'));
        }
    };

    /** 判断网络指标是否选中 */
    $scope.isSelectedInd = function (pid, id) {
        if ($scope.selectedIndicator && $scope.selectedIndicator.id === id) {
            return require('../../assets/images/autoAlert/icon_checked.png');
        }
        return require('../../assets/images/autoAlert/icon_unchecked.png');
    };

    /** 子级网络指标点击事件 */
    $scope.level1FirstThreshold = '';
    $scope.leve21FirstThreshold = '';
    $scope.leve31FirstThreshold = '';
    $scope.selectedInd = function (pid, id) {
        for (let i = 0; i < $scope.indicatorTree.length; i++) {
            for (let k = 0; k < $scope.indicatorTree[i].branches.length; k++) {
                if ($scope.indicatorTree[i].branches[k].id === id) {
                    $scope.selectedIndicator = $scope.indicatorTree[i].branches[k];
                }
            }
        }
        $scope.interval = '60';
    };

    /** 弹出添加窗口 */
    $scope.toAddAutoAlertRule = () => {
        if ($scope.isRulesCountOverMaxLimit) {
            swal({
                title: '提醒',
                text: '告警规则已达到上限，如需添加请先删除规则！',
                confirmButtonText: '确定',
            });
            return;
        }
        $scope.edit_type = 0;
        /** 一般为level1、operator1，重点为level2、operator2，紧急为level3、operator3，对应的英文部分要改*/
        $scope.operator1 = '';
        $scope.level1FirstThreshold = '';
        $scope.operator2 = '';
        $scope.level2FirstThreshold = '';
        $scope.operator3 = '';
        $scope.level3FirstThreshold = '';
        $scope.interval = '60';
        $scope.ruleNames2 = '';
        $scope.selectedIndicator = '';
        $scope.activeSms = false;
        $scope.activeRealTimeM = false;
        $scope.selectInterface($scope.interfaceList[0] ? $scope.interfaceList[0].value : '');
        $('#editRuleButton,#editRulePopupTitle').hide();
        $('#addRulePopupTitle').show();
        $('#addRuleButton').show();
        // $('.dds').width('1296px');
        // $('.pj_name').show();
        // $('#rulePopupDiv').show();
        /** 初始化规则名称*/
        $('#ruleNames').val('');
        // const $ele = $('#rulePopupDiv .monitoring_tc');
        // $ele.css('margin-left', '-' + ($ele.width() / 2) + 'px');
        // $ele.css('margin-top', '-' + ($ele.height() / 2) + 'px');

        /**获取指标数据*/
        //$scope.getIndicatorList();
        /**初始化规则界面*/
        initRuleInterface();

        $('#ruleDetailButton').trigger('click');
    };

    /** 告警规则添加 */
    $scope.doAddAutoAlertRule = () => {
        if (!checkRuleValue()) {
            return;
        }
        let selectDimensionValues = [];
        let selectApplicationDimensions = [];

        if ($scope.selectedDimension === 'app_sub_type') {
            //$scope.selectedNetworkElementList.map(networkElement => {
            $scope.queryTool.objects.model.map(networkElement => {
                let appSubRelation = {
                    ruleId: '',
                    appType: networkElement.name,
                    appSubType: networkElement.id,
                    modifyTime: '',
                    createTime: '',
                };
                selectApplicationDimensions.push(appSubRelation);
            });
            selectDimensionValues = null;
        } else {
            // $scope.selectedNetworkElementList.map(networkElement => {
            $scope.queryTool.objects.model.map(networkElement => {
                selectDimensionValues.push(networkElement.id);
            });
            selectApplicationDimensions = null;
        }

        let url = APIS.autoAlert.rule.rule;
        let requestBody = {
            'ruleName': $scope.ruleNames,
            'dimension': $scope.selectedInterface,
            'dimensionType': $scope.selectedDimension,
            'dimensionTypeValues': selectDimensionValues,//如果选了业务小类，该字段可以不填。
            'applicationDimensions': selectApplicationDimensions,//如果选择了小类，该字段就写大小类的关系，大类为键值，小类用json数组表示，如示例。如果只选大类，该字段可以不填。
            'indicatorId': $scope.selectedIndicator.id,
            'emergentAlertRelationalOperator': $scope.operator3,
            'emergentAlertThreshold': $scope.level3FirstThreshold,
            'majorAlertRelationalOperator': $scope.operator2,
            'majorAlertThreshold': $scope.level2FirstThreshold,
            'commonlyAlertRelationalOperator': $scope.operator1,
            'commonlyAlertThreshold': $scope.level1FirstThreshold,
            'unit': $scope.selectedIndicator.unit,
            'interval': $scope.interval,
            'enabled': true,
            'modifiedTime': NOW,
            'createdTime': NOW,
        };
        HttpRequestService.post(url, {}, requestBody, () => {
            //$('.shade,#rulePopupDiv,#Nsubmitdiv1,#addRuleButton,#addRulePopupTitle,.pj_name').hide();
            getAutoAlertRuleList(curPageIndex, curPageSize);
            $('#ruleDetailClose').trigger('click');
        }, error => {
            if (error.data.errorCode == '409') {
                swal({
                    text: '规则名称已存在，请更改名称',
                    type: 'warning',
                    confirmButtonText: '确定',
                })
            } else {
                swal({
                    text: '添加规则失败，参数不符合规范',
                    type: 'error',
                    confirmButtonText: '确定',
                })
            }
        });
    };

    /** 告警规则修改窗口 */
    $scope.toEditAutoAlertRule = rule => {
        selectedRule = rule;
        $scope.selectedInterface = rule.dimension;
        $scope.dimensionList = autoAlertDataConfig.dimension[$scope.selectedInterface];
        $scope.ruleNames = rule.ruleName;
        $scope.selectedDimension = rule.dimensionType;
        $scope.operator1 = rule.commonlyAlertRelationalOperator;
        $scope.level1FirstThreshold = rule.commonlyAlertThreshold;
        $scope.operator2 = rule.majorAlertRelationalOperator;
        $scope.level2FirstThreshold = rule.majorAlertThreshold;
        $scope.operator3 = rule.emergentAlertRelationalOperator;
        $scope.level3FirstThreshold = rule.emergentAlertThreshold;
        switch (rule.interval) {
            case '5分钟':
                $scope.interval = '5';
                break;
            case '小时':
                $scope.interval = '60';
                break;
            case '天':
                $scope.interval = '1440';
                break;
            default:
                break;
        }
        $scope.edit_type = 1;
        $scope.networkElementSearching.keyword = '';
        //$scope.clearSelectedNetworkElementList();
        //$scope.searchNetworkElementList();
        $scope.selectedNetworkElementList = rule.dimensionTypeValues;
        //$scope.getIndicatorList();
        $scope.selectedIndicator = rule.indicator;
        $('#addRuleButton,#addRulePopupTitle').hide();
        $('#editRulePopupTitle').show();
        $('#editRuleButton').show();

        //回填维度,指标
        $scope.queryTool.dimensions.model = [];
        $scope.queryTool.dimensions.options.map(item => {
            if(item.value == rule.dimension) {
                $scope.queryTool.dimensions.model.push(item);
                $scope.selectInterface(item.value);
                $scope.getIndicatorList(rule.indicator);
            }
        });
        //回填对象,具体对象
        $scope.queryTool.objectTypes.model = [];
        $scope.queryTool.objectTypes.options.map(item => {
            if(item.value == rule.dimensionType) {
                $scope.queryTool.objectTypes.model.push(item);
                $scope.selectDimension(item.value);
                $scope.getTopNetworkElementList(rule.dimensionTypeValues);
            }
        });
        $('#ruleDetailButton').trigger('click');
    };

    /** 编辑告警规则 */
    $scope.doEditAutoAlertRule = () => {
        if (!checkRuleValue()) {
            return;
        }
        swal({
            text: '确定修改此告警规则？',
            type: 'question',
            confirmButtonText: '确定',
            showCancelButton: true,
            allowOutsideClick: false,
            cancelButtonColor: '#DD3333',
            cancelButtonText: '取消',
        }).then(() => {
            let selectDimensionValues = [];
            let selectApplicationDimensions = [];
            let selectDimensionType;
            if ($scope.selectedDimension === 'business_type') {
                selectDimensionType = 'app_type';
            } else if ($scope.selectedDimension === 'detail_business') {
                selectDimensionType = 'app_sub_type';
            } else {
                selectDimensionType = $scope.selectedDimension;
            }
            if ($scope.selectedDimension === 'app_sub_type') {
                // $scope.selectedNetworkElementList.map(networkElement => {
                $scope.queryTool.objects.model.map(networkElement => {
                    let appSubRelation = {
                        ruleId: '',
                        appType: networkElement.name,
                        appSubType: networkElement.id,
                        modifyTime: '',
                        createTime: '',
                    };
                    selectApplicationDimensions.push(appSubRelation);
                });
                selectDimensionValues = null;
            } else {
                // $scope.selectedNetworkElementList.map(networkElement => {
                $scope.queryTool.objects.model.map(networkElement => {
                    selectDimensionValues.push(networkElement.id);
                });
                selectApplicationDimensions = null;
            }
            if (!checkRuleValue()) {
                return;
            }
            let url = APIS.autoAlert.rule.rule;
            let requestBody = {
                'ruleId': selectedRule.ruleId,
                'ruleName': $scope.ruleNames,
                'dimension': $scope.selectedInterface,
                'dimensionType': selectDimensionType,
                'dimensionTypeValues': selectDimensionValues,//如果选了业务小类，该字段可以不填。
                'applicationDimensions': selectApplicationDimensions,//如果选择了小类，该字段就写大小类的关系，大类为键值，小类用json数组表示，如示例。如果只选大类，该字段可以不填。
                'indicatorId': $scope.selectedIndicator.id,
                'emergentAlertRelationalOperator': $scope.operator3,
                'emergentAlertThreshold': $scope.level3FirstThreshold,
                'majorAlertRelationalOperator': $scope.operator2,
                'majorAlertThreshold': $scope.level2FirstThreshold,
                'commonlyAlertRelationalOperator': $scope.operator1,
                'commonlyAlertThreshold': $scope.level1FirstThreshold,
                'unit': $scope.selectedIndicator.unit,
                'interval': $scope.interval,
                'enabled': true,
                'modifiedTime': NOW,
                'createdTime': null,
            };
            HttpRequestService.put(url, {}, requestBody, () => {
                $('.shade,#rulePopupDiv,#Nsubmitdiv1,#editRuleButton,#editRulePopupTitle,.pj_name').hide();
                getAutoAlertRuleList(curPageIndex, curPageSize);
                $('#ruleDetailClose').trigger('click');
            }, error => {
                if (error.data.errorCode == '409') {
                    swal({
                        text: '该规则名称已被使用,请更改名称',
                        type: 'warning',
                        confirmButtonText: '确定',
                    })
                } else {
                    swal({
                        text: '添加规则失败，服务器错误',
                        type: 'error',
                        confirmButtonText: '确定',
                    })
                }
            });
        }, () => {
            $scope.cancelEdit();
        });
    };

    /** 修改和添加的取消 */
    $scope.cancelEdit = function cancelEdit() {
        $('#addRuleButton,#addRulePopupTitle,#editRuleButton,#editRulePopupTitle').hide();
        $('#ruleDetailClose').trigger('click');
    };

    /** 当规则窗口隐藏时**/
    $('#myModal').on('hidden.bs.modal', () => {
        getAutoAlertRuleList(curPageIndex, curPageSize);
        $scope.queryTool.objects.IsWarning.isWarned = false;
        $scope.queryTool.objects.IsWarning.isSearched = false;
        $scope.queryTool.indicators.IsWarning.isWarned = false;
        $scope.queryTool.indicators.IsWarning.isSearched = false;
    })

    /** 新增告警规则前，验证字段是否为空 */
    $scope.toAddRule = () => {
        if (checkRuleValue()) {
            $('#Nsubmitdiv1').show();
        }
    };
    $('#delt').click(() => {
        $('#details2').show();
    });
    $('#details2').click(() => {
        $('#details2').hide();
    });

    /** 关闭遮罩层 */
    // $('.shade').click(() => {
    //     $('#ensureDeleteRule,#ensureClearAlert,#ensureCancelClearAlert,.shade').hide();
    // });
    // $('#cancelEditButton,.Nsubmitdivbutton2').click(() => {
    //     $('.shade,#rulePopupDiv,#Nsubmitdiv1,#addRuleButton,#addRulePopupTitle,#editRuleButton,#editRulePopupTitle').hide();
    // });

    /** 显示告警规则详情 */
    $scope.showAutoAlertDetail = event => {
        let gzxq = $(event.target).siblings('.rule_a').html();
        let dim_a = $(event.target).siblings('.dim_a').html();
        $('.gzxq').html(gzxq);
        $('.dim_b').html(dim_a);
        $('#details').show();
        $('#details .monitoring_tc').css({
            'margin-left': '-' + ($('#details .monitoring_tc').width() / 2) + 'px',
            'margin-top': '-' + ($('#details .monitoring_tc').height() / 2) + 'px',
        });
        $('#details .recordupdate_main').css('min-width', '200px');
    };
    $('#details,.Nnclose').click(() => {
        $('#details,#details2,#history').hide();
    });

    /** 添加编辑规则时判断所填字段是否合法 */
    const checkRuleValue = () => {
        let indicatorLength = 0;
        indicatorLength=($scope.selectedIndicator === null || $scope.selectedIndicator === '') ? 0 : $scope.selectedIndicator.level;
        if ($scope.queryTool.objects.model.length === 0 || indicatorLength === 0){
            if ($scope.queryTool.objects.model.length === 0) {
                $scope.queryTool.objects.IsWarning.isWarned = true;
                $scope.queryTool.objects.IsWarning.isSearched = true;
            }else{
                $scope.queryTool.objects.IsWarning.isWarned = false;
                $scope.queryTool.objects.IsWarning.isSearched = false;
            }
            if (indicatorLength === 0) {
                $scope.queryTool.indicators.IsWarning.isWarned = true;
                $scope.queryTool.indicators.IsWarning.isSearched = true;
            }else{
                $scope.queryTool.indicators.IsWarning.isWarned = false;
                $scope.queryTool.indicators.IsWarning.isSearched = false;
            }
            return false;
        }
        $scope.queryTool.objects.IsWarning.isWarned = false;
        $scope.queryTool.objects.IsWarning.isSearched = false;
        $scope.queryTool.indicators.IsWarning.isWarned = false;
        $scope.queryTool.indicators.IsWarning.isSearched = false;
        if (!checkRuleName()) {
            return false;
        }
        if (!checkOperatorsAreSame()) {
            swal({
                text: '请确定告警符号一致！',
                type: 'warning',
                confirmButtonText: '确定',
            });
            return false;
        }
        if (!checkThreshold()) {
            switch (checkThresholdResult) {
                case 'invalidNumber':
                    swal({
                        text: '请输入整数！',
                        type: 'warning',
                        confirmButtonText: '确定',
                    });
                    return false;
                case 'outOfRange':
                    swal({
                        text: '请输入小于100的整数！',
                        type: 'warning',
                        confirmButtonText: '确定',
                    });
                    return false;
                default:
                    break;
            }
        }
        if (!$scope.level1FirstThreshold) {
            $scope.operator1 = '';
        }
        if (!$scope.level2FirstThreshold) {
            $scope.operator2 = '';
        }
        if (!$scope.level3FirstThreshold) {
            $scope.operator3 = '';
        }
        if (!$scope.level1FirstThreshold && !$scope.level2FirstThreshold && !$scope.level3FirstThreshold) {
            swal({
                text: '告警级别设置不能为空！',
                type: 'warning',
                confirmButtonText: '确定',
            });
            return;
        }
        if ($scope.operator1 === '>' || $scope.operator1 === '>=') {
            if ($scope.level1FirstThreshold && $scope.level2FirstThreshold && $scope.level1FirstThreshold >= $scope.level2FirstThreshold) {
                showAlert('重要告警数值必须大于一般告警数值');
                return;
            }
            if ($scope.level1FirstThreshold && $scope.level3FirstThreshold && $scope.level1FirstThreshold >= $scope.level3FirstThreshold) {
                showAlert('紧急告警数值必须大于一般告警数值');
                return;
            }
            if ($scope.level2FirstThreshold && $scope.level3FirstThreshold && $scope.level2FirstThreshold >= $scope.level3FirstThreshold) {
                showAlert('紧急告警数值必须大于重要告警数值');
                return;
            }
        } else if ($scope.operator1 === '<' || $scope.operator1 === '<=') {
            if ($scope.level1FirstThreshold && $scope.level2FirstThreshold && $scope.level1FirstThreshold <= $scope.level2FirstThreshold) {
                showAlert('一般告警数值必须大于重要告警数值');
                return;
            }
            if ($scope.level1FirstThreshold && $scope.level3FirstThreshold && $scope.level1FirstThreshold <= $scope.level3FirstThreshold) {
                showAlert('一般告警数值必须大于紧急告警数值');
                return;
            }
            if ($scope.level2FirstThreshold && $scope.level3FirstThreshold && $scope.level2FirstThreshold <= $scope.level3FirstThreshold) {
                showAlert('重要告警数值必须大于紧急告警数值');
                return;
            }
        }
        return true;
    };

    /** 检查告警级别的符号是否符合规范 */
    const checkOperatorsAreSame = () => {
        let operator = '' + $scope.operator1 + $scope.operator2 + $scope.operator3;
        return !(operator.indexOf('<') >= 0 && operator.indexOf('>') >= 0);
    };

    /** 检查告警级别的值是否符合规范 */
    const checkThreshold = () => {
        checkThresholdResult = '';
        let r = /^-?\d+$/; // 整数 正则
        let threshold1 = $scope.level1FirstThreshold;
        let threshold2 = $scope.level2FirstThreshold;
        let threshold3 = $scope.level3FirstThreshold;
        if (r.test(threshold1) && r.test(threshold2) && r.test(threshold3)) {
            if ($scope.selectedIndicator.unit === '%') {
                if (Number(threshold1) > 100 || Number(threshold2) > 100 || Number(threshold3) > 100) {
                    checkThresholdResult = 'outOfRange'; //如果是 % ，并且输入的值 大于 100
                    return false;
                }
            }
        } else if (((threshold1 !== null && threshold1 !== '') && !r.test(threshold1)) || ((threshold2 !== null && threshold2 !== '') && !r.test(threshold2)) || ((threshold3 !== null && threshold3 !== '') && !r.test(threshold3))) {
            checkThresholdResult = 'invalidNumber'; //输入的值不是 整数
            return false;
        }
    };

    /** 搜索网元用的对象 */
    $scope.networkElementSearching = {
        /** 网元搜索关键字 */
        keyword: '',
        /** 网元分页当前页数，首次成功加载后变成1 */
        page: 0,
        /** 网元分页每页大小 */
        pageSize: 20,
        /** 分页返回了空数组，则认为没有后续数据，不继续加载 */
        isEmptyResult: false,
        /** 加载的过程中不触发下一次加载 */
        isLoading: false,
    };
    /** 搜索网元列表 */
    $scope.searchNetworkElementList = () => {
        $scope.getTopNetworkElementList();
    };
    /** 搜索指标列表*/
    $scope.searchIndicatorList = () => {
        $('.Nuul2  p').hide().filter(':contains(\'' + $scope.indicatorSearching + '\')').show();
    };
    /** 验证监控规则长度和特殊字符*/
    const checkRuleName = () => {
        if ($('#ruleNames').val() && !($filter('inputIsIllegal')($('#ruleNames').val(), 'templateName'))) {
            swal({
                text: '规则名称只能使用中文、英文、数字、下划线或者连接符且不能以符号开头！',
                type: 'warning',
                confirmButtonText: '确定',
                allowOutsideClick: false,
            });
            return;
        }
        if (!$('#ruleNames').val()) {
            swal({
                text: '规则名称不能为空！',
                type: 'warning',
                confirmButtonText: '确定',
                allowOutsideClick: false,
            });
            return;
        }
        if ($('#ruleNames').val() && ($('#ruleNames').val().length < 2 || $('#ruleNames').val().length > 20)) {
            swal({
                text: '规则名称的长度只能在2-20！',
                type: 'warning',
                confirmButtonText: '确定',
                allowOutsideClick: false,
            });
            return;
        }
        return true;
    };

    /**初始化时间控件  更新时间*/
    $scope.upDateDate = (timeSlots, isWarning) => {
        $scope.timeSlots = timeSlots;
        $scope.isWarning = isWarning;
        datePickerInited = true;
    };

    $scope.dimensionList = [];
    $scope.selectDimensionList = [];
    $scope.selectDimensionIdList = [];

    /** tab标签 */
    $scope.area = 'device';
    $scope.areaCell = 'areaCell';
    $scope.app = 'application';
    $scope.networkElement = 'networkElement';

    /** Excel表格输出名称*/
    $scope.tableName = '';

    /** 默认显示的tab*/
    $scope.curActiveTab = 0;

    /** 当前选择的规则*/
    $scope.curSelectRule = {};

    /** 告警记录列表 */
    $scope.areaAlertList = [];
    $scope.wholeetworkAlertList = [];
    $scope.applicationAlertList = [];
    $scope.networkElementAlertList = [];

    /** 按天查询下拉列表选择 */
    $scope.timeQueryType = [
        {
            value: 'interDays',
            name: '跨天查询',
        },
        {
            value: 'manyDays',
            name: '多天查询',
        },
    ];

    /** 告警查询下拉列表选择 */
    $scope.alertQueryType = [
        {
            value: 'activeAlert',
            name: '活动告警',
        },
        {
            value: 'historyAlert',
            name: '历史告警',
        },
    ];

    /**  默认选择跨天查询  */
    $scope.selectDayValue = $scope.timeQueryType[0];
    /**  默认选择活动告警  */
    $scope.selectAlertValue = $scope.alertQueryType[0];
    /** 早晚忙时点击事件 */
    $scope.busyCheck = false;
    $scope.checkedBusy = function checkedBusy() {
        $scope.selectDayValue = $scope.timeQueryType[1];
        $scope.busyCheck = !$scope.busyCheck
    };

    /**结束提示*/
    const showAlert = function (content) {//操作成功后提示2秒后自动关闭
        swal({
            title: '操作提示',
            text: content,
            showConfirmButton: false,
            timer: 2000,
        }).then(() => '', () => ({}));
    };

    $scope.inputAlertKeyup = () => {
        if ($scope.operator1 === '') {
            $scope.level1FirstThreshold = '';
        }
        if ($scope.operator2 === '') {
            $scope.level2FirstThreshold = '';
        }
        if ($scope.operator3 === '') {
            $scope.level3FirstThreshold = '';
        }
    };

    /**活动or历史告警切换*/
    // 时间控件不可点击
    $('#layDate').attr('disabled', true);
    $scope.dropdownSelectAlert = () => {
        getAutoAlertStatistics(1, 10);
        if ($scope.selectAlertValue.value === 'activeAlert') {
            $('#layDate').attr('disabled', true);
        } else {
            $('#layDate').removeAttr('disabled')
        }
    };

    /** tab 点击事件 */
    $scope.selectCurTab = function (tabId) {
        switch (tabId) {
            case 0 :
                $scope.allColor = false;
                $scope.elementsColor = false;
                $scope.areaColor = true;
                $scope.appColor = false;
                selectedDimensionGroup = 'device';
                getAutoAlertStatistics(1, 10);
                break;
            case 1 :
                $scope.allColor = true;
                $scope.elementsColor = false;
                $scope.areaColor = false;
                $scope.appColor = false;
                selectedDimensionGroup = 'whole_network';
                getAutoAlertStatistics(1, 10);
                break;
            case 2 :
                $scope.allColor = false;
                $scope.elementsColor = false;
                $scope.areaColor = false;
                $scope.appColor = true;
                selectedDimensionGroup = 'application';
                getAutoAlertStatistics(1, 10);
                break;
            case 3 :
                $scope.allColor = false;
                $scope.elementsColor = true;
                $scope.areaColor = false;
                $scope.appColor = false;
                selectedDimensionGroup = 'icp';
                getAutoAlertStatistics(1, 10);
                break;
            default:
                break;
        }
    };

    /** 校验时间 */
    const checkDate = () => {
        if ($scope.isWarning === 'long') {
            swal({
                type: 'warning',
                text: '你选择的时间区间过长！请重新选择时间',
            });
            $scope.isWarning = 'yes';
            return false;
        } else if ($scope.isWarning === 'empty') {
            $scope.isWarning = 'yes';
            return false;
        }
        $scope.isWarning = 'no';
        return true;
    };

    /** 查询按钮点击事件 */
    $scope.searchData = () => {
        if (checkDate()) {
            getAutoAlertStatistics(1, 10);
        }
    };
    /** 时间戳转普通时间 */
    $scope.unixChangeCommonTime = time => $filter('date')(new Date(time), 'yyyy-MM-dd hh:mm:ss');

    /**自定义单元格template*/
    const setCelltemplate = type => {
        if (type == 'ruleName') {
            return `<div class="ui-grid-cell-contents ng-binding ng-scope" style="white-space:nowrap">
                        <span style="margin-left: 8px">{{COL_FIELD CUSTOM_FILTERS}}</span>
                    </div>`;
        } else if (type === 'alertRules') {
            return '<div class="ui-grid-cell-contents ng-binding ng-scope add-alert-rules">' +
                '<div style="width: 33%"><span class="rule_warning_alarm rank1">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp' +
                '</span>' +
                '<span ng-if="row.entity.emergentAlertThreshold != null">{{row.entity.emergentAlertRelationalOperator}}</span>' +
                '<span>{{row.entity.emergentAlertThreshold}}</span><span ng-if="(row.entity.unit==1)&&(row.entity.emergentAlertThreshold != null)">%</span></div>' +
                '<div style="width: 33%"><span class="rule_warning_alarm rank2">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp' +
                '</span>' +
                '<span ng-if="row.entity.majorAlertThreshold != null">{{row.entity.majorAlertRelationalOperator}}</span>' +
                '<span>{{row.entity.majorAlertThreshold}}</span><span ng-if="(row.entity.unit==1)&&(row.entity.majorAlertThreshold != null)">%</span></div>' +
                '<div style="width: 34%"><span class="rule_warning_alarm rank3">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp' +
                '</span>' +
                '<span ng-if="row.entity.commonlyAlertThreshold != null">{{row.entity.commonlyAlertRelationalOperator}}</span>' +
                '<span>{{row.entity.commonlyAlertThreshold}}</span><span ng-if="(row.entity.unit==1)&&(row.entity.commonlyAlertThreshold != null)">%</span></div>' +
                '</div>';
        } else if (type === 'operator') {
            return '<div class="ui-grid-cell-contents ng-binding ng-scope">' +
                '<span class="fa fa-pencil-square-o fa-lg edit-color clickable" ng-click="grid.appScope.toEditAutoAlertRule(row.entity)"' +
                'class="HheightA DdisplayIB FfloatL MmarginR5 Ppadding0 clickable"></span>' +
                '<span class="fa fa-window-close-o fa-lg cancel-color clickable" ng-click="grid.appScope.deleteAutoAlertRule(row.entity.ruleId)"' +
                'class="HheightA DdisplayIB FfloatL MmarginR5 Ppadding0 clickable"></span>' +
                '</div>';
        } else if (type === 'statisticsRuleName') {
            return `<div class="ui-grid-cell-contents ng-binding ng-scope" style="white-space:nowrap">
                <button type="button" class="btn btn-sm btn-outline-info statistics-rule-name-clickable"
                data-toggle="popover"
                title="规则详情"
                data-html=true 
                data-trigger="focus"
                data-content="一般告警：{{row.entity.rule.commonlyAlertRelationalOperator}}{{row.entity.rule.commonlyAlertThreshold}}{{row.entity.rule.unit==1?'%':''}}<br>重要告警：{{row.entity.rule.majorAlertRelationalOperator}}{{row.entity.rule.majorAlertThreshold}}{{row.entity.rule.unit==1?'%':''}}<br>紧急告警：{{row.entity.rule.emergentAlertRelationalOperator}}{{row.entity.rule.emergentAlertThreshold}}{{row.entity.rule.unit==1?'%':''}}">
                <span class="fa fa-question-circle-o fa-lg edit-color" ng-click="" style="float: left;"></span>
                </button>
                <span style="margin-left: 8px;">{{row.entity.rule.ruleName}}</span>`;
        } else if (type === 'statisticsOperator') {
            return `<div class="ui-grid-cell-contents ng-binding ng-scope alert-records-operator-position">
                        <span class="btn btn-outline-info alert-record-clickable" ng-click="grid.appScope.resetAlertRecord(row.entity.id,false)" style="color:red" ng-if="row.entity.active">清除</span>
                        <span class="btn btn-outline-info alert-record-clickable" ng-click="grid.appScope.resetAlertRecord(row.entity.id,true)" ng-if="!row.entity.active">恢复</span>
                    </div>`;
        } else if (type === 'indicatorName') {
            return '<div class="ui-grid-cell-contents ng-binding ng-scope"><span>{{row.entity.indicator.name}}</span></div>';
        } else if (type === 'recordRuleName') {
            return '<div class="ui-grid-cell-contents ng-binding ng-scope"><span>{{row.entity.ruleName}}</span></div>';
        } else if (type === 'firstTriggeredTime') {
            return '<span>{{grid.appScope.unixChangeCommonTime(row.entity.firstTriggeredTime)}}</span>'
        } else if (type === 'latestTriggeredTime') {
            return '<span>{{grid.appScope.unixChangeCommonTime(row.entity.latestTriggeredTime)}}</span>'
        } else if (type === 'latestAutoAlertValue') {
            return `<div class="ui-grid-cell-contents ng-binding ng-scope" style="display: flex;justify-content: space-between;">
                <span style="margin-left: 8px;">{{row.entity.latestAutoAlertValue}}</span>
                <i class="fa fa-bar-chart fa-lg edit-color " data-toggle="modal" data-target="#indicatorValueTrend"
                ng-click="grid.appScope.getIndicatorValueTrend(row.entity.id,row.entity.dimensionTypeValue.name,row.entity.rule)"></i>
                </div>`;
        }
    };

    /**分页控件配置 */
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
    /**初始化规则表*/
    const initAutoAlertRulesGrid = () => {
        $scope.ruleGridOptions = {
            enableGridMenu: true,
            useExternalPagination: true,
            enablePaginationControls: true,
            paginationPageSizes: [10, 30, 50],
            paginationPageSize: 10,
            paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
            exporterCsvFilename: '主动告警规则表.csv',
            exporterOlderExcelCompatibility: true,
            columnDefs: [],
            exporterAllDataFn() {
                return getRulesData()
                    .then(() => {
                        $scope.ruleGridOptions.useExternalPagination = false;
                        $scope.ruleGridOptions.useExternalSorting = false;
                        getRulesData = null;
                    });
            },
        };
        $scope.ruleGridOptions.appScopeProvider = $scope;
        $scope.ruleGridOptions.onRegisterApi = function (gridApi) {
            $scope.rulesGridApi = gridApi;
            gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
                if (getRulesData) {
                    curPageSize = pageSize;
                    curPageIndex = newPage;
                    getAutoAlertRuleList(curPageIndex, curPageSize);
                }
            });
            gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
                if (getRulesData) {
                    curPageSize = grid.options.paginationPageSize;
                    curPageIndex = grid.options.paginationCurrentPage;
                    getAutoAlertRuleList(curPageIndex, curPageSize);
                }
            });
        };
        /***导出数据*/
        let getRulesData = function () {
            return new Promise((resolve, reject) => {
                let param = {
                    'filter': 2,
                    'pageIndex': 0,
                    'pageSize': -1,
                };
                HttpRequestService.get(APIS.autoAlert.rule.searchRuleList, param, data => {
                    $scope.ruleGridOptions.data.length = 0;
                    curAutoAlertRules.length = 0;
                    convertToGridData(data.autoAlertRuleList, 'rules');
                    angular.forEach(curAutoAlertRules, row => {
                        $scope.ruleGridOptions.data.push(row);
                    });
                    resolve();
                }, () => {
                    reject();
                });
            });
        };
    };
    /**规则表加载数据*/
    const setRulesForGrid = () => {
        let columns = [];
        autoAlertDataConfig.rulesGridDefs.map(item => {
            let column;
            if (item.name === 'ruleName') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('ruleName'),
                    width: 200,
                }
            } else if (item.name === 'alertRules') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('alertRules'),
                    minWidth: 250,
                }
            } else if (item.name === 'dimensionName') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('dimensionType'),
                    width: 150,
                }
            } else if (item.name === 'indicatorName') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('indicatorName'),
                    width: 200,
                }
            } else if (item.name === 'interval') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('interval'),
                    width: 120,
                }
            } else if (item.name === 'modifiedTime') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    width: 200,
                }
            } else if (item.name === 'operator') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('operator'),
                    width: 120,
                }
            } else {
                column = item;
            }
            columns.push(column);
        });
        $scope.ruleGridOptions.columnDefs = columns;
        getAutoAlertRuleList(curPageIndex, curPageSize);
    };

    /**维度导出名转化为中文*/
    const getCHByUS = group => {
        switch (group) {
            case 'whole_network': {
                return '全网告警'
            }
            case 'device': {
                return '设备告警'
            }
            case 'application': {
                return '业务告警'
            }
            case 'icp': {
                return 'ICP告警'
            }
            default:
                break;
        }
    };

    /**初始化告警记录表*/
    const initAutoAlertStatisticsGrid = () => {
        $scope.statisticsGridOptions = {
            enableGridMenu: true,
            enablePaginationControls: true,
            useExternalPagination: true,
            paginationPageSizes: [10, 30, 50],
            paginationPageSize: 10,
            paginationTemplate: require('../../views/templates/ui-grid/PageControlTemplate.html'),
            cellTooltip: true,
            exporterCsvFilename: getCHByUS(selectedDimensionGroup) + '-' + ($scope.selectAlertValue.value === 'activeAlert' ? '活动' : '历史') + '.csv',
            exporterOlderExcelCompatibility: true,
            exporterAllDataFn() {
                return getStatisticsData()
                    .then(() => {
                        $scope.statisticsGridOptions.useExternalPagination = false;
                        $scope.statisticsGridOptions.useExternalSorting = false;
                        getStatisticsData = null;
                    });
            },
        };
        $scope.statisticsGridOptions.appScopeProvider = $scope;
        $scope.statisticsGridOptions.onRegisterApi = function (gridApi) {
            $scope.recordGridApi = gridApi;
            gridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => {
                if (getStatisticsData) {
                    getAutoAlertStatistics(newPage, pageSize);
                }
            });
            gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
                if (getStatisticsData) {
                    curPageSize = grid.options.paginationPageSize;
                    curPageIndex = grid.options.paginationCurrentPage;
                    getAutoAlertStatistics(curPageIndex, curPageSize);
                }
            });
        };
        /***导出数据*/
        let getStatisticsData = function () {
            curAlertData.length = 0;
            let url = APIS.autoAlert.statistics.searchStatistics;
            let params = getParamForStatistics(0, -1);
            return new Promise((resolve, reject) => {
                HttpRequestService.get(url, params, data => {
                    $scope.statisticsGridOptions.data.length = 0;
                    convertToGridData(data.autoAlertStatisticalRecordList, 'records');
                    angular.forEach(curAlertData, row => {
                        $scope.statisticsGridOptions.data.push(row);
                    });
                    $scope.emergencyAlertCount = data.emergencyAlertCount;
                    $scope.majorAlertCount = data.majorAlertCount;
                    $scope.commonAlertCount = data.commonAlertCount;
                    resolve();
                }, () => {
                    reject();
                });
            });
        };
        /***触发导出全部数据*/
        $scope.alertStatisticsToCsv = () => {
            $scope.statisticsGridOptions.exporterCsvFilename = getCHByUS(selectedDimensionGroup) + '-' + ($scope.selectAlertValue.value === 'activeAlert' ? '活动' : '历史') + '.csv';
            $scope.recordGridApi.exporter.csvExport('all', 'all');
        };
    };

    /**告警记录表加载数据*/
    const setStatisticsForGrid = () => {
        let columns = [];
        autoAlertDataConfig.alertStaticticsGridDefs.map(item => {
            let column;
            if (item.name === 'ruleName') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('statisticsRuleName'),
                    width: 110,
                }
            } else if (item.name === 'operator') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('statisticsOperator'),
                    width: 115,
                }
            } else if (item.name === 'firstTriggeredTime') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    width: 150,
                }
            } else if (item.name === 'latestTriggeredTime') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    width: 150,
                }
            } else if (item.name === 'dimensionValue') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('dimensionValue'),
                    width: 130,
                }
            } else if (item.name === 'triggeredCount') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('triggeredCount'),
                    width: 110,
                }
            } else if (item.name === 'interval') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('interval'),
                    width: 120,
                }
            } else if (item.name === 'latestAutoAlertValue') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    cellTemplate: setCelltemplate('latestAutoAlertValue'),
                    width: 130,
                }
            } else if (item.name === 'alertLevel') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    width: 140,
                }
            } else if (item.name === 'indicatorName') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    minWidth: 90,
                }
            }else if (item.name === 'dimension') {
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    minWidth: 90,
                }
            } else {
                // column = item;
                column = {
                    displayName: item.displayName,
                    name: item.name,
                    minWidth: 110,
                }
            }
            columns.push(column);
        });
        $scope.statisticsGridOptions.columnDefs = columns;
        getAutoAlertStatistics(curPageIndex, curPageSize);
    };

    /** 指标趋势图 */
    $scope.getIndicatorValueTrend = (statisticalId, dimensionTypeName, rule) => {
        $('#indicatorValueTrend').show();
        let chartForIndicatorValueTrend = echarts.init(document.getElementById('indicatorValueTrendChart'));
        chartForIndicatorValueTrend.showLoading();

        let url = APIS.autoAlert.historyRecord.historyRecord;
        let param = {
            startTime: NOW - 30 * 1000 * 60 * 60 * 24,
            endTime: NOW,
            id: statisticalId,
        };

        let ruleName = rule.ruleName;
        let emergentAlertRelationalOperator = rule.emergentAlertRelationalOperator;
        let emergentAlertThreshold = rule.emergentAlertThreshold;
        let majorAlertThreshold = rule.majorAlertThreshold;
        let commonlyAlertThreshold = rule.commonlyAlertThreshold;
        let unit = rule.unit;

        // 根据不同指标限制 echarts Y轴 最大值
        let maxValue;
        if (unit === '%') {
            maxValue = 100;
        } else {
            maxValue = (checkOperator(emergentAlertRelationalOperator) ? commonlyAlertThreshold : emergentAlertThreshold) + 30;
        }

        $scope.IndicatorTrendTitle = ruleName + '——' + dimensionTypeName;

        HttpRequestService.get(url, param, response => {
            let contentX = [];
            let contentY = [];
            response.map(record => {
                contentY.push(record.autoAlertValue);
                contentX.push($scope.unixChangeCommonTime(record.triggeredTime));
            });

            let option = {
                axisPointer: {
                    link: {
                        xAxisIndex: 'all',
                    },
                },
                dataZoom: [{
                    show: true,
                    realtime: true,
                    start: 70,
                    end: 100,
                    xAxisIndex: [0, 1],
                }, {
                    type: 'inside',
                    realtime: true,
                    start: 70,
                    end: 100,
                    xAxisIndex: [0, 1],
                }],
                grid: [{
                    top: 60,
                    left: 40,
                    right: 40,
                }, {
                    left: 40,
                    right: 40,
                }],
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    axisLine: {
                        onZero: true,
                    },
                    data: contentX,
                }, {
                    gridIndex: 1,
                }],
                yAxis: [{
                    type: 'value',
                    max: maxValue,
                    name: '单位:  ' + unit,
                    min: 0,
                }, {
                    gridIndex: 1,
                }],
                series: [{
                    name: '数值',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 9,
                    showSymbol: false,
                    lineStyle: {
                        normal: {
                            width: 1,
                        },
                    },
                    markPoint: {
                        data: [{
                            type: 'max',
                            name: '最大值',
                        }, {
                            type: 'min',
                            name: '最小值',
                        }],
                    },
                    markArea: {
                        silent: true,
                        label: {
                            normal: {
                                position: ['10%', '50%'],
                            },
                        },
                        data: [
                            [{
                                name: '正常',
                                yAxis: checkOperator(emergentAlertRelationalOperator) ? commonlyAlertThreshold : 0,
                            }, {
                                yAxis: checkOperator(emergentAlertRelationalOperator) ? maxValue : commonlyAlertThreshold,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(255,255,255,0.2)',
                                    },
                                },
                            }],
                            [{
                                name: '一般告警',
                                yAxis: checkOperator(emergentAlertRelationalOperator) ? majorAlertThreshold : commonlyAlertThreshold,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(0,153,153,0.27)',
                                    },
                                },
                            }, {
                                yAxis: checkOperator(emergentAlertRelationalOperator) ? commonlyAlertThreshold : majorAlertThreshold,
                            }],
                            [{
                                name: '重要告警',
                                yAxis: checkOperator(emergentAlertRelationalOperator) ? emergentAlertThreshold : majorAlertThreshold,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(153,204,51,0.2)',
                                    },
                                },
                            }, {
                                yAxis: checkOperator(emergentAlertRelationalOperator) ? majorAlertThreshold : commonlyAlertThreshold,
                            }],
                            [{
                                name: '紧急告警',
                                yAxis: checkOperator(emergentAlertRelationalOperator) ? 0 : commonlyAlertThreshold,
                                itemStyle: {
                                    normal: {
                                        color: 'rgba(250,250,51,0.2)',
                                    },
                                },
                            }, {
                                yAxis: checkOperator(emergentAlertRelationalOperator) ? emergentAlertThreshold : maxValue,
                            }],
                        ],
                    },
                    data: contentY,
                }],
            };
            chartForIndicatorValueTrend.hideLoading();
            chartForIndicatorValueTrend.setOption(option);
        }, () => {
            chartForIndicatorValueTrend.hideLoading();
        });
    };

    /** 检查告警符号是大于号，还是小于号，小于号为true，大于号为false */
    const checkOperator = operator => operator.indexOf('<') >= 0 || operator.indexOf('<=') >= 0;

    /** 下拉箭头点击事件 */
    $scope.showSearchPanel = true;
    $scope.togglePanel = () => {
        $scope.showSearchPanel = !$scope.showSearchPanel;
        $('#query-panel-body').slideToggle('normal');
    };

    /******************** 初始化加载页面 *******************************/
    const initController = () => {
        /**初始化规则表*/
        initAutoAlertRulesGrid();
        /**初始化告警记录表*/
        initAutoAlertStatisticsGrid();
        /**加载规则表数据*/
        setRulesForGrid();
        /**加载告警记录表*/
        setStatisticsForGrid();
        /**初始化时间控件*/
        $scope.autoAlertInterval = 'autoAlert';
    };
    initController();
}
AutoAlertController.$inject = ['$scope', '$filter', 'HttpRequestService', '$timeout'];