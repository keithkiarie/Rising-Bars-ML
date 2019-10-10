const readline = require('readline'); //getting input from the console
const fs = require('fs'); //file system

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let gamecanvas = {
    width: 614,
    height: 548
};


//CONTROLS.JS
eval(fs.readFileSync('controls.js') + '');


//BAR&BALL.JS
eval(fs.readFileSync('bar&ball.js') + '');

//SERVER.JS
eval(fs.readFileSync('server.js') + '');

//MAIN

var game_session = false; // true if the game is being played (bars and ball are moving)
var bar_objects = []; //container for all the bar


let game_level;
let game_status = 'not_started'; //(not_started, playing, paused)


function event_listener(movement) {

    if (movement == 'left') {
        ball.key = 37;
        setTimeout(() => {
            ball.key = false;
        }, 950);

    } else if (movement == 'right') {

        ball.key = 39;
        setTimeout(() => {
            ball.key = false;
        }, 950);
    }
}

function AutoPlayer(id) {
    this.choose_action = () => {
        if (game_session) {
            let random_value = Math.random() * 29;

            if (random_value < 10) {
                this.wait();
            } else if (random_value < 20) {
                this.move_left();
            } else if (random_value < 30) {
                this.move_right();
            }

            //recursion
            setTimeout(() => {
                this.choose_action();
            }, 1000);
        }
    };

    this.wait = () => {
        //do nothing
    };
    this.move_left = () => {
        event_listener('left');
    };
    this.move_right = () => {
        event_listener('right');
    }
}
let autoplayer = new AutoPlayer(0);

//return a random horizontal position of bars
random_x = () => {
    let x = Math.random() * gamecanvas.width;
    if (x >= gamecanvas.width - bar_width) {
        x -= bar_width;
    }
    return x;
}



bars_initialization = () => {
    //initialize the holder for bar objects then create new bars

    bar_objects = [];
    for (let i = 0; i < bars_number; i++) {
        bar_objects[i] = new Bar(random_x(), bars_initial_y, bar_width, bar_height, i);
    }

    ball.x = ball_initial_x;
    ball.y = ball_initial_y;
    ball.key = false;

    rising_rate = initial_rising_rate;

    game_level = 0;
}

startgame = () => {
    console.group('Gamesession');
    console.log("Game started");


    game_session = true;
    all_bars_started = false;
    refreshes = 0;

    //initial interval for calling the sequence of actions on ball and bars until all bars appear on the screen
    bar_movement = () => {

        if (all_bars_started) {
            for (let i = 0; i < bar_objects.length; i++) {
                bar_objects[i].sequence();
            }
        } else {
            //if the last bar has not yet started rising
            if (bar_objects[bar_objects.length - 1].y == bars_initial_y) {
                for (let i = 0; i < bar_objects.length; i++) {
                    //all bars will start rising only if their predecessor has risen to a certain height except the first
                    if (i != 0) {
                        if (bar_objects[i].y - bar_objects[i - 1].y > minimum_y_distance()) {
                            bar_objects[i].sequence();
                        }
                    } else {
                        bar_objects[0].sequence();
                    }
                }
            } else {
                all_bars_started = true;
            }
        }

        //changes game level after a certain number of refreshes, increases rising rate per level
        refreshes += 1;
        if (game_status == "playing" && refreshes % 600 == 0) {
            rising_rate += rising_rate_increase;

            game_level += 1;
            console.log(`Game Level: ${game_level}`);
        }

        if (game_session) {
            setTimeout(function () { bar_movement(); }, 16);
            //Send gameplay status to users connected via socket.io
            let msg = {
                ball: ball,
                bars: bar_objects,
                canvas: gamecanvas,
                level: game_level
            };
            io.emit('gameplay', JSON.stringify(msg));
        } else {
            status_checker();
        }
    }

    setTimeout(function () { bar_movement(); }, 16);
}

controller = () => {
    if (game_status == "not_started") {
        rl.question("Type 'begin' to start execution: ", (value) => {

            if (value == 'begin' || value == 'Begin' || value == 'BEGIN') {

                bars_initialization();
                startgame();
                autoplayer.choose_action();
                game_status = "playing";
            } else if (value == 'exit' || value == 'Exit' || value == 'EXIT') {
                process.exit();
            } else {
                console.log('Invalid instruction!');
                controller();
            }
        });

    } else if (game_status == "playing") {
        rl.question("Type 'pause' to pause execution: ", (value) => {

            if (value == 'pause' || value == 'Pause' || value == 'PAUSE') {
                game_session = false;
                game_status = "paused";
            } else if (value == 'exit' || value == 'Exit' || value == 'EXIT') {
                process.exit();
            } else {
                console.log('Invalid instruction!');
                controller();
            }
        });

    } else if (game_status == "paused") {
        rl.question("Type 'resume' to resume execution:", (value) => {

            if (value == 'resume' || value == 'Resume' || value == 'RESUME') {
                game_session = true;
                game_status = "playing";
                startgame();
            } else if (value == 'exit' || value == 'Exit' || value == 'EXIT') {
                process.exit();
            } else {
                console.log('Invalid instruction!');
                controller();
            }
        });
    }
}

status_checker = () => {

    if (game_status == "playing") {
        console.log("Game over!");
        console.groupEnd();

        game_status = "not_started";
        controller();
    }

}

controller();