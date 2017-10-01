const alwaysOpen = () => window.innerWidth > 1304;

export default (state = false, action = {}) => {
    switch (action.type) {
        case "MENU_TOGGLE":
            return alwaysOpen() || !state;
        case "MENU_OPEN":
            return alwaysOpen() || true;
        case "HOME":
        case "LEADERBOARD":
        case "SEARCH":
        case "PROFILE":
        case "PLAYER":
        case "FAQ":
        case "MENU_CLOSE":
            return alwaysOpen() || false;
        default:
            return alwaysOpen() || state;
    }
}