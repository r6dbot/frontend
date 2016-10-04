const m = require("mithril");
const page = require("page");
const Result = require("./Result");
const { getQuerystring } = require("lib/querystring");
const api = require("lib/api");
const { appstate, states } = require("lib/appstate");
const { title } = require("../../constants");
const exitAnim = require("lib/exitAnim");
const log = require("lib/log").child(__filename);
const idRegex = /[\da-zA-Z]{8}-[\da-zA-Z]{4}-[\da-zA-Z]{4}-[\da-zA-Z]{4}-[\da-zA-Z]{12}/;


const showPlayer = id => `/player/${id}`;

module.exports = {
	results: m.prop([]),			// the search results
	query: m.prop(""),				// the current search
	exact: m.prop(false),			// if the search should go by exact name
	onSearch: () => void 0,			// search function (gets replaced in oninit)
	onEnter: () => void 0,			// enter keylistener (gets replaced in oninit)
	onHashChange: () => {},
	onbeforeremove: exitAnim,
	oncreate: ({dom}) => {
		dom.querySelector(".search-input input").focus();
	},
	oninit: ({ attrs, state }) => {
		log.trace("<Search /> oninit");
		state.results([]);
		/**
		 * simple keylistener to trigger the search on enter keypress
		 */
		const runSearch = function() {
			log.trace("running search");
			return api("findPlayer", { name: state.query(), exact: state.exact() })
				.then(state.results)
				.then(() => appstate(states.RESULT))
				.then(() => m.redraw())
				.then(() => log.trace("search finished"))
				.catch(err => console.error(err));
		};

		state.onEnter = e => {
			if(e.keyCode === 13) {
				state.query(e.target.value);
				state.onSearch(e);
			}
		};
		/**
		 * triggers the search
		 */
		state.onSearch = e => {
			// use getPlayer if an id was entered
			if(idRegex.test(state.query())) {
				log.trace("query is an id. redirecting to details");
				page("/player/"+state.query());
				m.redraw();
				return;
			}
			// reset if no search was entered
			if(state.query() === "" || state.query().length < 3) {
				log.trace("query is empty. transitioning to initial state");
				state.query("");
				state.exact(false);
				appstate(states.INITIAL);
				return;
			} else {
				// update the search list
				// set the "is-searching" class only if we were not in the
				// "has-results" state
				if(appstate() !== states.RESULT) {
					appstate(states.SEARCH);
				}
				log.trace("searching by name");
				// clear results
				state.results([]);
				// update url and trigger the search
				runSearch();
			}

		};
		let query = attrs.context().query || {};
		if(query.exact === "true") { state.exact(true); }
		if(query.query) {
			state.query(query.query);
			state.results([]);
			runSearch()
			.then(function() {
				// this is a weird workaround.
				// if we only have 1 result and reload the page
				// it won't trigger the animation.
				// a redraw fixes that
				requestAnimationFrame(m.redraw);
			});
		}
		/**
		 * we listen to the hashchange manually,
		 * because page doesn't trigger on querystring changed
		 * and we need to have the correct appstate
		 */
		state.onHashChange = e => {
			log.trace("hash has changed. running search");
			let qs = getQuerystring();
			if(qs.query != null) {
				state.query(qs.query || "");
				state.exact(qs.exact === "true" || false);
				state.onSearch();
			}
		};
		window.addEventListener("hashchange", state.onHashChange);
	},
	onremove: ({ state }) => {
		log.trace("<Search /> onremove");
		state.query("");
		state.exact(false);
		state.results([]);
		window.removeEventListener("hashchange", state.onHashChange);
	},
	view: ({ state }) => (
		<div className="search">
			<h1 className="title is-1 search-title">R6DB</h1>
			<div className="search-form">
				<div className="column is-small-8 search-input">
					<input type="text"
						value={state.query()}
						oninput={m.withAttr("value", state.query)}
						onkeypress={state.onEnter}/>
					<span>
						<input type="checkbox"
							id="exactSearch"
							checked={state.exact()}
							onchange={m.withAttr("checked", state.exact)}/>
						<label htmlFor="exactSearch">exact name</label>
					</span>
				</div>
				<button className="search-submit" onclick={state.onSearch}>Search</button>
			</div>
			<div className="colums is-multiline search-results">
				{state.results().map((player, i, total) => <Result player={player} index={i} key={player.id} href={showPlayer(player.id)}/>)}
			</div>
		</div>
	)
};
