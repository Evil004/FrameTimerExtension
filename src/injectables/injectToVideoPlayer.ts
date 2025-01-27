let functionToInject = function (message: any, _sender: any, sendResponse: (response?: any) => void) {
    if (message.action === "getExactTime") {
        let time = document.querySelector("video")!.currentTime;
        sendResponse(time.toString());
    } else if (message.action === "setExactTime") {
        let time = parseFloat(message.time);
        document.querySelector("video")!.currentTime = time;
        sendResponse("Time set");
    }

    sendResponse("No action found");
}

if (navigator.userAgent.indexOf("Chrome") != -1) {
    chrome.runtime.onMessage.addListener(functionToInject);
} else if (navigator.userAgent.indexOf("Firefox") != -1) {
    browser.runtime.onMessage.addListener(functionToInject);
}