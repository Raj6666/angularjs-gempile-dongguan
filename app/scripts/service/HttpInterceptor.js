HttpInterceptor.$inject = ["$rootScope", "$q"];
export function HttpInterceptor($rootScope, $q) {
    return {
        request: function (req) {
            let progress = 0, $progress = $('.pace-progress');
            let timer = setInterval(function () {
                if(progress > 100) {
                    clearInterval(timer);
                    $progress.hide();
                    return false;
                }
                progress += 20;
                $progress.show().css('width', progress+'%');
            },100);
            return req;
        }

    };
}
