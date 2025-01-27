let browserAction = new ScriptsComunicator();
let browserController = BrowserFactory.getBrowser();



window.onload = async () => {
    let response = await browserController.getFromStorage("data")

    restoreData(response.data)

    browserAction.sendOpenedExtensionMessage()
}

document.addEventListener("click", (e) => {

    NotificationManager.removeNotification();
}, true);

document.addEventListener("click", (e) => {
    saveOnChange(e);

});
document.addEventListener("change", saveOnChange);

document.addEventListener("input", saveOnChange);


BUTTONS.copyModNoteBtn.addEventListener('click', async (e) => {
    try {
        let text = generateModNote();
        navigator.clipboard.writeText(text).then(() => {
            NotificationManager.setSuccessNotification("Copied to clipboard!")
        }).catch(() => {
            NotificationManager.setErrorNotification("Error copying to clipboard!")
        });
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);
    }

});

BUTTONS.copyBtn.addEventListener('click', async (e) => {
    let text = ELEMENTS.calculatedTimeText.value;
    navigator.clipboard.writeText(text).then(() => {
        NotificationManager.setSuccessNotification("Copied to clipboard!")
    }).catch(() => {
        NotificationManager.setErrorNotification("Error copying to clipboard!")
    });

})

BUTTONS.calculateBtn.addEventListener('click', async (e) => {
    let totalTime = segmentList.getTotalTime();

    try {
        let time = Time.fromSeconds(totalTime, getFramerate());

        ELEMENTS.calculatedTimeText.value = time.toString();
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);
    }
});

BUTTONS.sendToSRCBtn.addEventListener('click', async (e) => {
    try {
        let time = Time.fromSeconds(segmentList.getTotalTime(), getFramerate());
        debugger
        browserAction.setTimeToSRC(time).then(() => {
            NotificationManager.setSuccessNotification("Time set!")
        }).catch(() => {
            NotificationManager.setErrorNotification("Error when comunicating with SRC!")
        });
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);
    }
})

BUTTONS.resetAllBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (await NotificationManager.showWarningModal("Are you sure you want to reset all data?")) {
        ModeManager.getCurrentMode().removeStyle();

        ELEMENTS.framerateInput.value = "";
        ELEMENTS.videoTimeInput.value = "0.0";
        segmentList.clearSegments();
        segmentList.generateDefaultSegment();
        ELEMENTS.calculatedTimeText.value = DEFAULT_TIME;
        ModeManager.getCurrentMode().setStyle();

        browserController.removeFromStorage("data");
    }
});

BUTTONS.addSegmentBtn.addEventListener('click', async (e) => {
    segmentList.addSegment(HTMLSegmentFactory.createSegmentElement(ModeManager.getCurrentMode().getSegment()));
});

BUTTONS.setStartTimeBtn.addEventListener('click', async () => {
    ModeManager.getCurrentMode().setStartTime();
})

BUTTONS.setEndTimeBtn.addEventListener('click', async (e) => {
    ModeManager.getCurrentMode().setEndTime();
});

BUTTONS.setFramerateTo30Btn.addEventListener('click', async (e) => {
    ELEMENTS.framerateInput.value = "30";
});

BUTTONS.setFramerateTo60Btn.addEventListener('click', async (e) => {
    ELEMENTS.framerateInput.value = "60";
});

BUTTONS.getExactTimeBtn.addEventListener('click', async (e) => {
    try {
        debugger
        let fps = getFramerate();
        browserAction.getVideoSeconds().then((response) => {

            let time = Math.floor(response * fps) / fps;

            ELEMENTS.videoTimeInput.value = time.toString();
            NotificationManager.setSuccessNotification("Got time from video player!")

        }).catch((e) => {
            NotificationManager.setErrorNotification("Error communicating with the video player!")
        });
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);

    }
});

BUTTONS.changeSRCTimeInputBtn.addEventListener('click', async (e) => {
    browserAction.changeSelectedInput().then(() => {
        NotificationManager.setSuccessNotification("Changed input!")
    }).catch(() => {
        NotificationManager.setErrorNotification("Error when comunicating with SRC!")
    });
});

BUTTONS.switchMode.addEventListener('click', async (e) => {
    if (await NotificationManager.showWarningModal("Are you sure you want to switch modes? This will erase your data")) {
        ModeManager.getCurrentMode().removeStyle();

        await ModeManager.switchMode();
        ELEMENTS.framerateInput.value = "";
        ELEMENTS.videoTimeInput.value = "0.0";
        segmentList.clearSegments();
        segmentList.generateDefaultSegment();
        ModeManager.getCurrentMode().setStyle();

        ELEMENTS.calculatedTimeText.value = DEFAULT_TIME;

        browserController.removeFromStorage("data");
    }

    BUTTONS.switchMode.innerText = ModeManager.getCurrentMode().name;
})