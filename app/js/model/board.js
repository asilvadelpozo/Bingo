function Board(boardDefinition) {
    this.number = boardDefinition.boardNumber;
    this.board = new Array();

    var ROW_LENGTH = 5;
    var boardRow,
        index = 0;

    for (var i = 0; i < boardDefinition.numbers.length + 1; i++) {

        if(this.firstOfTheRow(i, ROW_LENGTH)) {
            boardRow = new Array();
        }

        if(this.inTheMiddle(i, boardDefinition.numbers.length)) {
            boardRow.push(new BoardCell(-1));
        }
        else {
            boardRow.push(new BoardCell(boardDefinition.numbers[index]));
            index++;
        }

        if(this.lastOfTheRow(i, ROW_LENGTH)) {
            this.board.push(boardRow);
        }
    }

}

Board.prototype.firstOfTheRow = function (index, rowLength) {
    return index % rowLength == 0;
};

Board.prototype.lastOfTheRow = function (index, rowLength) {
    return index % rowLength == rowLength - 1;
};

Board.prototype.inTheMiddle = function (index, length) {
    return index == Math.floor(length/2);
};

Board.prototype.getBoard = function () {
    return this.board;
};

Board.prototype.getNumber = function () {
    return this.number;
};

Board.prototype.isCellEmpty = function (row, column) {
    return this.board[row][column].isEmpty();
};

Board.prototype.isCellChecked = function (row, column) {
    return this.board[row][column].isChecked();
};

Board.prototype.isCellLight = function (row, column) {
    return this.board[row][column].isLight();
};

Board.prototype.checkNumber = function (number) {
    //TODO do this efficiently please >:(
    for(var i = 0; i < this.board.length; i++){
        for(var j = 0; j < this.board[i].length; j++){
            if(this.board[i][j].getNumber() == number) {
                this.board[i][j].setState("checked");
            }
        }
    }
};

Board.prototype.reset = function () {
    for(var i = 0; i < this.board.length; i++){
        for(var j = 0; j < this.board[i].length; j++){
            this.board[i][j].setState("none");
        }
    }
};

Board.prototype.calculateBiggestPrize = function (prizes) {
    var biggestPrizeFound = false,
        index = prizes.length - 1,
        result = new Prize(0, 0); //No amount and no winning class
    while(!biggestPrizeFound && index >= 0) {
        if(this.boardHasWonPrize(prizes[index].positions)) {
            biggestPrizeFound = true;
            result = new Prize(prizes[index].prize.amount, prizes[index].winningClass);
            this.lightWinningNumbers(prizes[index].positions);
        }
        else {
            index--;
        }
    }
    return result;
};

Board.prototype.boardHasWonPrize = function (positions) {
    var everythingGoesFine = true,
        index = 0;
    while(everythingGoesFine && index < this.board.length){
        everythingGoesFine = this.everythingGoesFineInTheRow(this.board[index], positions[index]);
        index++;
    }
    return everythingGoesFine;
};

Board.prototype.everythingGoesFineInTheRow = function (boardRow, positionsRow) {
    var everythingGoesFineInTheRow = true,
        index = 0;
    while(everythingGoesFineInTheRow && index < boardRow.length){
        if(positionsRow[index] == 1 && boardRow[index].getState() != "checked" && !boardRow[index].isEmpty()) {
            everythingGoesFineInTheRow = false;
        }
        else {
            index++;
        }
    }
    return everythingGoesFineInTheRow;
};

Board.prototype.lightWinningNumbers = function (positions) {
    for(var i = 0; i < this.board.length; i++){
        for(var j = 0; j < this.board[i].length; j++){
            if(positions[i][j] == 1) {
                this.board[i][j].setState("light");
            }
        }
    }
};