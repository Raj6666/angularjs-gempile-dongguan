const template = require('../../views/common/Laydate.html');
import ShakeWarning from '../custom-pulgin/ShakeWarning';
import {FIVE_MIN_MS, NOW, ONE_DAY_MS, ONE_HOUR_MS, ONE_MIN_MS} from '../constants/CommonConst';

const LaydateController = function ($scope, $element, $attrs, $filter) {
    let ctrl = this;
    let currentInterval = this.interval;
    const convertDate = date => {
        let newDate = new Date(date.year, date.month - 1, date.date, date.hours, date.minutes, 0);
        return newDate.getTime();
    };
    const getRangeTime = () => {
        let result = {
            timestamp: 0,
            formatTime: '',
        };
        switch (this.interval) {
            case '1':
                result.timestamp = this.intervalSettings['1'] * ONE_MIN_MS;
                break;
            case '5':
                result.timestamp = this.intervalSettings['5'] * FIVE_MIN_MS;
                break;
            case '60':
                result.timestamp = this.intervalSettings['60'] * ONE_HOUR_MS;
                break;
            case 'autoAlert':
                result.timestamp = this.intervalSettings['60'] * ONE_HOUR_MS;
                break;
            case '1440':
                result.timestamp = this.intervalSettings['1440'] * ONE_DAY_MS;
                break;
            default:
                result.timestamp = 3 * ONE_DAY_MS;
        }
        let day = Math.floor(result.timestamp / ONE_DAY_MS);
        let hour = Math.floor((result.timestamp % ONE_DAY_MS) / ONE_HOUR_MS);
        let minute = Math.floor((result.timestamp % ONE_HOUR_MS) / ONE_HOUR_MS);
        if (day > 0) {
            result.formatTime += day + '天';
        }
        if (hour > 0) {
            result.formatTime += hour + '小时';
        }
        if (minute > 0) {
            result.formatTime += minute + '分钟';
        }
        return result;

    };
    /**去除时间的分钟和秒*/
    const formatDate = (date, isclearHour) => {
        let newDate = new Date(date);
        if (isclearHour) {
            newDate.setHours(0);
        }
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        return newDate.getTime();
    };
    let laydateInstance = laydate.render({
        elem: '#layDate',
        type: 'datetime',
        range: '到',
        format: 'yyyy-M-d HH:mm',
        theme: '#20BBFE',
        change: (value, date, endDate) => {
            ctrl.getLaydate = ({isWarning: ctrl.isWarning});
            if ((convertDate(endDate) - convertDate(date)) > getRangeTime().timestamp) {
                laydateInstance.hint('您当前选择的时间范围过大,最大范围为' + getRangeTime().formatTime);
            }
            // else{
            //     laydateInstance.hint('请点击确认设置选择的时间');
            // }
        },
        done: (value, date, endDate) => {
            let startDate = convertDate(date);
            let endTmpDate = convertDate(endDate);
            this.timeSlots = {
                startDate: startDate,
                endDate: endTmpDate,
                str: startDate + ',' + endTmpDate,
                value: value ? value : '',
            };
            if (this.timeSlots.str.length <= 8) {
                this.isWarning = 'empty';
            } else if ((ctrl.timeSlots.endDate - ctrl.timeSlots.startDate) > getRangeTime().timestamp) {
                this.isWarning = 'long';
            } else {
                this.isWarning = 'unknow';
            }
            this.capsule({
                timeSlots: this.timeSlots,
                isWarning: this.isWarning,
            });
        },
    });
    ctrl.$onInit = () => {
        if (this.interval != 'autoAlert') {
            /**非主动告警模块默认时间*/
            $('#layDate').val($filter('date')(formatDate(NOW - (3 * ONE_HOUR_MS)), 'yyyy-M-d HH:00') + ' 到 ' + $filter('date')(formatDate(NOW - (2 * ONE_HOUR_MS)), 'yyyy-M-d HH:00'));
            this.timeSlots = {
                startDate: formatDate(NOW - (3 * ONE_HOUR_MS)),
                endDate: formatDate(NOW - (2 * ONE_HOUR_MS)),
                str: formatDate(NOW - (3 * ONE_HOUR_MS)) + ',' + formatDate(NOW - (2 * ONE_HOUR_MS)),
                value: $filter('date')(formatDate(NOW - (3 * ONE_HOUR_MS)), 'yyyy-M-d HH:00') + ' 到 ' + $filter('date')(formatDate(NOW - (2 * ONE_HOUR_MS)), 'yyyy-M-d HH:00'),
            };
            this.interval = '60';
        } else {
            /**主动告警模块默认时间*/
            $('#layDate').val($filter('date')(NOW - ONE_DAY_MS, 'yyyy-M-d HH:mm') + ' 到 ' + $filter('date')(NOW, 'yyyy-M-d HH:mm'));
            this.timeSlots = {
                startDate: NOW - ONE_DAY_MS,
                endDate: NOW,
                str: (NOW - ONE_DAY_MS) + ',' + (NOW),
                value: $filter('date')(NOW - ONE_DAY_MS, 'yyyy-M-d HH:mm') + ' 到 ' + $filter('date')(NOW, 'yyyy-M-d HH:mm'),
            };
        }
        this.intervalSettings = {
            '1': 576,
            '5': 576,
            '60': 168,
            '1440': 30,
        };
        this.isWarning = 'unknow';
        this.capsule({
            timeSlots: this.timeSlots,
            isWarning: this.isWarning,
        });
    };
    ctrl.$doCheck = () => {
        if (this.isWarning === 'yes') {
            ShakeWarning.isWarning('#layDate');
        } else if (ctrl.isWarning === 'no') {
            ShakeWarning.hideWarning('#layDate');
        }
        if (this.timeSlots.str.length <= 8) {
            this.isWarning = 'empty';
        } else if ((this.timeSlots.endDate - this.timeSlots.startDate) > getRangeTime().timestamp) {
            this.isWarning = 'long';
        } else {
            this.isWarning = 'unknow';
        }
        this.capsule({
            timeSlots: this.timeSlots,
            isWarning: this.isWarning,
        });
    };
    ctrl.$onChanges = changesObj => {
        if (changesObj['timeSlots'] && changesObj['timeSlots']['currentValue']) {
            $('#layDate').val(changesObj['timeSlots'].currentValue.value);
            currentInterval = this.interval;
        }
        if (currentInterval != this.interval) {
            let currentDate = new Date();
            switch (this.interval) {
                case '1':
                    $('#layDate').val($filter('date')(currentDate - (3 * ONE_HOUR_MS), 'yyyy-M-d HH:mm') + ' 到 ' + $filter('date')(currentDate - (2 * ONE_HOUR_MS), 'yyyy-M-d HH:mm'));
                    this.timeSlots = {
                        startDate: currentDate - (3 * ONE_HOUR_MS),
                        endDate: currentDate - (2 * ONE_HOUR_MS),
                        str: (currentDate - (3 * ONE_HOUR_MS)) + ',' + (currentDate - (2 * ONE_HOUR_MS)),
                        value: $filter('date')(currentDate - (3 * ONE_HOUR_MS), 'yyyy-M-d HH:mm') + ' 到 ' + $filter('date')(currentDate - (2 * ONE_HOUR_MS), 'yyyy-M-d HH:mm'),
                    };
                    this.isWarning = 'unknow';
                    break;
                case '5':
                    $('#layDate').val($filter('date')(currentDate - (3 * ONE_HOUR_MS), 'yyyy-M-d HH:mm') + ' 到 ' + $filter('date')(currentDate - (2 * ONE_HOUR_MS), 'yyyy-M-d HH:mm'));
                    this.timeSlots = {
                        startDate: currentDate - (3 * ONE_HOUR_MS),
                        endDate: currentDate - (2 * ONE_HOUR_MS),
                        str: (currentDate - (3 * ONE_HOUR_MS)) + ',' + (currentDate - (2 * ONE_HOUR_MS)),
                        value: $filter('date')(currentDate - (3 * ONE_HOUR_MS), 'yyyy-M-d HH:mm') + ' 到 ' + $filter('date')(currentDate - (2 * ONE_HOUR_MS), 'yyyy-M-d HH:mm'),
                    };
                    this.isWarning = 'unknow';
                    break;
                case '60':
                    $('#layDate').val($filter('date')(formatDate(currentDate - (3 * ONE_HOUR_MS)), 'yyyy-M-d HH:00') + ' 到 ' + $filter('date')(formatDate(currentDate - (2 * ONE_HOUR_MS)), 'yyyy-M-d HH:00'));
                    this.timeSlots = {
                        startDate: formatDate(currentDate - (3 * ONE_HOUR_MS)),
                        endDate: formatDate(currentDate - (2 * ONE_HOUR_MS)),
                        str: formatDate(currentDate - (3 * ONE_HOUR_MS)) + ',' + formatDate(currentDate - (2 * ONE_HOUR_MS)),
                        value: $filter('date')(formatDate(currentDate - (3 * ONE_HOUR_MS)), 'yyyy-M-d HH:00') + ' 到 ' + $filter('date')(formatDate(currentDate - (2 * ONE_HOUR_MS)), 'yyyy-M-d HH:00'),
                    };
                    this.isWarning = 'unknow';
                    break;
                case '1440':
                    $('#layDate').val($filter('date')(formatDate(currentDate - (2 * ONE_DAY_MS), true), 'yyyy-M-d 00:00') + ' 到 ' + $filter('date')(formatDate(currentDate - ONE_DAY_MS, true), 'yyyy-M-d 00:00'));
                    this.timeSlots = {
                        startDate: formatDate(currentDate - (2 * ONE_DAY_MS), true),
                        endDate: formatDate(currentDate - ONE_DAY_MS, true),
                        str: formatDate(currentDate - (2 * ONE_DAY_MS), true) + ',' + formatDate(currentDate - ONE_DAY_MS, true),
                        value: $filter('date')(formatDate(currentDate - (2 * ONE_DAY_MS), true), 'yyyy-M-d 00:00') + ' 到 ' + $filter('date')(formatDate(currentDate - ONE_DAY_MS, true), 'yyyy-M-d 00:00'),
                    };
                    this.isWarning = 'unknow';
                    break;
                default:
                    $('#layDate').val($filter('date')(formatDate(currentDate - (3 * ONE_HOUR_MS)), 'yyyy-M-d HH:00') + ' 到 ' + $filter('date')(formatDate(currentDate - (2 * ONE_HOUR_MS)), 'yyyy-M-d HH:00'));
                    this.timeSlots = {
                        startDate: formatDate(currentDate - (3 * ONE_HOUR_MS)),
                        endDate: formatDate(currentDate - (2 * ONE_HOUR_MS)),
                        str: formatDate(currentDate - (3 * ONE_HOUR_MS)) + ',' + formatDate(currentDate - (2 * ONE_HOUR_MS)),
                        value: $filter('date')(formatDate(currentDate - (3 * ONE_HOUR_MS)), 'yyyy-M-d HH:00') + ' 到 ' + $filter('date')(formatDate(currentDate - (2 * ONE_HOUR_MS)), 'yyyy-M-d HH:00'),
                    };
                    this.isWarning = 'unknow';
                    break;
            }
            currentInterval = this.interval;
        }
    }
};

module.exports = {
    template,
    controller: LaydateController,
    bindings: {
        capsule: '&',
        timeSlots: '<',
        interval: '<',
        intervalSettings: '<',
        isWarning: '<',
    },
};