import * as React from "react";
import { hot } from "react-hot-loader";
import Result from "components/misc/Playercard";
import Media from "components/misc/Media";
import Loading from "components/misc/Loading";
import Page, { PageHead, PageContent } from "components/misc/Page";
import { connect } from "react-redux";
import "./search.scss";

import { GLYPHS } from "components/misc/Icon";

function Search(props) {
    return (
        <Page className="search">
            <PageHead>
                <div className="container container--small">
                    <div className="header">
                        Search {props.search}
                        <span className="search__resultcount header header--small header--subtle">
                            {props.result.length} result(s)
                        </span>
                    </div>
                </div>
            </PageHead>
            <PageContent>
                <div className="container container--small">
                    <div className="search_results">
                        {props.loading ? (
                            <Loading />
                        ) : props.result.length > 0 ? (
                            <div>
                                {props.result.map(player => (
                                    <Result key={player.id} player={player} />
                                ))}
                            </div>
                        ) : (
                            <Media title="No results">
                                we could not find any players matching that query.
                            </Media>
                        )}
                    </div>
                </div>
            </PageContent>
        </Page>
    );
}

const mapStateToProps = state => {
    const { platform, loading, search, searchResults, location } = state;
    const query = location.payload.query;
    return {
        loading,
        result: searchResults[query] || [],
        search: query,
        platform
    };
};

export default hot(module)(connect(mapStateToProps)(Search));
