

abstract class Mode {
    constructor(public name: string) { }

    async setStartTime() {
        try {
            let time = parseFloat(ELEMENTS.videoTimeInput.value);
            if (segmentList.getSelectedSegment().segment.startTime && segmentList.getSelectedSegment().segment.startTime != time) {
                if (!await NotificationManager.showWarningModal("Are you sure you want to overwrite the start time?")) {
                    return;
                }
            }
            segmentList.setSelectedSegmentStartTime(time);
            NotificationManager.setInfoNotification("Start time set!");
        } catch (e: any) {
            NotificationManager.setErrorNotification(e.message);
        }
    }

    async setEndTime() {
        try {
            let time = parseFloat(ELEMENTS.videoTimeInput.value);

            if (segmentList.getSelectedSegment().segment.endTime && segmentList.getSelectedSegment().segment.endTime != time) {
                if (!await NotificationManager.showWarningModal("Are you sure you want to overwrite the end time?")) {
                    return;
                }
            }
            segmentList.setSelectedSegmentEndTime(time);

            NotificationManager.setInfoNotification("End time set!");
        } catch (e: any) {
            NotificationManager.setErrorNotification(e.message);
        }
    }

    abstract getSegment(): Segment;
    abstract getStartingSegment(): Segment;
}

class SubstractMode extends Mode {

    constructor() {
        super("Substract");
    }

    getSegment(): Segment {
        return new SubtractiveSegment();
    }
    getStartingSegment(): Segment {
        return new AdditiveSegment();
    }
}

class AdditiveMode extends Mode {

    constructor() {
        super("Additive");
    }

    getSegment(): Segment {
        return new AdditiveSegment();
    }
    getStartingSegment(): Segment {
        return new AdditiveSegment();
    }
}

class ModeManager {
    private static currentMode: Mode;

    static setCurrentMode(mode: Mode) {
        this.currentMode = mode;
    }

    static getCurrentMode(): Mode {
        if (this.currentMode == null) {
            this.currentMode = new AdditiveMode();
        }
        return this.currentMode;
    }
}