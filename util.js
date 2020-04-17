function Queue() {
    var linkedList = new LinkedList();
    this.enque = function(element) {
        linkedList.appendToTail(element);
    }
    this.deque = function() {
        return linkedList.removeHead();
    }
    this.isEmpty = function() {
        return linkedList.isEmpty();
    }
}

function LinkedList() {
    var head = null;
    var tail = null;
    this.appendToTail = function(element) {
        var newNode = new LinkedListNode(element);
        if (tail == null) {
            head = newNode;
            tail = newNode;
        } else {
            tail.next = newNode;
            tail = tail.next;
        }
    }
    this.removeHead = function() {
        if (head == null) return null;
        var oldHead = head;
        head = head.next;
        if (head == null) tail = null;
        return oldHead.value;
    }
    this.isEmpty = function() {
        return (head == null);
    }
}

function LinkedListNode(element) {
    this.value = element;
    this.next = null;
}

function MathUtils() {
    //chooses k elements at random from n elements
    this.chooseRandom = function(n, k) {
        var numChoices = this.choose(n, k);
        var chosenPosition = Math.floor(Math.random() * numChoices);
        var choice = [];
        for (var i = n - 1; i >= 0; i--) {
            numChoices = this.choose(i, k);
            if (chosenPosition < numChoices) {
                choice.push(false);
            } else {
                choice.push(true);
                chosenPosition -= numChoices;
                k--;
            }
        }
        return choice;
    }
    this.choose = function(n, k) {
        //todo: validation
        if (k > n) return 0;
        if (k > n / 2) return this.choose(n, n - k);
        return multiplyDown(n, n - k) / this.factorial(k);
    }
    var multiplyDown = function(n, k) {
        //todo: validation
        var product = 1;
        for (; n > k; n--) {
            product *= n;
        }
        return product;
    }

    this.factorial = function(k) {
        //todo: validation
        return multiplyDown(k, 1);
    }
}

function GameStage() {
    var stages = ['STANDBY', 'IN_PROGRESS', 'COMPLETE'];
    var currentStage = 0;
    this.setInProgress = function() {
        if (currentStage == 0) {
            currentStage = 1;
        } else {
            throw 'IllegalStateException';
        }
    }
    this.setComplete = function() {
        if (currentStage < 2) {
            currentStage = 2;
        } else {
            throw 'IllegalStateException';
        }
    }
    this.toString = function() {
        return stages[currentStage];
    }
}

function TimeUtils() {
    this.milliSecondsToDisplay = function(milliSeconds) {
        var totalSeconds = Math.round(milliSeconds / 1000);
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor(totalSeconds / 60) % 60;
        var seconds = totalSeconds % 60;
        return hours + '-' + (minutes < 10 ? '0' + minutes : minutes) + '-'
                + (seconds < 10 ? '0' + seconds : seconds);
    }
    this.milliSecondsToTime = function(milliSeconds) {
        var totalSeconds = milliSeconds / 1000;
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor(totalSeconds / 60) % 60;
        var seconds = (totalSeconds % 60).toFixed(1);
        if (hours > 1) {
            hours += ' hours ';
        } else if (hours == 1) {
            hours += ' hour ';
        } else {
            hours = '';
        }
        if (minutes > 1) {
            minutes += ' minutes ';
        } else if (minutes == 1) {
            minutes += ' minute ';
        } else {
            minutes = '';
        }
        seconds += ' seconds';
        return hours + minutes + seconds;
    }
}
