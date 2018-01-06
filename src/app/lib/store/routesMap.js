import { redirect, push, NOT_FOUND } from "redux-first-router";
import { Leaderboards } from "lib/constants";
import * as api from "../api";
import setMeta from "lib/meta";
export default {
    HOME: {
        path: "/",
        thunk: () => {
            gtag && gtag("event", "screen_view", { screen_name: "home" });
            setMeta({
                title: `Home`,
                description: `Find any player in Rainbow Six: Siege`,
                type: "website",
            });
        },
    },
    SEARCH: {
        path: "/search/:platform/:query",
        thunk: async (dispatch, getState) => {
            const { location } = getState();
            const { query, platform } = location.payload;
            gtag && gtag("event", "search", { search_term: query });
            dispatch({ type: "PLATFORM", payload: platform });
            api
                .findPlayer(query, platform)
                .then(result => {
                    setMeta({
                        title: `Search ${platform} for ${query}`,
                        description: `Find ${query} in the community database for Rainbow Six: Siege`,
                    });
                    gtag && gtag("event", "screen_view", { screen_name: "search" });
                    dispatch({
                        type: "SEARCH_FETCHED",
                        payload: { query, platform, result },
                    });
                })
                .catch(error => {
                    dispatch({
                        type: "SEARCH_FAILED",
                        payload: { query, error },
                    });
                });
        },
    },
    LEADERBOARD_ENTRY: {
        path: "/leaderboard",
        thunk: async (dispatch, getState) => {
            const platform = getState().platform;
            dispatch(redirect({ type: "LEADERBOARD", payload: { board: "ALL", platform } }));
        },
    },
    CHANKABOARD: {
        path: "/leaderboard/:platform/CHANKA",
        thunk: async (dispatch, getState) => {
            const { platform } = getState().location.payload;
            dispatch({ type: "PLATFORM", payload: platform });
            api
                .getLeaderboard("operatorpvp_tachanka_turretkill", platform)
                .then(entries => {
                    setMeta({
                        title: "LMG kills leaderboard",
                        description: "top 100 Tachanka players in our database",
                        type: "website",
                    });
                    gtag && gtag("event", "screen_view", { screen_name: "leaderboard" });
                    dispatch({
                        type: "LEADERBOARD_FETCHED",
                        payload: { board: "CHANKA", entries },
                    });
                })
                .catch(error => dispatch({ type: "LEADERBOARD_FAILED", payload: { board: "CHANKA", error } }));
        },
    },
    LEADERBOARD: {
        path: "/leaderboard/:platform/:board",
        thunk: async (dispatch, getState) => {
            const { board: b, platform } = getState().location.payload;
            const board = (b || "").toUpperCase();
            if (!board || board === "CHANKA") {
                return;
            }
            const lbConfig = Leaderboards[board];
            dispatch({ type: "PLATFORM", payload: platform });
            api
                .getLeaderboard(lbConfig.board, platform)
                .then(entries => {
                    setMeta({
                        title: `${lbConfig.label} leaderboard`,
                        description: `find the top 100 players (${lbConfig.label}) in our Database`,
                        type: "website",
                    });
                    gtag && gtag("event", "screen_view", { screen_name: "leaderboard" });
                    dispatch({
                        type: "LEADERBOARD_FETCHED",
                        payload: { board, entries },
                    });
                })
                .catch(error =>
                    dispatch({
                        type: "LEADERBOARD_FAILED",
                        payload: { board, error },
                    }),
                );
        },
    },
    FAQ: {
        path: "/faq",
        thunk: (dispatch, getState) => {
            setMeta({
                title: `FAQ`,
                description: ``,
                type: "website",
            });
            gtag && gtag("event", "screen_view", { screen_name: "faq" });
        },
    },
    SIMPLE: {
        path: "/simple/:id",
        thunk: playerThunk,
    },
    PLAYER: {
        path: "/player/:id",
        thunk: playerThunk,
    },
    PLAYERTABS: {
        path: "/player/:id/:tab",
        thunk: playerThunk,
    },
    COMPARISON: {
        path: "/compare",
        thunk: async (dispatch, getState) => {
            const players = getState().players;

            dispatch({ type: "loading", payload: "loading players" });
            const query = getState().location.query || {};

            const ids = [].concat(query.ids || []);

            let idList = ids.map(x => x.toLowerCase().trim()).filter(x => players[x] == undefined);
            api
                .getPlayers(idList)
                .then(x => {
                    dispatch({ type: "PLAYERS_FETCHED", payload: x.map(p => ({ id: p.id, player: p })) });
                    gtag && gtag("event", "screen_view", { screen_name: "compare" });
                })
                .catch(err => {
                    dispatch({
                        type: "PLAYERS_FAILED",
                    });
                    throw err;
                });
        },
    },
};

async function playerThunk(dispatch, getState) {
    const { platform } = getState();
    const { id, tab } = getState().location.payload;
    api
        .getPlayer(id, { platform })
        .then(function(player) {
            dispatch({ type: "PLAYER_FETCHED", payload: { id, player } });
            gtag && gtag("event", "screen_view", { screen_name: "player" });
            if (player.flags.noAliases === false) {
                setMeta({
                    title: `${player.name}`,
                    type: "profile",
                });
            } else {
                setMeta({
                    title: `account ${id}`,
                    description: `${id} account details in the community database for Rainbow Six: Siege`,
                });
            }
        })
        .catch(error => {
            console.error(error);
            dispatch({ type: "PLAYER_FAILED", payload: { id, error } });
        });
}
