import swal from 'sweetalert2';
import jwt from 'jwt-simple';
import auth from '../service/Authentification'
import HttpRequestService from '../service/common/AngularAjaxService';

let template = require('../../views/common/TopNav.html');
let garnetUrl = 'http://192.168.6.97:8080/garnet/';

/* eslint-disable no-undef */
const env = CONFIG;
/* eslint-enable no-undef */

if (env == 'prodDG' || env == 'prodDGDEV') {
    template = require('../../views/common/TopNav.html');
    garnetUrl = '/garnet/';
}

let timerSet = {
    main_menu: null,
    virtual_dtcqt_nav: null,
    software_analysis_nav: null,
};

/** 用户ID */
let userId = '';

/** 是否管理员 */
let isAdmin = '';

/**
 * Top Nav Component
 *
 * @export
 * @class TopNavController
 */
class TopNavController {
    /**
     * Creates an instance of TopNavController.
     *
     * @param $state
     * @param $scope
     * @param $rootScope
     * @memberOf TopNavController
     */
    constructor($state, $scope, $rootScope) {
        this.$state = $state;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
    }

    /** initialize */
    $onInit() {
        this.$scope.userName = this.$rootScope.userName;
        this.setUser();
    }

    /**显示用户名*/
    setUser() {
        if (!this.$scope.userName) {
            let userInfo = localStorage.getItem('gempileToken');
            if (userInfo) {
                this.$scope.userName = jwt.decode(userInfo, 'secret').una;
            }
        }
    }

    /**
     * 菜单下拉/上拉
     *
     * @param {String} selector
     * @param {String} type
     * @param {number} [speed=200]
     *
     * @memberOf TopNavController
     */
    menuToggle(selector, type, speed = 200) {
        let target = $(document.querySelector(selector));
        if (type == 'in') {
            window.clearTimeout(timerSet[selector]);
            timerSet[selector] = setTimeout(() => {
                target.slideDown(speed);
            }, 300)
        } else {
            window.clearTimeout(timerSet[selector]);
            timerSet[selector] = setTimeout(() => {
                target.slideUp(speed);
            }, 200)
        }
    }

    /**
     * 退出登录
     */
    logout() {
        let state = this.$state;
        auth.logout(() => {
            state.go('login');
        });
    }

    /** 根据用户权限跳转 */
    goGarnet() {
        /** 获取当前用户的角色组 */
        let userInfo = localStorage.getItem('gempileToken');

        if (userInfo) {
            userId = jwt.decode(userInfo, 'secret').uid;
            isAdmin = jwt.decode(userInfo, 'secret').uad;
        }

        if (isAdmin == 1) {
            window.open(garnetUrl + 'index.html');
        } else {
            swal({
                title: '确定要修改密码吗？',
                text: '您没有管理员权限，只能修改密码!',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(() => {
                swal({
                    title: '修改密码',
                    html:
                    '<input type="password" id="oldPassword" class="swal2-input " placeholder="请输入原密码">' +
                    '<input type="password" id="newPassword" class="swal2-input" placeholder="请输入新密码">' +
                    '<input type="password" id="confirmPassword" class="swal2-input" placeholder="请确认密码">',
                    preConfirm() {
                        return new Promise(resolve => {
                            resolve([
                                $('#oldPassword').val(),
                                $('#newPassword').val(),
                                $('#confirmPassword').val(),
                            ])
                        })
                    },
                    onOpen() {
                        $('#oldPassword').focus()
                    },
                }).then(result => {
                    let oldPassword = result[0];
                    let newPassword = result[1];
                    let confirmPassword = result[2];
                    if (!(oldPassword && newPassword && confirmPassword)) {
                        swal('更改密码失败', '每项均不为空！', 'error');
                        return;
                    }
                    if (newPassword !== confirmPassword) {
                        swal('更改密码失败', '两次输入的密码不一致！', 'error');
                        return;
                    }
                    this.changePassword(oldPassword, newPassword);
                }).catch(swal.noop)
            })
        }
    }

    /** 更改密码 */
    changePassword(oldPassword, newPassword) {
        HttpRequestService.post(garnetUrl + 'v1.0/password', {
            userId,
            password: oldPassword,
            newPassword,
        }, null, () => swal('更改密码成功', '', 'success'), () => swal('更改密码失败', '原密码不正确！', 'error'));
    }
}

module.exports = {
    template,
    controller: TopNavController,
};