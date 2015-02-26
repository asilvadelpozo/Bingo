function Numbers(totalBalls) {
    this.table = new Array();
    this.remainingBalls = new Array();
    this.TOTAL_NUMBERS = 75;

    this.ROW_LENGTH = 10;
    var tableRow;

    for (var i = 0; i < this.TOTAL_NUMBERS; i++) {

        if(this.firstOfTheRow(i, this.ROW_LENGTH)) {
            tableRow = new Array();
        }

        tableRow.push(new NumberCell(i + 1));

        if(this.lastOfTheRow(i, this.ROW_LENGTH)) {
            this.table.push(tableRow);
        }
    }

    for (var j = 0; j < totalBalls; j++) {
        this.remainingBalls.push(false);
    }

}

Numbers.prototype.firstOfTheRow = function (index, rowLength) {
    return index % rowLength == 0;
};

Numbers.prototype.lastOfTheRow = function (index, rowLength) {
    return index % rowLength == rowLength - 1 || index == this.TOTAL_NUMBERS - 1;
};

Numbers.prototype.getTable = function () {
    return this.table;
};

Numbers.prototype.showNumber = function (number) {
    var row = Math.floor(number / this.ROW_LENGTH),
        column = (number % this.ROW_LENGTH) - 1;

    if(column == -1) {// Module 10
        row--;
        column = this.ROW_LENGTH - 1;
    }

    return this.table[row][column].showNumber();
};

Numbers.prototype.hideNumber = function (number) {
    var row = Math.floor(number / this.ROW_LENGTH),
        column = (number % this.ROW_LENGTH) - 1;

    if(column == -1) {// Module 10
        row--;
        column = this.ROW_LENGTH - 1;
    }

    return this.table[row][column].hideNumber();
};

Numbers.prototype.getRemainingBalls = function () {
    return this.remainingBalls;
};

Numbers.prototype.removeRemainingBall = function (index) {
    return this.remainingBalls[index] = true;
};

Numbers.prototype.reset = function () {

//    for (var i = 1; i <= this.TOTAL_NUMBERS; i++) {
//        this.hideNumber(i)
//    }

    for (var j = 0; j < this.remainingBalls.length; j++) {
        this.remainingBalls[j] = false;
    }
};
