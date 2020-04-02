import swal from 'sweetalert2';

/**
 * 整数正则匹配
 * 特殊符号正则匹配
 * 特殊字符正则匹配（不包含英文逗号）
 * 中文正则匹配
 * 除 @ .以外的特殊符号正则匹配
 */
export default function inputIsIllegal(){
    return function(text,rule){
        //整数匹配
        let integerReg = /^-?\d+$/;

        // 只能使用中文、英文、数字、下划线或者连接符,不能以符号开头
        let specialReg = /^(?!_)(?!-)[a-zA-Z0-9\u4e00-\u9fa5_-]+$/;

        // 不包含英文逗号、空格和中划线的特殊字符
        // let specialRegExceptComma = /^(?!_)(?!.*?_$)[a-zA-Z0-9\u4e00-\u9fa5_-]+$/;

        //中文匹配
        let containsCh = /[\u4e00-\u9fa5]/;

        //判断除 @ .以外的特殊符号
        let speSymbol = /[，,\s_'’‘\"”“|\\~#$%^&*!！。;；\/<>《》：:\?？`·……+=_——]/;
        let result;
        switch(rule) {
            case 'integer':
                result = integerReg.test(text);
                break;
            case 'templateName':
                result = specialReg.test(text);
                break;
            case 'chinese':
                result = containsCh.test(text);
                if(result){
                    swal({
                        text: '账号不能为非法字符',
                        type: 'warning',
                        allowOutsideClick: true,
                    });
                }
                break;
            case 'account':
                result = speSymbol.test(text);
                if(result){
                    swal({
                        text: '账号不能为特殊字符',
                        type: 'warning',
                        allowOutsideClick: true,
                    });
                }
                break;
            default:
                result = false;
        }
        return result;
    };
}