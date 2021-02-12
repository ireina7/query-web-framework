function switch_device() {
    if((navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        //window.location.href = "../mobile/index.html";
        switch_to_mobile();
    } else {
        //window.location.href = "../index.html";
        //window.location.href = "../mobile/index.html";
        //switch_to_mobile();
    }
}

function switch_to_mobile() {
    window.location.href = "../mobile/index.html";
}

function switch_to_pc() {
    window.location.href = "../index.html";
}
