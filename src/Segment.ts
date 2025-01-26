class Time {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;

    constructor(
        hours: number = 0,
        minutes: number = 0,
        seconds: number = 0,
        milliseconds: number = 0
    ) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.milliseconds = milliseconds;
    }

    static fromSeconds(secondsTimestamp: number, framerate: number) {
        let hours = Math.floor(secondsTimestamp / 3600);
        let minutes = Math.floor((secondsTimestamp % 3600) / 60);
        let seconds = Math.floor(secondsTimestamp % 60);
        let milliseconds = Math.floor(
            ((secondsTimestamp % framerate) -
                Math.floor(secondsTimestamp % framerate)) *
            1000
        );

        return new Time(hours, minutes, seconds, milliseconds);
    }


    toString() {
        return `${this.hours.toString().padStart(2, '0')}h ${this.minutes.toString().padStart(2, '0')}m ${this.seconds.toString().padStart(2, '0')}s ${this.milliseconds.toString().padStart(3, '0')}ms`;
    }
}

class Segment {
    private _startTime: number;
    private _endTime: number | null;

    constructor(startTime: number, endTime: number | null = null) {
        this._startTime = startTime;
        this._endTime = endTime;
    }

    getCalculatedSeconds() {
        return Math.abs(
            (this._endTime != null ? this._endTime : 0) - this._startTime
        );
    }

    getCalculatedTime() {
        let framerate = getFramerate();
        let seconds = this.getCalculatedSeconds();
        return Time.fromSeconds(seconds, framerate);

    }

    setStartTime(value: number) {
        this._startTime = value;
    }

    get startTime(): number {
        return this._startTime;
    }

    set startTime(value: number) {
        this._startTime = value;
    }

    get endTime(): number | null {
        return this._endTime;
    }

    set endTime(value: number | null) {
        this._endTime = value;
    }
}

class HTMLSegmentFactory {
    static createSegmentElement(segment: Segment): HTMLSegment {
        let segmentElement = document.createElement("div");
        segmentElement.classList.add("segment");

        let segmentText = this.createTimeSegmentElement(segment);
        let resetButton = this.createResetSegmentButton();
        let removeButton = this.createRemoveButton();
        let tooltip = this.createTooltip();

        segmentElement.appendChild(segmentText);
        segmentElement.appendChild(resetButton);
        segmentElement.appendChild(removeButton);
        segmentText.appendChild(tooltip);

        segmentElement.addEventListener("mouseover", () => {
            tooltip.querySelector(".startValue")!.textContent = segment.endTime ? Time.fromSeconds(segment.startTime, getFramerate()).toString(): "Not Set";
            tooltip.querySelector(".endValue")!.textContent = segment.endTime ? Time.fromSeconds(segment.endTime, getFramerate()).toString() : "Not Set";

            let segmentRect = segmentElement.getBoundingClientRect();
            let tooltipRect = tooltip.getBoundingClientRect();

            tooltip.style.left = segmentRect.left + 'px';   
            tooltip.style.top = segmentRect.bottom - tooltipRect.height- segmentRect.height - 3  + 'px';



        });

        return new HTMLSegment(segment, segmentElement);
    }

    static createTimeSegmentElement(segment: Segment): HTMLButtonElement {
        let timeElement = document.createElement("button");
        timeElement.classList.add("time-segment");

        timeElement.addEventListener("click", () => {

            let index = segmentList.segments.findIndex((segment) => {
                return segment.element === timeElement.parentElement;
            });

            segmentList.setSegmentAsSelected(index);
        });

        let valueSpan = document.createElement("span");
        valueSpan.classList.add("segment-value");

        try {
            if (segment.endTime && segment.startTime) {
                valueSpan.innerText = segment.getCalculatedTime().toString();
            } else {
                valueSpan.innerText = DEFAULT_TIME;
            }
        } catch (e: any) {
            valueSpan.innerText = DEFAULT_TIME;
        }

        timeElement.appendChild(valueSpan);

        return timeElement;
    }

    static createResetSegmentButton(): HTMLButtonElement {
        let resetButton = document.createElement("button");
        resetButton.classList.add("reset-segment");
        resetButton.classList.add("icon");

        resetButton.addEventListener("click", () => {

            let index = segmentList.segments.findIndex((segment) => {
                return segment.element === resetButton.parentElement;
            });

            segmentList.resetSegment(index);

        });

        let icon = this.createIcon("icons/reset.png");
        resetButton.appendChild(icon);

        return resetButton;
    }

    static createIcon(imgPath: string): HTMLImageElement {
        let icon = document.createElement("img");
        icon.src = imgPath;

        return icon;
    }

    static createRemoveButton(): HTMLButtonElement {
        let removeButton = document.createElement("button");
        removeButton.classList.add("remove-segment");
        removeButton.classList.add("icon");

        removeButton.addEventListener("click", () => {
            let index = segmentList.segments.findIndex((segment) => {
                return segment.element === removeButton.parentElement;
            });

            segmentList.removeSegment(index);

        });

        let icon = this.createIcon("icons/remove.png");
        removeButton.appendChild(icon);

        return removeButton;
    }

    static createTooltip(): HTMLSpanElement {
        let tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");

        let start = document.createElement("p")
        start.classList.add("tooltipStart");

        let startLabel = document.createElement("span");
        startLabel.textContent = "Start: ";
        start.appendChild(startLabel);

        let startValue = document.createElement("span");
        startValue.classList.add("startValue");
        start.appendChild(startValue);

        tooltip.appendChild(start);

        let end = document.createElement("p")
        end.classList.add("tooltipEnd");

        let endLabel = document.createElement("span");
        endLabel.textContent = "End: ";
        end.appendChild(endLabel);

        let endValue = document.createElement("span");
        endValue.classList.add("endValue");
        end.appendChild(endValue);

        tooltip.appendChild(end);
        return tooltip;
    }
}

class HTMLSegment {
    element: HTMLDivElement;
    segment: Segment;
    private _selected: boolean = false;

    constructor(segment: Segment, element: HTMLDivElement) {
        this.segment = segment;
        this.element = element
        document.querySelector("#segments-container")!.appendChild(element);
    }

    setStartTime(value: number) {
        this.segment.startTime = value;
        if (this.segment.endTime) {
            (this.element.querySelector(".segment-value")! as HTMLButtonElement).innerText = this.segment.getCalculatedTime().toString();
        }
    }

    setEndTime(value: number | null) {
        this.segment.endTime = value;
        if (this.segment.startTime) {
            (this.element.querySelector(".segment-value")! as HTMLButtonElement).innerText = this.segment.getCalculatedTime().toString();
        }
    }

    get selected() {
        return this._selected;
    }

    set selected(value: boolean) {
        this._selected = value;

        if (value) {
            this.element.classList.add("selected");
        } else {
            this.element.classList.remove("selected");
        }

    }

}

class SegmentList {
    segments: HTMLSegment[];

    constructor() {
        this.segments = [];
    }

    addSegment(segment: HTMLSegment) {
        this.segments.push(segment);
        this.setSegmentAsSelected(this.segments.length - 1)
        if (this.segments.length == 1) {
            this.segments[0].element.querySelector(".remove-segment")!.classList.add("hidden");
        }
    }

    clearSegments() {
        this.segments.forEach((segment) => {
            segment.element.remove();
        });
        this.segments = [];
    }

    setSelectedSegmentStartTime(value: number) {
        let selectedSegment = this.getSelectedSegment();
        selectedSegment.setStartTime(value);
    }

    setSelectedSegmentEndTime(value: number) {
        let selectedSegment = this.getSelectedSegment();
        selectedSegment.setEndTime(value);
    }

    getSelectedSegment() {
        return this.segments.find((segment) => {
            return segment.selected
        })!;
    }

    getSelectedSegmentIndex() {
        return this.segments.findIndex((segment) => {
            return segment.selected
        });
    }

    setSegmentAsSelected(index: number) {
        this.segments.forEach((segment) => {
            segment.element.classList.remove("selected");
            segment.selected = false;
        });

        this.segments[index].element.classList.add("selected");
        this.segments[index].selected = true;
    }

    resetSegment(index: number) {
        debugger
        this.segments[index].setStartTime(0);
        this.segments[index].setEndTime(null);
        this.segments[index].element.querySelector(".segment-value")!.textContent = DEFAULT_TIME;
    }

    removeSegment(index: number) {
        let segment = this.segments[index];
        if (segment.selected) {

            if (this.segments[index + 1]) {
                this.setSegmentAsSelected(index + 1);
            } else if (this.segments[index - 1]) {
                this.setSegmentAsSelected(index - 1);
            }
        }

        segment.element.remove();
        this.segments.splice(index, 1);


    }

    generateDefaultSegment() {
        let segmentElement = HTMLSegmentFactory.createSegmentElement(new Segment(0));

        segmentList.addSegment(segmentElement);

        segmentList.setSegmentAsSelected(0);
    }

    getTotalTime() {
        let totalTime = 0;
        this.segments.forEach((segment) => {
            totalTime += segment.segment.getCalculatedSeconds();
        });

        return totalTime;
    }
}

const segmentList = new SegmentList();

if (segmentList.segments.length === 0) {
    segmentList.generateDefaultSegment();
}