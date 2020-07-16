 /* Javascript */
 const settings = {
     gridSize: 16,
     stageIncrement: 113
 };

 let highScore = 0;

 function initGame(canvas) {
     const {gridSize, stageIncrement} = settings;
     let centerPos = (canvas.clientWidth / 2);
     let snakeState = [
         [centerPos - (2 * gridSize), centerPos - (2 * gridSize)],
         [centerPos - gridSize, centerPos - (2 * gridSize)],
         [centerPos, centerPos - (2 * gridSize)]
     ];

     let foodState = [];
     let snakeLength = 3;
     let stage = 0;
     let score = 0;
     let snakeDirection = 'RIGHT';
     let gameOver = false;
     let snakeTimer = 0;
     let snakeTimeout = 300;
     startButton.classList.add('hide');
     const ctx = canvas.getContext('2d');

     initControls();
     createFood();
     setSnakeTimer();
     let foodTimer = startFoodTimer();
     let animation = requestAnimationFrame(animate);

     function setSnakeTimer() {
         if (snakeTimer) {
             clearTimeout(snakeTimer);
             snakeTimer = false;
         }
         snakeState = moveSnake(snakeState, snakeDirection);
         snakeTimer = setTimeout(() => {
             setSnakeTimer();
         }, snakeTimeout);
     }

     function animate() {
         drawFrame();
         animation = requestAnimationFrame(animate);
     }

     function quitGame() {
         gameOver = true;
         clearScreen();
         unbindControls();
         cancelAnimationFrame(animation);
         startButton.classList.remove('hide');
         startButton.innerHTML = 'Play Again';
     }

     function startFoodTimer() {
         return setTimeout(createFood, 3000);
     }

     function unbindControls() {
         window.removeEventListener('keydown', handleKeyDown);
     }

     function initControls() {
         window.addEventListener('keydown', handleKeyDown);
     }

     function clearScreen() {
         ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
     }

     function updateScore(newScore) {
         score = newScore;
         scoreElement.innerHTML = score;
         if (score > highScore) {
            scoreLine[0].classList.add('omg');
            highScore = score;
            highScoreElement.innerHTML = highScore;
         }
     }

     function handleKeyDown(evt) {
         switch (evt.key) {
             case 'ArrowDown':
                 if (snakeDirection === 'UP') {
                     return;
                 }
                 snakeDirection = 'DOWN';
                 break;
             case 'ArrowUp':
                 if (snakeDirection === 'DOWN') {
                     return;
                 }
                 snakeDirection = 'UP';
                 break;
             case 'ArrowRight':
                 if (snakeDirection === 'LEFT') {
                     return;
                 }
                 snakeDirection = 'RIGHT';
                 break;
             case 'ArrowLeft':
                 if (snakeDirection === 'RIGHT') {
                     return;
                 }
                 snakeDirection = 'LEFT';
                 break;
             default:
                 return false;
         }
         evt.preventDefault();
         snakeState = moveSnake(snakeState, snakeDirection);
     }

     function drawSnake() {
         let green = 200;
         for (let i = snakeState.length - 1; i >= 0; i -= 1) {
             ctx.fillStyle = `rgb(0,${green},0)`;
             ctx.fillRect(snakeState[i][0], snakeState[i][1], settings.gridSize, settings.gridSize);
             green -= 5;
         }
         if (!snakeTimer) {
             setSnakeTimer();
         }
     }

     function handleBorderCollision() {
         if (stage === 3) {
             quitGame();
             return;
         }
         stage += 1;
         snakeState = [
             [centerPos - (2 * gridSize), centerPos - (2 * gridSize)],
             [centerPos - gridSize, centerPos - (2 * gridSize)],
             [centerPos, centerPos - (2 * gridSize)]
         ];
         foodState = [];
         createFood();
         return snakeState;
     }

     function moveSnake(snakeState, direction) {
         const newState = [...snakeState];
         const headPos = [].concat(snakeState[snakeState.length - 1]);
         switch (direction) {
             case 'RIGHT':
                 headPos[0] = headPos[0] + gridSize;
                 break;
             case 'LEFT':
                 headPos[0] = headPos[0] - gridSize;
                 break;
             case 'DOWN':
                 headPos[1] = headPos[1] + gridSize;
                 break;
             case 'UP':
                 headPos[1] = headPos[1] - gridSize;
                 break;
             default:
                 //no op
                 console.warning('bad direction detected', direction);
         }

         // border collision detection
         if (
             headPos[0] <= stage * stageIncrement || headPos[0] >= (canvas.clientWidth - gridSize) - (stage * stageIncrement)
            || headPos[1] <= stage * stageIncrement || headPos[1] >= (canvas.clientHeight - gridSize) - (stage * stageIncrement)
         ) {
             return handleBorderCollision();
         }

         // self collision detection
         if (snakeState.some(item => item[0] === headPos[0] && item[1] === headPos[1])) {
             quitGame();
             return [];
         }

         snakeLength = foodCheck(headPos, snakeLength);

         newState.push(headPos);
         if (newState.length > snakeLength) {
             newState.shift();
         }

         return newState;
     }

     function createFood() {
         const x = randomIntFromInterval((stage * stageIncrement) / gridSize + 2, (canvas.clientWidth - (stage * stageIncrement)) / gridSize - 2);
         const y = randomIntFromInterval((stage * stageIncrement) / gridSize + 2, (canvas.clientHeight - (stage * stageIncrement)) / gridSize - 2);
         const duration = randomIntFromInterval(4000, 10000);
         foodState.push([x * gridSize, y * gridSize, Date.now() + duration]);
     }

     function foodCheck(headPos, snakeLength) {
         for (let i = 0; i < foodState.length; i += 1) {
             if (headPos[0] === foodState[i][0] && headPos[1] === foodState[i][1]) {
                 updateScore(score + 1);
                 destroyFood(i);
                 snakeTimeout = Math.max(snakeTimeout - 30, 100);
                 if (foodState.length === 0) {
                     clearTimeout(foodTimer);
                     createFood();
                     startFoodTimer();
                 }
                 return snakeLength + 1;
             }
         }
         return snakeLength;
     }

     function destroyFood(index) {
         foodState.splice(index, 1);
     }

     function randomIntFromInterval(min, max) {
         return Math.floor(Math.random() * (max - min + 1) + min);
     }

     function drawBorders() {
         const {stageIncrement} = settings;
         const distance = stage * stageIncrement;
         ctx.fillStyle = 'rgb(200,0,0)';
         ctx.fillRect(distance, distance, canvas.clientWidth - (distance * 2), gridSize - 4 );
         ctx.fillRect(distance, distance, gridSize - 4, canvas.clientHeight - (distance * 2) );
         ctx.fillRect((canvas.clientWidth - distance) - (gridSize - 4), distance, gridSize - 4, canvas.clientHeight - (distance * 2) );
         ctx.fillRect(distance, (canvas.clientHeight - distance) - (gridSize - 4),canvas.clientWidth - (distance * 2), gridSize - 4);
     }

     function drawFood() {
         let destroy = [];
         ctx.fillStyle = 'rgb(200,200,0)';
         const now = Date.now();
         for (let i = 0; i < foodState.length; i += 1) {
             if (now < foodState[i][2]) {
                ctx.fillRect(foodState[i][0], foodState[i][1], gridSize, gridSize);
             }
             else {
                 destroy.push(i);
             }
         }

         if (destroy.length) {
             destroy.forEach((item) => destroyFood(item));
             if (foodState.length === 0) {
                 clearTimeout(foodTimer);
                 createFood();
                 startFoodTimer();
             }
         }
     }

     function drawFrame() {
         if (gameOver) {
             return;
         }
         clearScreen();
         drawBorders();
         drawFood();
         drawSnake();
     }
 }

 const gameCanvas = document.getElementById('game');
 const startButton = document.getElementById('start');
 const scoreElement = document.getElementById('score');
 const scoreLine = document.getElementsByClassName('scoreline');
 const highScoreElement = document.getElementById('high-score');
 startButton.addEventListener('click', () => initGame(gameCanvas));

