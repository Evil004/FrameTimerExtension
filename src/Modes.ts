

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

    abstract setStyle(): void;
    abstract removeStyle(): void;
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

    async setEndTime(): Promise<void> {
        let time = parseFloat(ELEMENTS.videoTimeInput.value);
        const initialSegment = segmentList.getInitialSegment();
        if (initialSegment && initialSegment.endTime && initialSegment.endTime < time) {
            NotificationManager.setErrorNotification("End time can't be greater than the total time!");
            return;
        }
        super.setEndTime();
    }

    async setStartTime(): Promise<void> {
        let time = parseFloat(ELEMENTS.videoTimeInput.value);
        const initialSegment = segmentList.getInitialSegment();
        if (initialSegment && initialSegment.startTime && initialSegment.startTime > time) {
            NotificationManager.setErrorNotification("Start time can't be lower than 0!");
            return;
        }
        super.setStartTime();
    }

    setStyle(): void {
        let firstSegment = document.querySelector("#segments-container > *:first-child");
        if (firstSegment) {
            firstSegment.classList.add("divided-segment");
        }
    }

    removeStyle(): void {
        let firstSegment = document.querySelector("#segments-container > *:first-child");
        if (firstSegment) {
            firstSegment.classList.remove("divided-segment");
        }
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

    setStyle(): void {

    }

    removeStyle(): void {

    }
}

class ModeManager {
    private static currentMode: Mode;

    static setCurrentMode(modeName: String) {
        if (this.currentMode) {
            this.currentMode.removeStyle();
        }
        switch (modeName) {
            case "Additive":
                this.currentMode = new AdditiveMode();
                break;
            case "Substract":
                this.currentMode = new SubstractMode();
                break;
            default:
                this.currentMode = new AdditiveMode();
        }
        this.currentMode.setStyle();
    }

    static getCurrentMode(): Mode {
        if (this.currentMode == null) {
            this.currentMode = new AdditiveMode();
            this.currentMode.setStyle();
        }
        return this.currentMode;
    }

    static async switchMode() {
        
        if (this.currentMode instanceof AdditiveMode) {
            this.currentMode = new SubstractMode();
        } else {
            this.currentMode = new AdditiveMode();
        }
        console.log(this.currentMode.name);
    }

}