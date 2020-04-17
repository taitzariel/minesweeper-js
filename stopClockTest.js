main();

function main() {
    var clockLocation = document.getElementById('stopClockTest');
    var stopClock = new StopClock();
    clockLocation.appendChild(stopClock.getElement());
    start1 = function() {
        stopClock.start();
    }
    stop1 = function() {
        stopClock.stop();
    }
}
