'use strict';

/* Controllers */

var ticketControllers = angular.module('ticketControllers', ['ngDialog']);

ticketControllers.controller('TicketCtrl', ['$scope', '$interval', 'ngDialog', 'Scenario', 'Prizes', function($scope, $interval, ngDialog, Scenario, Prizes) {

    $scope.scenario = Scenario.get({scenarioId: 'scenario1.json'}, function(scenario) {
        $scope.ticketModel = new TicketModel(scenario);
        $scope.numbers = new Numbers(scenario.revealedNumbers.length);
    });

    $scope.numbersCanvas = new NumbersCanvas();

    $scope.prizes = Prizes.query();

    $scope.nextNumber = -1;

    $scope.playButtonEnabled = true;
    $scope.turboButtonEnabled = false;

    $scope.numberIndex = 0;

    $scope.speed = 3300;

    $scope.amountPrizeWon = 0;
    $scope.winningClassesPrizeWon = new Array();

    $scope.ticketVisible = false;

    $scope.preload;
    $scope.progress = 0;

    $scope.isTicketVisible = function() {
        return $scope.ticketVisible;
    };

    $scope.preloadAssets = function() {

        // Create a single item to load.
        var assetsPath = "./assets/";
        var manifest = [
            {"id":"fallingBall", "src": assetsPath + "audio/falling_ball.mp3"},
            {"id":"loose", "src": assetsPath + "audio/loose.mp3"},
            {"id":"setBall", "src": assetsPath +"audio/set_ball.mp3"},
            {"id":"win", "src": assetsPath + "audio/win.mp3"},
            {"id":"youLose", "src": assetsPath + "audio/You_Lose.mp3"},
            {"id":"youWin", "src": assetsPath +"audio/You_Win.mp3"},
            {"id":"images/numbers.png", "src": assetsPath + "images/numbers.png"}
        ];

        $scope.preload = new createjs.LoadQueue();

        createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
        $scope.preload.installPlugin(createjs.Sound);

        $scope.preload.on("fileload", $scope.handleFileComplete);
        $scope.preload.on("complete", $scope.handleComplete);
        $scope.preload.on("progress", $scope.handleOverallProgress);

        $scope.preload.loadManifest(manifest);
    };

    $scope.handleComplete = function(event) {
        $scope.ticketVisible = true;
        $scope.$apply();
    };

    $scope.handleFileComplete = function(event) {

        if(event.item.id === 'images/numbers.png') {
            $scope.numbersCanvas.initCanvas(event.result);
        }
    };

    $scope.handleOverallProgress = function(event) {

        $scope.progress = (Math.floor($scope.preload.progress * 100)).toString() + '%';
        if(!$scope.$$phase) {
            $scope.$apply();
        }
        console.log("progress: " + $scope.progress);
    };

    $scope.getProgress = function() {
       return $scope.progress;
    };

    $scope.isNextNumberAvailable = function() {
        return $scope.nextNumber != -1;
    };

    $scope.isPlayEnabled = function() {
        return $scope.playButtonEnabled;
    };

    $scope.isTurboEnabled = function() {
        return $scope.turboButtonEnabled;
    };

    var stop;
    $scope.play = function() {

        $scope.reset();
        stop = $interval(function() {
            if($scope.numberIndex < $scope.scenario.revealedNumbers.length) {
                $scope.revealNextNumber();
            }
            else {
                $scope.finishGame();
            }
        }, $scope.speed);

    };

    $scope.revealNextNumber = function() {
        $scope.nextNumber = $scope.scenario.revealedNumbers[$scope.numberIndex];
        $scope.numbersCanvas.handleNumber($scope.nextNumber);
        $scope.numbers.removeRemainingBall($scope.numberIndex);
        $scope.ticketModel.checkNumberInBoards($scope.nextNumber);
        $scope.numberIndex++;
    };

    $scope.finishGame = function() {
        $scope.numberIndex = 0;
        $scope.playButtonEnabled = true;
        $scope.turboButtonEnabled = false;
        var totalPrize = $scope.ticketModel.calculateWinnings($scope.prizes);
        $scope.amountPrizeWon = totalPrize.getAmount();
        $scope.winningClassesPrizeWon = totalPrize.getWinningClasses();
        $scope.stop();
        ngDialog.open({template: 'html/popupWinningInfo.html', className: 'ngdialog-theme-default', cache: false, scope: $scope});
        $scope.playWinningsSound();
    };

    $scope.hasCustomerWon = function() {
        return $scope.amountPrizeWon > 0;
    };

    $scope.playWinningsSound = function() {
        if($scope.hasCustomerWon()) {
            createjs.Sound.play("youWin");
        } else {
            createjs.Sound.play("youLose");
        }
    };

    $scope.stop = function() {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $scope.stop();
    });

    $scope.reset = function() {
        $scope.numbersCanvas.cleanCanvas();
        $scope.numbers.reset();
        $scope.ticketModel.resetBoards();
        $scope.numberIndex = 0;
        $scope.playButtonEnabled = false;
        $scope.turboButtonEnabled = true;
        $scope.amountPrizeWon = 0;
        $scope.winningClassesPrizeWon = new Array();
    };

    $scope.turbo = function() {
        console.log('Turbo!');
        $scope.speed = 1000;
    };

    $scope.isWinningClassesWon = function(prize) {
        for (var i = 0; i < $scope.winningClassesPrizeWon.length; i++) {
            if ($scope.winningClassesPrizeWon[i] == prize.winningClass) {
                return true;
            }
        }
        return false;
    };

}]);