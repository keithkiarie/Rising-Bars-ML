start_from_menu = () => {
    document.getElementById("menu").style.display = "none";
    document.getElementById("game_display").style.display = "block";
    if (toggle_game_button.innerHTML == "Start") {
        bars_initialization();
        startgame();
        toggle_game_button.innerHTML = "Pause";
    }
}

go_to_menu = () => {
    if (document.getElementById("game_display").style.display == "block") {
        if (toggle_game_button.innerHTML == "Pause") {
            game_session = false;
            toggle_game_button.innerHTML = "Resume";
        }
    }
    document.getElementById("game_display").style.display = "none";

    document.getElementById("menu").style.display = "block";
}