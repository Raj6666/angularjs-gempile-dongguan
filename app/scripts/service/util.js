export default {
    isString: function(value) {
        return !!value && Object.prototype.toString.call(value) === '[object String]';
    },
    formatTime: function(val, format) {
        var time = new Date(val);

        var weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        var o = {
            "M+": time.getMonth() + 1, //月份
            "d+": time.getDate(), //日
            "H+": time.getHours(), //小时
            "m+": time.getMinutes(), //分
            "s+": time.getSeconds(), //秒
            "q+": Math.floor((time.getMonth() + 3) / 3), //季度
            "S": time.getMilliseconds(), //毫秒
            "w": weekDay[time.getDay()]
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1,
                    (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return format;
    },
    cloneObj: function (obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        }catch (e) {
            throw new Error('param is not a object');
        }
    },
    getStyles: function (el, key) {
        var styles = document.defaultView.getComputedStyle(el, null),
            value = styles.getPropertyValue(key) || styles[key];
        return parseInt(value) || value;
    },
    cutString: function(str, start, end, rep) {
        if (this.isString(str)) {
            var subStr = str.substring(start, end);
            return subStr + rep;
        } else {
            return '';
        }
    }
};