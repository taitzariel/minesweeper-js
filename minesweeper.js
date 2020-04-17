//todo: get it to work in chrome

//http://stackoverflow.com/questions/16174527/how-to-disable-enable-a-checkbox-on-right-click-in-chrome-and-firefox
//http://jsfiddle.net/8dYXd/2/
// see above 2 links on how to disable right-click context menu when clicking on disabled element (such as button, checkbox, etc)
// note that if display is none or visibility is hidden, click event target is not that element; but if element has opacity 0, it is clickable.
// if you add event to e.g. document, the event.target will be the specific element that you clicked on
// but if that element is disabled (see http://www.w3.org/TR/html5/disabled-elements.html for which elements can be disabled, e.g. button, input), then browser displays context menu when right clicking it.

//see 2nd anser of http://stackoverflow.com/questions/336859/var-functionname-function-vs-function-functionname
// regarding 2 ways of defining functions

main();

function main() {
    /*
    var width = 2;
    var height = 2;
    var numMines = 0;
    */
    var width = 20;
    var height = 20;
    var numMines = 40;

    var internalLayout = new Grid(width, height, numMines);
    var domNode = document.getElementById('minefield');
    var painter = new GridPainter(domNode, width, height, numMines);
    new MineSweeper(internalLayout, painter, numMines);
}

function MineSweeper(internalLayout, painter, numMines) {
    var stage = new GameStage();
    var startTime = null;
    //todo: need to ensure that internalLayout compatible with painter
    painter.setExposeNodeCallback(exposeNode);
    painter.drawField();
    internalLayout.setCompletedCallback(congratulate);
    function exposeNode(node) {
        if (stage == 'COMPLETE') return;
        //todo: if first click, lay mines and start stopclock.
        if (stage == 'STANDBY') {
            internalLayout.layMines(node);
            stage.setInProgress();
            painter.setInProgress();
            startTime = new Date();
        }
        if (internalLayout.hasMine(node)) return gameOver(node);
        bfs(node);
    }
    var visited = new Set();
    function bfs(node) {
        if (visited.has(node)) return;
        var pending = new Queue();
        pending.enque(node);
        visited.add(node.toString()); //hack because Set checks ==, and no way of overriding ==, which checks memory location
        while (!pending.isEmpty()) {
            node = pending.deque();
            var surroundingMines = 0;
            for (var neighbour of internalLayout.getNeighbours(node)) {
                if (internalLayout.hasMine(neighbour)) {
                    surroundingMines += 1;
                }
            }
            painter.update(node, surroundingMines);
            internalLayout.expose(node);
            if (surroundingMines == 0) {
                for (var neighbour of internalLayout.getNeighbours(node)) {
                    if (!visited.has(neighbour.toString())) {
                        visited.add(neighbour.toString());
                        pending.enque(neighbour);
                    }
                }
            }
        }
    }
    function congratulate() {
        stage.setComplete();
        painter.congratulate(new Date() - startTime);
    }

    function gameOver(node) {
        stage.setComplete();
        painter.gameOver(node);
    }
}

function Grid(width, height, numMines) {
    var grid = [];
    var numNodesToClear = width * height - numMines;
    //probably a more direct way to do create a 2-dimensional array:
    for (var rowNum = 0; rowNum < height; rowNum++) {
        var row = [];
        for (var colNum = 0; colNum < width; colNum++) {
            row.push(false);
        }
        grid.push(row);
    }
    this.layMinesTest = function(numMines) { //todo; implement random selection
        grid[0][0] = true;
        grid[4][0] = true;
        grid[2][0] = true;
    }
    function getMathUtils() {
        return new MathUtils();
    }
    this.layMines = function(safeNode) {
        //todo: validation, what if already mined?
        var math = getMathUtils();
        var numPotentialMines = width * height - 1;
        var choice = math.chooseRandom(numPotentialMines, numMines);
        var orderSafeNode = safeNode.rowIndex * width + safeNode.colIndex;
        choice = choice.slice(0, orderSafeNode).concat(
                [false], choice.slice(orderSafeNode))
        var row = 0;
        var col = 0;
        for (var i = 0; i < choice.length; i++) {
            if (choice[i]) grid[row][col] = true;
            col++;
            if (col == width) {
                col = 0;
                row++;
            }
        }
    }
    var oncompletion = null;
    this.setCompletedCallback = function(callback) {
        oncompletion = callback;
    }
    this.expose = function(node) {
        numNodesToClear--;
        if (numNodesToClear == 0) {
            oncompletion();
        }
    }
    this.hasMine = function(node) {
        return grid[node.rowIndex][node.colIndex];
    }
    this.getNeighbours = function(node) {
        var thisRow = node.rowIndex;
        var thisCol = node.colIndex;
        var deltas = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        var neighbours = new Set();
        for (var i = 0; i < deltas.length; i++) {
            var deltaRow = deltas[i][0];
            var deltaCol = deltas[i][1];
            var row = thisRow + deltaRow;
            var col = thisCol + deltaCol;
            if (0 <= row && row < height && 0 <= col && col < width) {
                neighbours.add(new GridCell(row, col));
            }
        }
        return neighbours;
    }
}

function GridPainter(domNode, width, height, numMines) {
    var mineCounter = new Counter(numMines);
    var stopClock = new StopClock();
    var table = document.createElement("table");
    var stage = new GameStage();
    for (var rowNum = 0; rowNum < height; rowNum++) {
        var row = document.createElement("tr");
        for (var colNum = 0; colNum < width; colNum++) {
            var cell = document.createElement("td");
            var button = document.createElement("button");
            var rClickDisabler = document.createElement('span');
            rClickDisabler.setAttribute('class', 'disabledCover');
            cell.appendChild(button);
            cell.appendChild(rClickDisabler);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    this.setExposeNodeCallback = function(callback) {
        //todo: clear other listeners
        table.addEventListener("click", sendGridCell);
        table.addEventListener("mouseup", sendGridCells);
        function sendGridCells(e) { // for middle mouse click
            if (e.button != 1) return;
            var cell = e.target.parentNode;
            if (cell.tagName != 'TD') return;
            var cDeltas = [-1, -1, -1,  0,  0,  0,  1,  1,  1];
            var rDeltas = [-1,  0,  1, -1,  0,  1, -1,  0,  1];
            for (var i = 0; i < 9; i++) {
                var row = cell.parentNode.rowIndex + rDeltas[i];
                var col = cell.cellIndex + cDeltas[i];
                if (0 <= row && row < height && 0 <= col && col < width) {
                    var evObj = document.createEvent('Events');
                    evObj.initEvent('click', true, false);
                    table.rows[row].cells[col].firstChild.dispatchEvent(evObj);
                }
            }
        }
        function sendGridCell(e) {
            var button = e.target;
            var cell = button.parentNode;
            if (button.tagName == 'BUTTON' && cell.cellIndex >= 0
                    && !flagged(button)) {
                callback(
                        new GridCell(cell.parentNode.rowIndex, cell.cellIndex));
            }
        }
    }
    //perhaps this should be part of drawField()
    domNode.appendChild(mineCounter.getElement());
    domNode.appendChild(table);
    domNode.appendChild(stopClock.getElement());
    this.drawField = function() {};
    var colorMap = ['black', 'black', 'red', 'green', 'blue', 'purple', 'saddlebrown', 'deeppink', 'dimgray'];
    this.update = function(node, surroundingMines) {
        var cell = toTableCell(node);
        cell.disabled = true;
        clearFlag(cell);
        if (surroundingMines > 0) {
            cell.innerHTML = surroundingMines;
            cell.style.color = colorMap[surroundingMines];
        }
    }
    function toTableCell(node) {
        return table.rows[node.rowIndex].cells[node.colIndex].childNodes[0];
    }
    this.setInProgress = function() {
        stage.setInProgress();
        stopClock.start();
    }
    var timeUtils = new TimeUtils();
    this.congratulate = function(timeTaken) {
        stopClock.stop();
        stage.setComplete();
        alert("Well done! You swept the minefield in "
                + timeUtils.milliSecondsToTime(timeTaken) + '.');
    }
    this.gameOver = function(node) {
        stopClock.stop();
        stage.setComplete();
        var cell = toTableCell(node);
        alert('Game Over! ' + node + ' is mined.');
    }
    var disableContextMenu = function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }
    function toggleFlag(e) {
        e.preventDefault();
        if (stage != 'IN_PROGRESS') return;
        var button = e.target;
        if (button.tagName == 'BUTTON') {
            toggleFlagActual(button);
        }
    }
    function toggleFlagActual(button) {
        if (flagged(button)) {
            /*button.removeAttribute('class');*/
            button.removeChild(button.childNodes[0]);
            mineCounter.increment();
        } else {
            /*button.setAttribute('class', 'flagged');*/
            var flagPole = document.createElement('sup');
            flagPole.setAttribute('class', 'flagged');
            /*flagPole.innerHTML = '|';*/
            /*flag.innerHTML = '>';*/
            button.appendChild(flagPole);
            var flag = document.createElement('sup')
            flagPole.appendChild(flag);
            flag.innerHTML = '>';
            mineCounter.decrement();
        }
    }
    function flagged(button) {
        return button.hasChildNodes();
        /*return button.hasAttribute('class');*/
    }
    function setFlag(button) {
        if (!flagged(button)) toggleFlagActual(button);
    }
    function clearFlag(button) {
        if (flagged(button)) toggleFlagActual(button);
    }
        /*
        if (button.innerHTML == '') {
            button.innerHTML = '*';
            mineCounter.decrement();
        } else {
            button.innerHTML = '';
            mineCounter.increment();
        }
        */
    table.addEventListener("contextmenu", toggleFlag, false);
    //table.addEventListener("contextmenu", disableContextMenu, false);
}

function GridCell(rowIndex, colIndex) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    this.toString = function() { return colIndex + ' : ' + rowIndex};
}

function Counter(initialCount) {
    var element = document.createElement('div');
    element.setAttribute('class', 'counter');
    element.innerHTML = initialCount;
    this.getElement = function() {
        return element;
    }
    this.increment = function() {
        element.innerHTML++;
    }
    this.decrement = function() {
        element.innerHTML--;
    }
}

function StopClock() {
    var element = document.createElement('div');
    var timeUtils = new TimeUtils();
    element.setAttribute('class', 'stopclock');
    element.innerHTML = timeUtils.milliSecondsToDisplay(0);
    var accumulatedTime = 0;
    var startTime;
    var countSeconds = 0;
    this.getElement = function() {
        return element;
    }
    this.start = function() {
        if (countSeconds != 0) return;
        startTime = new Date();
        function updateSeconds() {
            var milliSeconds = accumulatedTime + (new Date() - startTime);
            element.innerHTML = timeUtils.milliSecondsToDisplay(milliSeconds);
        }
        countSeconds = setInterval(updateSeconds, 1000);
    }
    this.stop = function() {
        if (countSeconds == 0) return;
        accumulatedTime += new Date() - startTime;
        clearInterval(countSeconds);
        countSeconds = 0;
    }
}
