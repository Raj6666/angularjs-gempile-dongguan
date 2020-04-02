let cutVal = function (val) {
    val = val+'';
    if(val.length >= 1) {
        return val.substr(0, 1)+'..';
    }
    return val;
};

export function formatYText(params) {
    if(params >= 100000000){
        return cutVal(~~(params/100000000)) + '亿';
    } else if(params >= 10000000){
        return ~~(params/10000000) + '千万';
    }else if(params >= 1000000){
        return ~~(params/1000000) + '百万';
    }else if(params >= 100000){
        return ~~(params/100000) + '十万';
    }else if(params >= 10000){
        return ~~(params/10000) + '万';
    }else if(params >= 1000){
        return ~~(params/1000) + '千';
    }
    return params;
}
