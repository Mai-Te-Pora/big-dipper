import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import List from "./List.jsx";
import { LoadMore } from "../components/LoadMore.jsx";
import { Meteor } from "meteor/meteor";
import { Route, Switch } from "react-router-dom";
import Sidebar from "react-sidebar";
import ChainStates from "../components/ChainStatesContainer.js";
import { Helmet } from "react-helmet";
import i18n from "meteor/universe:i18n";

const T = i18n.createComponent();

export default class RichList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      limit: Meteor.settings.public.initialPageSize,
      monikerDir: 1,
      votingPowerDir: -1,
      uptimeDir: -1,
      proposerDir: -1,
      priority: 2,
      wallets: null,
      loadmore: false,
      sidebarOpen: props.location.pathname.split("/transactions/").length == 2,
    };
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  componentDidMount() {
    const { limit } = this.state;

    this.getRichList("swth", limit).then((_wallets) => {
      this.setState({ wallets: _wallets });
    });
    document.addEventListener("scroll", this.trackScrolling);
  }

  componentWillUnmount() {
    document.removeEventListener("scroll", this.trackScrolling);
  }

  getRichList(denom, limit) {
    return new Promise((resolve, reject) => {
      Meteor.call("richlist.getRichList", denom, limit + 10, (err, results) => {
        if (results?.wallets && results?.wallets.length > 0) {
          resolve(results.wallets);
        } else {
          reject();
        }
      });
    });
  }

  trackScrolling = () => {
    const wrappedElement = document.getElementById("richlist-wrapper");
    if (this.isBottom(wrappedElement)) {
      document.removeEventListener("scroll", this.trackScrolling);
      this.setState({ loadmore: true });

      const newLimit = this.state.limit + 10;
      this.getRichList("swth", newLimit)
        .then((_wallets) => {
          this.setState(
            {
              wallets: _wallets,
              limit: newLimit,
              loadmore: false,
            },
            (err) => {
              if (!err)
                document.addEventListener("scroll", this.trackScrolling);
            }
          );
        })
        .catch((err) => {
          this.setState({ loadmore: false });
        });
    }
  };

  render() {
    return (
      <div id="richlist-wrapper">
        <Helmet>
          <title>Switcheo Rich List</title>
          <meta
            name="description"
            content="Discover the richest addresses of Switcheo TradeHub"
          />
        </Helmet>
        <Row>
          <Col md={3} xs={12}>
            <h1 className="d-none d-lg-block">
              <T>richList.richList</T>
            </h1>
          </Col>
          <Col md={9} xs={12} className="text-md-right">
            <ChainStates />
          </Col>
        </Row>
        <p className="lead">
          <T>richList.lead</T>
        </p>
        <List wallets={this.state.wallets} />
        <LoadMore show={this.state.loadmore} />
      </div>
    );
  }
}
