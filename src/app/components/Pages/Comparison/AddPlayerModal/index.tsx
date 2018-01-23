import * as Inferno from "inferno";
import { connect } from "inferno-redux";
import Modal from "components/misc/Modal";
import FadeImage from "components/misc/Fadeimage";
import { findPlayer } from "lib/api";
import { formatDuration } from "lib/stats";
import { getImageLink } from "lib/domain";
import * as lozad from "lozad";
import "./addplayermodal.scss";

class AddPlayerModal extends Inferno.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            query: "",
            platform: props.platform,
            results: null,
        };
    }
    async onSearch(e) {
        if (e && "preventDefault" in e) {
            e.preventDefault();
        }
        if (this.state.query.length > 2) {
            try {
                const results = await findPlayer(this.state.query, this.state.platform);
                this.setState({ results }, () => lozad(".fadeimage"));
            } catch (e) {
                this.setState({ results: [] });
            }
        }
    }
    onQueryChange(query) {
        this.setState({ query });
    }
    onPlatformChange(platform) {
        this.setState({ platform });
    }
    render() {
        return (
            <Modal className="addplayermodal" title="Add player" onclose={this.props.onclose}>
                <form className="searchbar addplayermodal__search" action="" onsubmit={this.onSearch}>
                    <input
                        className="searchbar__name"
                        type="text"
                        value={this.state.query}
                        placeholder="enter player name"
                        onkeypress={e => this.onQueryChange(e.target.value)}
                        onchange={e => this.onQueryChange(e.target.value)}
                    />
                    <select
                        className="searchbar__platform"
                        value={this.props.platform}
                        onchange={e => this.onPlatformChange(e.target.value)}
                    >
                        <option value="PC">PC</option>
                        <option value="PS4">PS4</option>
                        <option value="XBOX">XB1</option>
                    </select>
                    <button onsubmit={this.onSearch} className="button button--primary searchbar__submit">
                        Search
                    </button>
                </form>
                <div className="addplayermodal__results">
                    {this.state.results.length > 0 ? (
                        this.state.results.map(x => (
                            <div
                                key={x.id}
                                className={`media addplayermodal__result ${
                                    this.props.ids.find(id => id === x.id) !== undefined
                                        ? "addplayermodal__result--selected"
                                        : ""
                                }`}
                                onclick={() => this.props.onselect(x.id)}
                            >
                                <div className="media__image">
                                    <FadeImage className="lazyload" src={getImageLink(x.userId || x.Id, x.platform)} />
                                </div>
                                <div className="media__content">
                                    <div className="media__contentheader">
                                        <header className="media__header">{x.name}</header>
                                        {x.flair ? <span className="media__label">{x.flair}</span> : null}
                                    </div>
                                    <div className="media__text">
                                        <div>level {x.level}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="media">
                            <div className="media__content">
                                <div className="media__text">{this.state.query ? "no results" : null}</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="addplayermodal__close">
                    <button className="button button--primary" onclick={this.props.onclose}>
                        done
                    </button>
                </div>
            </Modal>
        );
    }
}

const mapStateToProps = getState => ({ platform: getState().platform });

export default connect(mapStateToProps)(AddPlayerModal);