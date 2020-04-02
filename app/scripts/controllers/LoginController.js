'use strict';
import jwt from 'jwt-simple';

/**
 * Login Controller
 *
 * @ngInject
 * @constructor
 * @export
 * @param $scope
 * @param $state
 * @param $timeout
 * @param HttpRequestService
 */
export default function LoginController($scope, $state, $timeout, HttpRequestService,$rootScope) {
    /* eslint-disable */
    let env = CONFIG;
    /* eslint-enable */

    /** gempile 调用 garnet 接口 URL */
    let garnetPath = 'http://192.168.6.97:8080/garnet/';

    switch (env) {
        case 'prodDG':
            garnetPath = '/garnet/';
            break;
        case 'prodDGDEV':
            garnetPath = '/garnet/';
            break;
        default:
            break;
    }

    /** 是否显示错误信息 */
    $scope.error = false;

    /** 获取当前时间 */
    let nowTime = $.now();

    /** 默认加载验证码 */
    $scope.src = garnetPath + 'kaptcha?nowTime=' + nowTime;

    /** 登录图片 */
    $scope.isLogging = false;

    /** 登录接口 */
    $scope.gar_login = () => {
        if (checkUserInfo()) {
            $scope.isLogging = true;
            HttpRequestService.post(garnetPath + 'sys/login?loginFrom=gempile', {}, {
                // captcha: $scope.captcha,
                nowTime: nowTime,
                username: $scope.username,
                password: $scope.password,
            }, response => {
                if (response.code === 0) {//登录成功
                    localStorage.setItem('garnetToken', response.garnetToken);
                    localStorage.setItem('gempileToken', response.gempileToken);
                    $scope.isLogging = false;
                    $state.go('home');
                    setUserInfo(response.gempileToken);
                } else {
                    $scope.error = true;
                    $scope.errorMsg = response.msg;
                    $scope.isLogging = false;
                }
            });
        }
    };

    /** 刷新验证码 */
    $scope.refreshCode = () => {
        nowTime = $.now();
        $scope.src = garnetPath + 'kaptcha?nowTime=' + nowTime;
    };

    /** 校验用户信息  */
    const checkUserInfo = () => {
        if (!$scope.username) {
            $scope.error = true;
            $scope.errorMsg = '用户名不能为空';
            return false;
        }
        if (!$scope.password) {
            $scope.error = true;
            $scope.errorMsg = '密码不能为空';
            return false;
        }
        // if (!$scope.captcha) {
        //     $scope.error = true;
        //     $scope.errorMsg = '验证码不能为空';
        //     return false;
        // }
        return true;
    };

    /** 获取当前用户信息 */
    const setUserInfo = gempileToken => {
        if(gempileToken){
            $rootScope.userName = jwt.decode(gempileToken, 'secret').usr;
        }
    };
}
LoginController.$inject = ['$scope', '$state', '$timeout', 'HttpRequestService','$rootScope'];