/** Common */
import angular from 'angular';
import swal from 'sweetalert2';
import StateConfig from './configs/StateConfig';
import auth from './service/Authentification';
/** Controllers */
import LoginController from './controllers/LoginController';
import HomePageController from './controllers/HomePageController';
import MultiDimIndicatorAnalysisController from './controllers/MultiDimIndicatorAnalysisController';
import DataDirectCityAnalysisController from './controllers/DataDirectCityAnalysisController';
import DataDirectProvinceAnalysisController from './controllers/DataDirectProvinceAnalysisController';
import DataDirectOutletAnalysisController from './controllers/DataDirectOutletAnalysisController';
import DialingAnalysisController from './controllers/DialingAnalysisController';
import DialingErrorAnalysisController from './controllers/DialingErrorAnalysisController';
import UserKeyIndicatorAnalysisController from './controllers/UserKeyIndicatorAnalysisController';
import AutoAlertController from './controllers/AutoAlertController';
import FlowMonitoringController from './controllers/FlowMonitoringController';
/** Services */
import AngularAjaxService from './service/common/AngularAjaxService';
import {HttpInterceptor} from './service/HttpInterceptor';
/** Styles */
import '../styles/App.scss';
import './custom-pulgin/angularjs-dropdown-multiselect';
/**filter*/
import InputRegexFilter from './filter/InputRegexFilter';

/**
 * Module Gemstack Web App
 *
 * @name gemstackWebApp
 * @description #Web of Gemstack
 * Main module of the application.
 */
let app = angular.module('gemstackWebApp', [
    require('angular-ui-router'),
    require('angular-ui-grid'),
    'ui.grid.exporter',
    'ui.bootstrap',
    'ui.grid.resizeColumns',
    'ui.grid.pinning',
    'ui.grid.pagination',
    'ui.grid.edit',
    'ui.grid.autoResize',
    'angularjs-dropdown-multiselect',
    require('ng-infinite-scroll'),
    require('angular-ui-bootstrap'),
]);

app.config(($stateProvider, $urlRouterProvider, $compileProvider, $controllerProvider, $httpProvider) => {
    $urlRouterProvider.otherwise('/home/multiDimIndicators');
    app.registerCtrl = $controllerProvider.register;
    // set ui router
    StateConfig.states.map(state => {
        $stateProvider.state(state.stateRef, state.stateObj)
    });
    $httpProvider.interceptors.push(HttpInterceptor);
}).run(['$rootScope', '$location', 'i18nService', '$state', ($rootScope, $location, i18nService, $state) => {
    i18nService.setCurrentLang('zh-cn');
    if (!auth.loggedIn()) {
        $state.go('login');
    }
    $rootScope.$on('$locationChangeStart', () => {
        if (!auth.loggedIn()) {
            $state.go('login');
        }
    });
    $rootScope.$on('$stateChangeStart', (event, toState) => {
        let targetPath = toState.url;
        if (auth.loggedIn()) {
            if (targetPath.includes('/') && (targetPath == '/home' || targetPath == '/login')) {
                event.preventDefault();
                $state.go('multiDimIndicators');
            }
            if (!auth.doAuthentication(toState.name)) {
                swal('', '用户没有访问该模块的权限！', 'warning');
                event.preventDefault();
            }
        } else if (targetPath != '/login') {
            $state.go('login');
        }
    });
}])
    .service('HttpRequestService', AngularAjaxService)
    .controller('LoginController', LoginController)
    .controller('HomePageController', HomePageController)
    .controller('MultiDimIndicatorAnalysisController', MultiDimIndicatorAnalysisController)
    .controller('DataDirectCityAnalysisController', DataDirectCityAnalysisController)
    .controller('DataDirectProvinceAnalysisController', DataDirectProvinceAnalysisController)
    .controller('DataDirectOutletAnalysisController', DataDirectOutletAnalysisController)
    .controller('DialingAnalysisController', DialingAnalysisController)
    .controller('DialingErrorAnalysisController', DialingErrorAnalysisController)
    .controller('UserKeyIndicatorAnalysisController', UserKeyIndicatorAnalysisController)
    .controller('AutoAlertController', AutoAlertController)
    .controller('FlowMonitoringController', FlowMonitoringController)
    .component('topNav', require('./components/TopNav'))
    .component('laydate', require('./components/Laydate'))
    .filter('inputIsIllegal', InputRegexFilter);
module.exports = {
    app,
};