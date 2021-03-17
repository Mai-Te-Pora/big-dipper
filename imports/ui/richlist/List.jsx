import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Link } from "react-router-dom";
import { Table, Spinner } from "reactstrap";
import i18n from "meteor/universe:i18n";
import TimeStamp from "../components/TimeStamp.jsx";
import Coin from "/both/utils/coins.js";

const T = i18n.createComponent();

const WalletRow = (props) => {
  const { index, denom, wallet } = props;

  const totalWithoutDecimals = wallet.balance.total / Math.pow(10, -8);

  return (
    <tr>
      <th scope="row">{index}</th>
      <td className="address">
        <Link to={"/account/" + wallet.address}>{wallet.address}</Link>
      </td>
      <td className="balance">
        {new Coin(totalWithoutDecimals, denom).toStringPool()}
      </td>
      <td className="lastSeenTime">
        <TimeStamp time={wallet.last_seen_time} />
      </td>
    </tr>
  );
};

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      walletsRows: null
    };
  }

  componentDidMount() {
    const { wallets, denom } = this.props;
    if (wallets !== null) this.buildRows(wallets, denom);
  }

  componentDidUpdate(prevProps) {
    const { wallets, denom } = this.props;
    if (wallets !== null && wallets !== prevProps.wallets) {
      this.buildRows(wallets, denom);
    }
  }

  buildRows(wallets, denom) {
    this.setState({
      walletsRows: wallets.map((wallet, i) => {
        return (
          <WalletRow key={i} index={i + 1} denom={denom} wallet={wallet} />
        );
      }),
    });
  }

  render() {
    const { walletsRows } = this.state;

    if (walletsRows === null) {
      return <Spinner type="grow" color="primary" />;
    } else if (walletsRows.length == 0) {
      return (
        <div>
          <T>richList.notFound</T>
        </div>
      );
    } else {
      return (
        <div className="rich-list-wrapper">
          <Table striped responsive>
            <thead>
              <tr>
                <th className="rank">
                  <i class="fas fa-trophy"></i> <T>richList.rank</T>
                </th>
                <th className="address">
                  <i class="fas fa-file-alt"></i> <T>richList.address</T>
                </th>
                <th className="balance">
                  <i class="fas fa-coins"></i> <T>richList.balance</T>
                </th>
                <th className="lastSeenTime">
                  <i class="fas fa-history"></i> <T>richList.lastSeenTime</T>
                </th>
              </tr>
            </thead>
            <tbody>{walletsRows}</tbody>
          </Table>
        </div>
      );
    }
  }
}
