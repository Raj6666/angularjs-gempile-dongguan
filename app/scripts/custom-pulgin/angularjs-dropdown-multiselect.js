import ShakeWarning from './ShakeWarning';

(function (modules) { // webpackBootstrap
    // The module cache
    let installedModules = {};

    // The require function
    function __webpack_require__(moduleId) {
        // Check if module is in cache
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }

        // Create a new module (and put it into the cache)
        let module = installedModules[moduleId] = {
            exports: {},
            id: moduleId,
            loaded: false,
        };

        // Execute the module function
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        // Flag the module as loaded
        module.loaded = true;

        // Return the exports of the module
        return module.exports;
    }


    // expose the modules object (__webpack_modules__)
    __webpack_require__.m = modules;

    // expose the module cache
    __webpack_require__.c = installedModules;

    // __webpack_public_path__
    __webpack_require__.p = '';

    // Load entry module and return exports
    return __webpack_require__(0);
})

([
    /* 0 */
    function (module, exports, __webpack_require__) {
        'use strict';

        let _angularjsDropdownMultiselect = __webpack_require__(1);

        let _angularjsDropdownMultiselect2 = _interopRequireDefault(_angularjsDropdownMultiselect);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {default: obj};
        }

        angular.module('angularjs-dropdown-multiselect', []).directive('dmDropdownStaticInclude', ['$compile', function ($compile) {
            'ngInject';

            return function directive(scope, element, attrs) {
                let template = attrs.dmDropdownStaticInclude;
                let contents = element.html(template).contents();
                $compile(contents)(scope);
            };
        }]).directive('ngDropdownMultiselect', _angularjsDropdownMultiselect2.default);
    },

    /* 1 */
    function (module, exports, __webpack_require__) {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
            value: true,
        });
        exports.default = dropdownMultiselectDirective;

        let _angularjsDropdownMultiselect = __webpack_require__(2);

        let _angularjsDropdownMultiselect2 = _interopRequireDefault(_angularjsDropdownMultiselect);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {default: obj};
        }

        function dropdownMultiselectDirective() {
            return {
                restrict: 'AE',
                scope: {
                    selectedModel: '=',
                    options: '=',
                    searchOptions: '=',
                    extraSettings: '=',
                    events: '=',
                    searchFilter: '=?',
                    translationTexts: '=',
                    disabled: '=',
                    isWarning: '=',
                },
                transclude: {
                    toggleDropdown: '?toggleDropdown',
                },
                controller: _angularjsDropdownMultiselect2.default,
                templateUrl: 'app/component/angularjs-dropdown-multiselect.html',
            };
        }
    },

    /* 2 */
    function (module, exports) {
        'use strict';

        dropdownMultiselectController.$inject = ['$scope', '$element', '$filter', '$document'];
        Object.defineProperty(exports, '__esModule', {
            value: true,
        });
        exports.default = dropdownMultiselectController;

        function contains(collection, target) {
            let containsTarget = false;
            collection.some(object => {
                if (object === target) {
                    containsTarget = true;
                    return true;
                }
                return false;
            });
            return containsTarget;
        }

        function getIndexByProperty(collection, objectToFind, property) {
            let index = -1;
            collection.some((option, ind) => {
                if (option[property] === objectToFind[property]) {
                    index = ind;
                    return true;
                }
                return false;
            });
            return index;
        }

        function dropdownMultiselectController($scope, $element, $filter, $document) {
            'ngInject';

            let $dropdownTrigger = $element.children()[0];
            let externalEvents = {
                onItemSelect: angular.noop,
                onItemDeselect: angular.noop,
                onSelectAll: angular.noop,
                onDeselectAll: angular.noop,
                onInitDone: angular.noop,
                onMaxSelectionReached: angular.noop,
                onSelectionChanged: angular.noop,
                onClose: angular.noop,
                asyncSearchOptions: angular.noop,
                onDeleteItem: angular.noop,
            };

            let settings = {
                dynamicTitle: true,
                scrollable: false,
                scrollableHeight: '300px',
                closeOnBlur: true,
                displayProp: 'label',
                enableSearch: false,
                enableAsyncSearch: false,
                isSearch: false,
                clearSearchOnClose: false,
                selectionLimit: 0,
                showCheckAll: true,
                showUncheckAll: true,
                showEnableSearchButton: false,
                closeOnSelect: false,
                buttonClasses: 'btn btn-default',
                closeOnDeselect: false,
                groupBy: undefined,
                checkBoxes: false,
                groupByTextProvider: null,
                smartButtonMaxItems: 0,
                smartButtonTextConverter: angular.noop,
                styleActive: false,
                selectedToTop: false,
                keyboardControls: false,
                template: '{{getPropertyForObject(option, settings.displayProp)}}',
                searchField: '$',
                showAllSelectedText: false,
                enableDelete: false,
                alignRight: false,
                showSearchIcon: false,
                warningButtonClass: 'btn btn-default warningButton',
            };
            /**是否处于查询状态*/

            let texts = {
                checkAll: 'Check All',
                uncheckAll: 'Uncheck All',
                selectionCount: 'checked',
                selectionOf: '/',
                searchPlaceholder: 'Search...',
                buttonDefaultText: 'Select',
                dynamicButtonTextSuffix: 'checked',
                disableSearch: 'Disable search',
                enableSearch: 'Enable search',
                selectGroup: 'Select all:',
                allSelectedText: 'All',
                deleteItemText: 'Delete Item',
            };

            let input = {
                searchFilter: $scope.searchFilter || '',
            };

            angular.extend(settings, $scope.extraSettings || []);
            angular.extend(externalEvents, $scope.events || []);
            angular.extend(texts, $scope.translationTexts);

            if (settings.closeOnBlur) {
                $document.on('click', e => {
                    if ($scope.open) {
                        let target = e.target.parentElement;
                        let parentFound = false;

                        while (angular.isDefined(target) && target !== null && !parentFound) {
                            if (!!target.className.split && contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                                if (target === $dropdownTrigger) {
                                    parentFound = true;
                                }
                            }
                            target = target.parentElement;
                        }

                        if (!parentFound) {
                            $scope.$apply(() => {
                                $scope.close();
                            });
                        }
                    }
                });
            }

            angular.extend($scope, {
                toggleDropdown,
                checkboxClick,
                externalEvents,
                settings,
                texts,
                input,
                close,
                selectCurrentGroup,
                getGroupLabel,
                getButtonText,
                getPropertyForObject,
                selectAll,
                deselectAll,
                setSelectedItem,
                isChecked,
                keyDownLink,
                keyUpSearchDefault,
                keyUpSearch,
                getFilter,
                toggleSearch,
                keyDownToggleSearch,
                orderFunction,
                deleteItem,
                shakeButton,
            });

            $scope.externalEvents.onInitDone();

            function focusFirstOption() {
                setTimeout(() => {
                    let elementToFocus = angular.element($element)[0].querySelector('.option');
                    if (angular.isDefined(elementToFocus) && elementToFocus != null) {
                        elementToFocus.focus();
                    }
                }, 0);
            }

            function toggleDropdown() {
                if ($scope.open) {
                    $scope.close();
                } else {
                    $scope.open = true;
                }
                if ($scope.settings.keyboardControls) {
                    if ($scope.open) {
                        if ($scope.settings.selectionLimit === 1 && $scope.settings.enableSearch) {
                            setTimeout(() => {
                                angular.element($element)[0].querySelector('.searchField').focus();
                            }, 0);
                        } else {
                            focusFirstOption();
                        }
                    }
                }
                if ($scope.settings.enableSearch) {
                    if ($scope.open) {
                        setTimeout(() => {
                            angular.element($element)[0].querySelector('.searchField').focus();
                        }, 0);
                    }
                }
            }

            function checkboxClick($event, option) {
                $scope.setSelectedItem(option, false, true);
                $event.stopImmediatePropagation();
            }

            function close() {
                $scope.open = false;
                $scope.input.searchFilter = $scope.settings.clearSearchOnClose ? '' : $scope.input.searchFilter;
                $scope.externalEvents.onClose();
            }

            function selectCurrentGroup(currentGroup) {
                $scope.selectedModel.splice(0, $scope.selectedModel.length);
                $scope.options.forEach(item => {
                    if (item[$scope.settings.groupBy] === currentGroup) {
                        $scope.setSelectedItem(item, false, false);
                    }
                });
                $scope.externalEvents.onSelectionChanged();
            }

            function getGroupLabel(groupValue) {
                if ($scope.settings.groupByTextProvider !== null) {
                    return $scope.settings.groupByTextProvider(groupValue);
                }

                return groupValue;
            }

            function textWidth(text) {
                let $btn = $element.find('button');
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                ctx.font = $btn.css('font-size') + $btn.css('font-family');
                // http://stackoverflow.com/questions/38823353/chrome-canvas-2d-context-measuretext-giving-me-weird-results
                ctx.originalFont = $btn.css('font-size') + $btn.css('font-family');
                ctx.fillStyle = '#000000';
                return ctx.measureText(text).width;
            }

            function getButtonText() {
                if ($scope.settings.dynamicTitle && $scope.selectedModel && $scope.selectedModel.length > 0) {
                    if (angular.isFunction($scope.settings.smartButtonTextProvider)) {
                        $scope.texts.buttonText = $scope.settings.smartButtonTextProvider($scope.selectedModel);
                        return $scope.settings.smartButtonTextProvider($scope.selectedModel);
                    }

                    if ($scope.settings.smartButtonMaxItems > 0) {
                        let paddingWidth = 12 * 2;
                        let borderWidth = 1 * 2;
                        let dropdownIconWidth = 8;
                        let widthLimit = $element[0].offsetWidth - paddingWidth - borderWidth - dropdownIconWidth;

                        let itemsText = [];

                        angular.forEach($scope.options, optionItem => {
                            if ($scope.isChecked(optionItem)) {
                                let displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                                let converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                                itemsText.push(converterResponse || displayText);
                            }
                        });

                        if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                            itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                            itemsText.push('...');
                        }

                        let result = itemsText.join(', ');
                        let index = result.length - 4;
                        if ($element[0].offsetWidth === 0) {
                            $scope.texts.buttonText = result;
                            return result;
                        }
                        if (widthLimit <= textWidth('...')) {
                            $scope.texts.buttonText = '...';
                            return '...';
                        }
                        while (textWidth(result) > widthLimit) {
                            if (itemsText[itemsText.length - 1] !== '...') {
                                itemsText.push('...');
                                result = result + '...';
                                index = result.length - 4;
                            }
                            result = result.slice(0, index) + result.slice(index + 1);
                            index -= 1;
                        }
                        $scope.texts.buttonText = result;
                        return result;
                    }
                    let totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;

                    if (totalSelected === 0) {
                        $scope.texts.buttonText = $scope.texts.buttonDefaultText;
                        return $scope.texts.buttonDefaultText;
                    }

                    if ($scope.settings.showAllSelectedText && totalSelected === $scope.options.length) {
                        $scope.texts.buttonText == $scope.texts.allSelectedText;
                        return $scope.texts.allSelectedText;
                    }
                    $scope.texts.buttonText = totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                    return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                }
                $scope.texts.buttonText = $scope.texts.buttonDefaultText;
                return $scope.texts.buttonDefaultText;
            }

            function getPropertyForObject(object, property) {
                if (angular.isDefined(object) && Object.prototype.hasOwnProperty.call(object, property)) {
                    return object[property];
                }
                return undefined;
            }

            function deleteItem(option) {
                $scope.deselectAll(true);
                $scope.externalEvents.onDeleteItem(option);
            }

            function shakeButton() {
                if ($('.shakingButton')) {
                    for (let i = 0; i < $('.shakingButton').length; i++) {
                        let currentId = '';
                        if ($scope.isWarning.isWarned === true && $scope.isWarning.isSearched === true) {
                            currentId = $('.shakingButton')[i].id;
                            ShakeWarning.isWarning('#' + currentId);
                        }
                    }
                    $scope.isWarning.isSearched = false;
                }
            }

            function selectAll() {
                $scope.deselectAll(true);
                $scope.externalEvents.onSelectAll();

                let searchResult;
                if (!$scope.settings.isSearch) {
                    searchResult = $filter('filter')($scope.options, $scope.getFilter($scope.input.searchFilter));
                } else {
                    searchResult = $filter('filter')($scope.searchOptions, $scope.getFilter($scope.input.searchFilter));
                }
                angular.forEach(searchResult, value => {
                    $scope.setSelectedItem(value, true, false);
                });
                $scope.externalEvents.onSelectionChanged();
                $scope.selectedGroup = null;

            }

            function deselectAll() {
                let dontSendEvent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                if (!dontSendEvent) {
                    $scope.externalEvents.onDeselectAll();
                }

                $scope.selectedModel.splice(0, $scope.selectedModel.length);
                if (!dontSendEvent) {
                    $scope.externalEvents.onSelectionChanged();
                }
                $scope.selectedGroup = null;
            }

            function setSelectedItem(option) {
                let dontRemove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                let fireSelectionChange = arguments[2];

                let exists = void 0;
                let indexOfOption = void 0;
                if (angular.isDefined(settings.idProperty)) {
                    exists = getIndexByProperty($scope.selectedModel, option, settings.idProperty) !== -1;
                    indexOfOption = getIndexByProperty($scope.selectedModel, option, settings.idProperty);
                } else {
                    exists = $scope.selectedModel.indexOf(option) !== -1;
                    indexOfOption = $scope.selectedModel.indexOf(option);
                }

                if (!dontRemove && exists) {
                    $scope.selectedModel.splice(indexOfOption, 1);
                    $scope.externalEvents.onItemDeselect(option);
                    if ($scope.settings.closeOnDeselect) {
                        $scope.close();
                    }
                } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                    /**如果默认选项里没有选择的元素则插入*/
                    if (angular.isDefined(settings.idProperty) && (getIndexByProperty($scope.options, option, settings.idProperty) === -1)) {
                        $scope.options.push(option);
                    } else if (!angular.isDefined(settings.idProperty) && $scope.options.indexOf(option) <= -1) {
                        $scope.options.push(option);
                    }
                    $scope.selectedModel.push(option);
                    if (fireSelectionChange) {
                        $scope.externalEvents.onItemSelect(option);
                    }
                    if ($scope.settings.closeOnSelect) {
                        $scope.close();
                    }
                    if ($scope.settings.selectionLimit > 0 && $scope.selectedModel.length === $scope.settings.selectionLimit) {
                        $scope.externalEvents.onMaxSelectionReached();
                    }
                } else if ($scope.settings.selectionLimit === 1 && !exists && $scope.selectedModel.length === $scope.settings.selectionLimit) {
                    $scope.selectedModel.splice(0, 1);
                    $scope.selectedModel.push(option);
                    if (fireSelectionChange) {
                        $scope.externalEvents.onItemSelect(option);
                    }
                    if ($scope.settings.closeOnSelect) {
                        $scope.close();
                    }
                }
                if (fireSelectionChange) {
                    $scope.externalEvents.onSelectionChanged();
                }
                $scope.selectedGroup = null;
            }

            function isChecked(option) {
                if (angular.isDefined(settings.idProperty)) {
                    return getIndexByProperty($scope.selectedModel, option, settings.idProperty) !== -1;
                }
                return $scope.selectedModel.indexOf(option) !== -1;
            }

            function keyDownLink(event) {
                let sourceScope = angular.element(event.target).scope();
                let nextOption = void 0;
                let parent = event.target.parentNode;
                if (!$scope.settings.keyboardControls) {
                    return;
                }
                if (event.keyCode === 13 || event.keyCode === 32) {
                    // enter
                    event.preventDefault();
                    if (sourceScope.option) {
                        $scope.setSelectedItem(sourceScope.option, false, true);
                    } else if (event.target.id === 'deselectAll') {
                        $scope.deselectAll();
                    } else if (event.target.id === 'selectAll') {
                        $scope.selectAll();
                    }
                } else if (event.keyCode === 38) {
                    // up arrow
                    event.preventDefault();
                    if (parent.previousElementSibling) {
                        nextOption = parent.previousElementSibling.querySelector('a') || parent.previousElementSibling.querySelector('input');
                    }
                    while (!nextOption && !!parent) {
                        parent = parent.previousElementSibling;
                        if (parent) {
                            nextOption = parent.querySelector('a') || parent.querySelector('input');
                        }
                    }
                    if (nextOption) {
                        nextOption.focus();
                    }
                } else if (event.keyCode === 40) {
                    // down arrow
                    event.preventDefault();
                    if (parent.nextElementSibling) {
                        nextOption = parent.nextElementSibling.querySelector('a') || parent.nextElementSibling.querySelector('input');
                    }
                    while (!nextOption && !!parent) {
                        parent = parent.nextElementSibling;
                        if (parent) {
                            nextOption = parent.querySelector('a') || parent.querySelector('input');
                        }
                    }
                    if (nextOption) {
                        nextOption.focus();
                    }
                } else if (event.keyCode === 27) {
                    event.preventDefault();

                    $scope.toggleDropdown();
                }
            }

            function keyUpSearchDefault(event) {
                let parent = event.target.parentNode.parentNode;
                let nextOption = void 0;
                if (!$scope.settings.keyboardControls) {
                    return;
                }
                if (event.keyCode === 9 || event.keyCode === 40) {
                    // tab
                    event.preventDefault();
                    focusFirstOption();
                } else if (event.keyCode === 38) {
                    event.preventDefault();
                    if (parent.previousElementSibling) {
                        nextOption = parent.previousElementSibling.querySelector('a') || parent.previousElementSibling.querySelector('input');
                    }
                    while (!nextOption && !!parent) {
                        parent = parent.previousElementSibling;
                        if (parent) {
                            nextOption = parent.querySelector('a') || parent.querySelector('input');
                        }
                    }
                    if (nextOption) {
                        nextOption.focus();
                    }
                } else if (event.keyCode === 27) {
                    event.preventDefault();

                    $scope.toggleDropdown();
                }
            }

            function keyUpSearch(event, searchFilter) {
                let searchResult = void 0;
                if ($scope.settings.enableAsyncSearch) {
                    $scope.externalEvents.asyncSearchOptions(searchFilter);
                    if (searchFilter.length > 0) {
                        $scope.settings.isSearch = true;
                    } else {
                        $scope.settings.isSearch = false;
                    }
                }

                if (!$scope.settings.keyboardControls) {
                    return;
                }
                if (event.keyCode === 13) {
                    if ($scope.settings.selectionLimit === 1 && $scope.settings.enableSearch) {
                        searchResult = $filter('filter')($scope.options, $scope.getFilter(searchFilter));
                        if (searchResult.length === 1) {
                            $scope.setSelectedItem(searchResult[0], false, true);
                        }
                    } else if ($scope.settings.enableSearch) {
                        $scope.selectAll();
                    }
                }
            }

            function getFilter(searchFilter) {
                let filter = {};
                filter[$scope.settings.searchField] = searchFilter;
                return filter;
            }

            function toggleSearch($event) {
                if ($event) {
                    $event.stopPropagation();
                }
                $scope.settings.enableSearch = !$scope.settings.enableSearch;
                if (!$scope.settings.enableSearch) {
                    $scope.input.searchFilter = '';
                }
            }

            function keyDownToggleSearch() {
                if (!$scope.settings.keyboardControls) {
                    return;
                }
                if (event.keyCode === 13) {
                    $scope.toggleSearch();
                    if ($scope.settings.enableSearch) {
                        setTimeout(() => {
                            angular.element($element)[0].querySelector('.searchField').focus();
                        }, 0);
                    } else {
                        focusFirstOption();
                    }
                }
            }

            function orderFunction(object1, object2) {
                if (angular.isUndefined(object2)) {
                    return -1;
                }
                if (angular.isUndefined(object1)) {
                    return 1;
                }
                if (object1.type !== 'object' || object2.type !== 'object') {
                    return object1.index < object2.index ? -1 : 1;
                }
                let v1 = object1.value;
                let v2 = object2.value;
                // first order by group
                if ($scope.settings.groupBy) {
                    if (v1[$scope.settings.groupBy] !== v2[$scope.settings.groupBy]) {
                        if (v1[$scope.settings.groupBy] < v2[$scope.settings.groupBy]) {
                            return 1;
                        }
                        return -1;
                    }
                }
                if (!$scope.settings.selectedToTop) {
                    return $scope.options.indexOf(v1) < $scope.options.indexOf(v2) ? -1 : 1;
                }
                // then order selected to top
                if (!$scope.isChecked(v1) && !$scope.isChecked(v2) || $scope.isChecked(v1) && $scope.isChecked(v2)) {
                    return $scope.options.indexOf(v1) < $scope.options.indexOf(v2) ? -1 : 1;
                }
                if ($scope.isChecked(v1)) {
                    return -1;
                }
                return 1;
            }
        }
    },
]);

angular.module('angularjs-dropdown-multiselect').run(['$templateCache', function ($templateCache) {
    $templateCache.put('app/component/angularjs-dropdown-multiselect.html',
        `<div class="multiselet multiselect-parent btn-group dropdown-multiselect"
     ng-class="{open: open}">
    <div ng-transclude="toggleDropdown" ng-click="toggleDropdown()">
      <button
              ng-if="!isWarning.isWarned"
              ng-disabled="disabled"
              type="button"
              class="dropdown-toggle"
              ng-class="settings.buttonClasses"
              style="overflow:hidden"
              >
              <input style="width:90%; background-color:rgba(0,0,0,0);text-align:center;" ng-model="texts.buttonText">{{}}
      </button>
      <button id="{{$id}}"
              ng-if="isWarning.isWarned"
              ng-disabled="disabled"
              type="button"
              class="dropdown-toggle shakingButton"
              ng-class="settings.buttonClasses"
              style="overflow:hidden;border: 2px solid red;"
              >
              <input style="width:90%; background-color:rgba(0,0,0,0);text-align:center;" ng-model="texts.buttonText">{{}}
              <span ng-show="false">{{shakeButton()}}</span>
      </button>
      <span ng-show="false">{{getButtonText()}}</span>
    </div>
  <ul class="dropdown-menu dropdown-menu-form" 
      ng-class="{'pull-right' : settings.alignRight}"
      ng-if="open"
      style="max-width:450px"
      ng-style="{display: open ? 'block' : 'none', height : settings.scrollable ? settings.scrollableHeight : 'auto', overflow: 'auto' }">
    <li ng-if="settings.showCheckAll && settings.selectionLimit === 0">
      <a ng-keyup="keyDownLink($event)"
         data-ng-click="selectAll()"
         tabindex="-1"
         id="selectAll">
        <span class="fa fa-check"></span>
        {{texts.checkAll}}
      </a>
    <li ng-if="settings.showUncheckAll">
      <a ng-keyup="keyDownLink($event)"
         data-ng-click="deselectAll();"
         tabindex="-1"
         id="deselectAll">
        <span class="fa fa-times"></span>
        {{texts.uncheckAll}}
      </a>
    </li>
    <li ng-if="settings.selectByGroups && ((settings.showCheckAll && settings.selectionLimit > 0) || settings.showUncheckAll)"
        class="divider">
    </li>
    <li ng-repeat="currentGroup in settings.selectByGroups track by $index"
        ng-click="selectCurrentGroup(currentGroup)">
      <a ng-class="{'dropdown-selected-group': selectedGroup === currentGroup}"
         tabindex="-1">
        {{::texts.selectGroup}} {{::getGroupLabel(currentGroup)}}
      </a>
    </li>
    <li ng-if="settings.selectByGroups && settings.showEnableSearchButton"
        class="divider">
    </li>
    <li ng-if="settings.showEnableSearchButton && settings.enableSearch">
      <a ng-keyup="keyDownLink($event); keyDownToggleSearch();"
         ng-click="toggleSearch($event);"
         tabindex="-1">
        {{texts.disableSearch}}
      </a>
    </li>
    <li ng-if="settings.showEnableSearchButton && !settings.enableSearch">
      <a ng-keyup="keyDownLink($event); keyDownToggleSearch();"
         ng-click="toggleSearch($event);"
         tabindex="-1">
        {{texts.enableSearch}}
      </a>
    </li>
    <li ng-if="(settings.showCheckAll && settings.selectionLimit > 0) || settings.showUncheckAll || settings.showEnableSearchButton"
        class="divider">
    </li>
    <li ng-if="settings.enableSearch">
      <div class="dropdown-header">
        <input type="text"
               class="form-control searchField"
               ng-keyup="keyUpSearchDefault($event); keyUpSearch($event, input.searchFilter);"
               ng-style="{width: '100%'}"
               ng-model="input.searchFilter"
               placeholder="{{texts.searchPlaceholder}}" />
      </div>
    </li>
    <li ng-if="settings.enableSearch"
        class="divider">
    </li>
    <li ng-if="settings.groupBy"
        ng-repeat-start="option in orderedItems = ( options | filter:getFilter(input.searchFilter) | orderBy:'':false:orderFunction)"
        ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)"
        role="presentation"
        class="dropdown-header">
      {{ getGroupLabel(getPropertyForObject(option, settings.groupBy)) }}
    </li>
    <li ng-if="settings.groupBy"
        ng-class="{'active': isChecked(option) && settings.styleActive}"
        ng-repeat-end
        role="presentation">
      <a ng-keyup="option.disabled || keyDownLink($event)"
         role="menuitem"
         class="option"
         tabindex="-1"
         ng-click="option.disabled || setSelectedItem(option, false, true)"
         ng-disabled="option.disabled">
        <div ng-if="settings.checkBoxes"
             class="checkbox">
          <label>
            <input class="checkboxInput"
                   type="checkbox"
                   ng-click="checkboxClick($event, option)"
                   ng-checked="isChecked(option)" />
            <span dm-dropdown-static-include="{{settings.template}}"></span>
          </label>
        </div>
        <span ng-if="!settings.checkBoxes"
              data-ng-class="{'fa fa-check': isChecked(option)}">
        </span>
        <span dm-dropdown-static-include="{{settings.template}}"></span>
      </a>
    </li>
    <li ng-if="!settings.groupBy &&!settings.enableAsyncSearch&&!settings.isSearch"
        ng-class="{'active': isChecked(option) && settings.styleActive}"
        role="presentation"
        ng-repeat="option in options | filter:getFilter(input.searchFilter) | orderBy:'':false:orderFunction">
      <a ng-keyup="option.disabled || keyDownLink($event)"
         role="menuitem"
         class="option"
         tabindex="-1"
         ng-click="option.disabled || setSelectedItem(option, false, true)"
         ng-disabled="option.disabled"
         >
        <div ng-if="settings.checkBoxes"
             class="checkbox">
          <label>
            <input class="checkboxInput"
                   type="checkbox"
                   ng-click="checkboxClick($event, option)"
                   ng-checked="isChecked(option)" />
            <span dm-dropdown-static-include="{{settings.template}}"></span>
          </label>
        </div>
        <span ng-if="!settings.checkBoxes"
              data-ng-class="{'fa fa-check': isChecked(option)}">
        </span>
        <span ng-if="!settings.checkBoxes"
              dm-dropdown-static-include="{{settings.template}}"
              >
        </span>
        <button ng-if="settings.enableDelete"  ng-click="deleteItem(option)" class="deleteButton"></button>
      
      </a>
    </li>
    <li ng-if="!settings.groupBy && settings.enableAsyncSearch && settings.isSearch"
        ng-class="{'active': isChecked(option) && settings.styleActive}"
        role="presentation"
        ng-repeat="option in searchOptions | filter:getFilter(input.searchFilter) | orderBy:'':false:orderFunction">
      
      <a ng-keyup="option.disabled || keyDownLink($event)"
         role="menuitem"
         class="option"
         tabindex="-1"
         ng-click="option.disabled || setSelectedItem(option, false, true)"
         ng-disabled="option.disabled">
        <div ng-if="settings.checkBoxes"
             class="checkbox">
          <label>
            <input class="checkboxInput"
                   type="checkbox"
                   ng-click="checkboxClick($event, option)"
                   ng-checked="isChecked(option)" />
            <span dm-dropdown-static-include="{{settings.template}}"></span>
          </label>
        </div>
        <span ng-if="!settings.checkBoxes"
              data-ng-class="{'fa fa-check': isChecked(option)}">
        </span>
        <span ng-if="!settings.checkBoxes"
              dm-dropdown-static-include="{{settings.template}}"></span>
      </a>
      
    </li>
    <li ng-if="!settings.groupBy && settings.enableAsyncSearch && !settings.isSearch"
        ng-class="{'active': isChecked(option) && settings.styleActive}"
        role="presentation"
        ng-repeat="option in options | filter:getFilter(input.searchFilter) | orderBy:'':false:orderFunction">
      <span>{{}}</span>
      <a ng-keyup="option.disabled || keyDownLink($event)"
         role="menuitem"
         class="option"
         tabindex="-1"
         ng-click="option.disabled || setSelectedItem(option, false, true)"
         ng-disabled="option.disabled">
        <div ng-if="settings.checkBoxes"
             class="checkbox">
          <label>
            <input class="checkboxInput"
                   type="checkbox"
                   ng-click="checkboxClick($event, option)"
                   ng-checked="isChecked(option)" />
            <span dm-dropdown-static-include="{{settings.template}}"></span>
          </label>
        </div>
        <span ng-if="!settings.checkBoxes"
              data-ng-class="{'fa fa-check': isChecked(option)}">
        </span>
        <span ng-if="!settings.checkBoxes"
              dm-dropdown-static-include="{{settings.template}}"></span>
      </a>
    </li>
    <li class="divider"
        ng-show="settings.selectionLimit > 1">
    </li>
    <li role="presentation"
        ng-show="settings.selectionLimit > 1">
      <a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a>
    </li>
  </ul>
</div>`);
}]);
