import React, { PropTypes, Component } from "react";
import { Link } from "react-router";
import FacebookActions from "../actions/FacebookActions";

export default class MoreMenu extends Component {
  static propTypes = {
    email: PropTypes.string,
    first_name: PropTypes.string,
    voter_photo_url: PropTypes.string,
    signed_in_personal: PropTypes.bool
  };

  menuLink (url, label){
    let search = window.location.search ? window.location.search : "";
    let currentUrl = window.location.pathname + search;

    return <li className={url === currentUrl ? "active-link list-group-item" : "list-group-item"}>
        <Link to={url}><div>{label}</div></Link>
      </li>;
  }

  render () {
    const logOut = FacebookActions.appLogout;

  return <div>
    <div className="device-menu--large container-fluid">
      <ul className="list-group">
        {this.menuLink("/ballot?type=filterRemaining", "Choices Remaining")}
        {this.menuLink("/ballot?type=filterSupport", "What I Support")}
        {this.menuLink("/ballot", "All Ballot Items")}
        {this.menuLink("/bookmarks", "Bookmarks")}
      </ul>
      <h4 className="text-left"></h4>
      <ul className="list-group">
        {this.menuLink("/more/opinions/followed", "What I'm Following")}
        {this.menuLink("/settings/location", "My Address")}
        {this.props.signed_in_personal ?
          <li onClick={logOut} className="list-group-item"><a>Sign Out</a></li> :
          this.menuLink("/more/sign_in", "Sign In")
        }
      </ul>
      <h4 className="text-left"></h4>
      <ul className="list-group">
      {this.menuLink("/more/about", "About We Vote")}
      </ul>
    </div>
    </div>;
  }
}
