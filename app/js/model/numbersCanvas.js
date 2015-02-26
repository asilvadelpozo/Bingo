function NumbersCanvas() {

    this.canvas = document.getElementById("numbersCanvas");
    this.stage = new createjs.Stage(this.canvas);
    this.canvasImage;


    // Bowl
    this.bowlCenterXCoordinate;
    this.bowlCenterYCoordinate;
    this.bowlRadius = 100;

    this.numberOfBalls = 18;
    this.ballRadius = 10;
    this.minimumVelocityOfBall = 500; //in milliseconds

    createjs.MotionGuidePlugin.install(createjs.Tween);

    NumbersCanvas.prototype.setCanvasImage = function(image) {
        this.canvasImage = image;
    };

    NumbersCanvas.prototype.paintCanvasImage = function() {
        var bitmap;

        var container = new createjs.Container();
        this.stage.addChild(container);

        bitmap = new createjs.Bitmap(this.canvasImage);
        bitmap.x = 2;
        bitmap.y = 2;
        container.addChild(bitmap);

        this.stage.addChild(container);
        this.stage.update();
    };

    NumbersCanvas.prototype.animate = function() {
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.setFPS(30);
        createjs.Ticker.addEventListener("tick", this.stage);
    };

    NumbersCanvas.prototype.initCanvas = function(image) {
        this.setCanvasImage(image);
        this.paintCanvasImage();
        this.setupBowlWithJumpingBalls();
        this.animate();
    };

    NumbersCanvas.prototype.handleNumber = function(n) {
        var ball = this.createBall(n);
        this.stage.addChild(ball);
        this.moveBall(ball, n);
    };

    NumbersCanvas.prototype.moveBall = function(ball, number) {
        var finalPosition = this.calculatePositionForBall(number);

        createjs.Sound.play("fallingBall");
        createjs.Sound.play("setBall", {delay: 2980, volume: 0.5});

        createjs.Tween.get(ball, {loop: false})
            .to({alpha: 1, y: ball.y + 65}, 200, createjs.Ease.getPowInOut(1))
            .to({y: ball.y + 45}, 250, createjs.Ease.getPowInOut(1))
            .to({y: ball.y + 65}, 250, createjs.Ease.getPowInOut(1))
            .wait(100)
            .to({y: ball.y + 35, x: ball.x - 25, scaleX: 4, scaleY: 4}, 300, createjs.Ease.circIn())
            .to({y: ball.y - 90, x: ball.x - 60, scaleX: 8, scaleY: 8}, 150, createjs.Ease.circIn())
            .wait(1000)
            .to({scaleX: 4, scaleY: 4, x: ball.x + 50, y: ball.y - 50}, 200, createjs.Ease.circIn())
            .wait(200)
            .to({guide:{ path: this.calculateCurvePoints({x: ball.x + 50, y: ball.y - 50}, this.calculateControlPoints({x: ball.x  + 50, y: ball.y - 50}, {x: finalPosition.x, y: finalPosition.y}, finalPosition.row).originControlPoint, this.calculateControlPoints({x: ball.x  + 50, y: ball.y - 50}, {x: finalPosition.x, y: finalPosition.y}, finalPosition.row).targetControlPoint, {x: finalPosition.x, y: finalPosition.y}) }, scaleX: 1.6, scaleY: 1.6}, 400);

    };

    NumbersCanvas.prototype.bezier = function(t, p0, p1, p2, p3){
        var cX = 3 * (p1.x - p0.x),
            bX = 3 * (p2.x - p1.x) - cX,
            aX = p3.x - p0.x - cX - bX;

        var cY = 3 * (p1.y - p0.y),
            bY = 3 * (p2.y - p1.y) - cY,
            aY = p3.y - p0.y - cY - bY;

        var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
        var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;

        return {x: x, y: y};
    };

    NumbersCanvas.prototype.calculatePositionForBall = function(number) {
        var row, column;
        row = Math.floor(number/10);
        column = (number % 10) - 1;
        if(column == -1) {
            column = 9;
            row--;
        }

        return {
            x: column * 34 + 3,
            y: row * 34 + 2,
            row: row
        };
    };

    NumbersCanvas.prototype.calculateControlPoints = function(origin, target, row) {
        var originControlPoint,
            targetControlPoint,
            originControlPointX,
            originControlPointY,
            targetControlPointX,
            targetControlPointY;

        originControlPointX = origin.x - 30;
        targetControlPointX = target.x + 30;
        if(row < 5) {
            originControlPointY = origin.y + 50 * row;
            targetControlPointY = target.y + 20 * (5 - row);
        } else {
            originControlPointY = origin.y - 50 * (row - 4);
            targetControlPointY = target.y - 20 * (row - 4);
        }

        originControlPoint = {
            x: originControlPointX,
            y: originControlPointY
        };

        targetControlPoint = {
            x: targetControlPointX,
            y: targetControlPointY
        };

        return {
            originControlPoint: originControlPoint,
            targetControlPoint: targetControlPoint
        };
    };

    NumbersCanvas.prototype.calculateCurvePoints = function(p0, p1, p2, p3) {
        var accuracy = 0.15;
        var res = [];
        res.push(p0.x);
        res.push(p0.y);
        for (var i=0; i<1; i+=accuracy){
            var p = this.bezier(i, p0, p1, p2, p3);
            res.push(p.x);
            res.push(p.y);
        }
        res.push(p3.x);
        res.push(p3.y);
        return res;
    };

    NumbersCanvas.prototype.createBall = function(number, position) {
        var ball = new createjs.Container();

        if(position) {
            ball.x = this.calculateXCoordinateOnCircle(position);
            ball.y = this.calculateYCoordinateOnCircle(position);
        } else {
            ball.x = 340 + ((this.canvas.width - 340) / 2) - (2 * this.ballRadius);
            ball.y = 150;
            ball.alpha = 0;
        }

        ball.setBounds(0, 0, this.ballRadius * 2, this.ballRadius * 2);

        var circle = new createjs.Shape();

        circle.graphics.beginRadialGradientFill(["white", "lightgrey", "white"], [0.1, 0.9, 0.1], 10, 6, 4, 10, 8, 10).drawCircle(this.ballRadius, this.ballRadius, this.ballRadius);
        circle.shadow = new createjs.Shadow("#555555", 0, 2, 5);
        ball.addChild(circle);

        var text = new createjs.Text();
        text.set({
            text: number,
            font: this.ballRadius +"px Arial",
            color: "#666666"
        });

        var b = text.getBounds();
        text.x = this.ballRadius - b.width/2;
        text.y = this.ballRadius - b.height/2;

        ball.addChild(text);

        return ball;
    };

    // calculate the x coordinate on the circle of the bowl outside
    NumbersCanvas.prototype.calculateXCoordinateOnCircle = function(degree) {
        return this.bowlCenterXCoordinate + ((this.bowlRadius - 2 * this.ballRadius) * Math.cos(degree * Math.PI / 180)) - this.ballRadius ;
    };

    // calculate the y coordinate on the circle of the bowl outside
    NumbersCanvas.prototype.calculateYCoordinateOnCircle = function(degree) {
        return this.bowlCenterYCoordinate + ((this.bowlRadius - 2 * this.ballRadius) * Math.sin(degree * Math.PI / 180)) - this.ballRadius ;
    };

    NumbersCanvas.prototype.setupBowlWithJumpingBalls = function() {
        // this has to be define first cause these variables represent the refrence Point for all following calculation and drawing of the bowl and
        // its balls
        this.bowlCenterXCoordinate = 340 + ((this.canvas.width - 340) / 2);
        this.bowlCenterYCoordinate = 100;

        for (var i = 0; i < this.numberOfBalls; i++) {
            var startingDegreePosition = this.calculateStartingPointOfBall(i);
            var ball = this.createBall("?", startingDegreePosition);
            this.ballJumping(ball, startingDegreePosition);
            this.stage.addChild(ball);
        }
        var bowl = this.createBowl();
        this.stage.addChild(bowl);
        this.stage.update();
    };

    NumbersCanvas.prototype.calculateStartingPointOfBall = function(counter) {
        return 90 + ( Math.pow(-1, counter) * Math.round(counter / 2) * (this.ballRadius / 2) );
    };

    // this setup the bowl (without balls)
    NumbersCanvas.prototype.createBowl = function() {
        var bowlContainer = new createjs.Container();

        var bowl = new createjs.Shape();
        bowl.graphics.beginFill("white").drawCircle(0, 0, this.bowlRadius);
        bowl.shadow = new createjs.Shadow("white", 0, 2, 5);
        bowl.alpha = 0.3;
        bowl.x = this.bowlCenterXCoordinate;
        bowl.y = this.bowlCenterYCoordinate;
        bowlContainer.addChild(bowl);

        var bowlMirror = new createjs.Shape();
        var bowlMirrorWidth = this.bowlRadius * 1.5;
        var bowlMirrorHeight = this.bowlRadius / 2;
        bowlMirror.graphics.beginLinearGradientFill(["rgba(255,255,255,0.1)", "rgba(255,255,255,0.5)"], [0, 1], 0, 0, 0, bowlMirrorHeight * 1.5)
            .drawEllipse(0, 0, bowlMirrorWidth, bowlMirrorHeight * 1.5);
        bowlMirror.x = this.bowlCenterXCoordinate - bowlMirrorWidth / 2;
        bowlMirror.y = this.bowlCenterYCoordinate - bowlMirrorHeight * 1.5;
        bowlContainer.addChild(bowlMirror);

        return bowlContainer;
    };

    // generate a random which represent a degree in the upper half of the bowl side
    NumbersCanvas.prototype.ballJumping = function(ball, startingDegree) {
        var degree = 180 + Math.random() * 180;

        if (degree >= 225 && degree <= 315) {
            this.bigJumps(ball, degree, startingDegree); //upper quarter of the bowl
        } else {
            this.smallJumps(ball, degree, startingDegree);
        }
    };

    NumbersCanvas.prototype.bigJumps = function(ball, firstDegree, initialDegree) {
        var secondDegree = Math.random() * 180; // upper bowl side
        var thirdDegree = Math.random() * 90; // inferior bowl side
        var velocity = this.minimumVelocityOfBall - Math.random() * 200;

        createjs.Tween.get(ball, {loop: true}, true)
                .to({
                    guide: {
                        path: [this.calculateXCoordinateOnCircle(initialDegree), this.calculateYCoordinateOnCircle(initialDegree),
                            this.bowlCenterXCoordinate, this.bowlCenterYCoordinate,
                            this.calculateXCoordinateOnCircle(firstDegree), this.calculateYCoordinateOnCircle(firstDegree)], orient: true
                    }
                }, velocity)
                .to({
                    guide: {
                        path: [this.calculateXCoordinateOnCircle(firstDegree), this.calculateYCoordinateOnCircle(firstDegree),
                            this.bowlCenterXCoordinate, this.bowlCenterYCoordinate,
                            this.calculateXCoordinateOnCircle(secondDegree), this.calculateYCoordinateOnCircle(secondDegree)], orient: true
                    }
                }, velocity)
                .to({
                    guide: {
                        path: [this.calculateXCoordinateOnCircle(secondDegree), this.calculateYCoordinateOnCircle(secondDegree),
                            (this.bowlCenterXCoordinate - 45 + thirdDegree), (this.bowlCenterYCoordinate - thirdDegree),
                            this.calculateXCoordinateOnCircle(initialDegree), this.calculateYCoordinateOnCircle(initialDegree)], orient: true
                    }
                }, velocity)
            ;
    };

    NumbersCanvas.prototype.smallJumps = function(ball, firstDegree, initialDegree) {
        var secondDegree = 45 + Math.random() * 90; // inferior bowl side
        var velocity = this.minimumVelocityOfBall - Math.random() * 200;

        createjs.Tween.get(ball, {loop: true})
            .to({
                x: this.calculateXCoordinateOnCircle(firstDegree), y: this.calculateYCoordinateOnCircle(firstDegree)
            }, velocity, createjs.Ease.getPowInOut(2))
            .to({
                guide: {
                    path: [this.calculateXCoordinateOnCircle(firstDegree), this.calculateYCoordinateOnCircle(firstDegree),
                        this.bowlCenterXCoordinate, this.bowlCenterYCoordinate,
                        this.calculateXCoordinateOnCircle(secondDegree), this.calculateYCoordinateOnCircle(secondDegree)], orient: true
                }
            }, velocity)
            .to({
                x: this.calculateXCoordinateOnCircle(initialDegree), y: this.calculateYCoordinateOnCircle(initialDegree)
            }, velocity, createjs.Ease.getPowInOut(2))
    };

    NumbersCanvas.prototype.cleanCanvas = function() {
        this.stage.removeAllChildren();
        this.paintCanvasImage();
        this.setupBowlWithJumpingBalls();
        this.stage.update();
    }

}