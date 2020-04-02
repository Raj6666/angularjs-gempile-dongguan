import jwt from 'jwt-simple';
import StateConfig from '../configs/StateConfig';

module.exports = {

    /**
     * logged in
     *
     * @returns
     */
    loggedIn() {
        let token = localStorage.getItem('gempileToken');
        if (token) {
            try {
                jwt.decode(token, 'secret');
                return true;
            } catch (error) {
                return false;
            }
        }
        return false;
    },

    /**
     * log out
     *
     * @param {Function} cb
     */
    logout(cb) {
        localStorage.removeItem('gempileToken');
        localStorage.removeItem('garnetToken');
        if (cb) {
            cb();
        }
    },

    /**
     * get Allow Modules
     *
     * @param roleIds
     */
    getAllowModules(roleIds) {
        let roleIdArray = roleIds.split(',');
        let ownModules = ['home', 'login', 'homePage', 'multiDimIndicators', 'dataDirectCityAnalysis', 'dataDirectProvinceAnalysis', 'dataDirectOutletAnalysis', 'dialingAnalysis', 'dialingErrorAnalysis', 'userKeyIndicatorAnalysis', 'autoAlert', 'flowMonitoring'];
        for (let i = 0; i < roleIdArray.length; i++) {
            // TODO: set different modules for different roles here.
        }
        return ownModules;
    },

    /**
     * check authentication
     *
     * @param stateRef
     */
    doAuthentication(stateRef) {
        /** 判断当前环境下是否为可访问模块 */
        let fullStates = StateConfig.stateRefConfigs;
        if (!fullStates.includes(stateRef)) {
            console.warn(stateRef + '：此环境下该模块不可访问！');
            return false;
        }

        /** 获取当前用户的角色组 */
        let token = localStorage.getItem('gempileToken');
        let role;
        if (!token) {
            return false;
        }
        try {
            role = jwt.decode(token, 'secret').rol;
        } catch (error) {
            return false;
        }

        /** 判断是否为当前角色可访问的模块 */
        const stateRefGroup = this.getAllowModules(role);
        if (!stateRefGroup.includes(stateRef)) {
            console.warn(stateRef + '：用户没有访问该模块的权限！');
            return false;
        }
        return true;
    },

};