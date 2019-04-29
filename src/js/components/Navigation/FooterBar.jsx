import React from 'react';
import PropTypes from 'prop-types';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Badge from '@material-ui/core/Badge';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import DescriptionIcon from '@material-ui/icons/Description';
import SettingsIcon from '@material-ui/icons/Settings';
import PeopleIcon from '@material-ui/icons/People';
import { historyPush } from '../../utils/cordovaUtils';
import { stringContains } from '../../utils/textFormat';
import FriendStore from '../../stores/FriendStore';

class FooterBar extends React.Component {
  static propTypes = {
    pathname: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      friendInvitationsSentToMe: 0,
    };
  }

  componentDidMount () {
    this.friendStoreListener = FriendStore.addListener(this.onFriendStoreChange.bind(this));

    this.setState({
      friendInvitationsSentToMe: FriendStore.friendInvitationsSentToMe(),
    });
  }

  componentWillUnmount () {
    this.friendStoreListener.remove();
  }

  onFriendStoreChange () {
    this.setState({
      friendInvitationsSentToMe: FriendStore.friendInvitationsSentToMe(),
    });
  }

  handleChange = (event, value) => {
    switch (value) {
      case 0:
        return historyPush('/ballot');
      case 1:
        return historyPush('/values');
      case 2:
        return historyPush('/friends');
      case 3:
        return historyPush('/settings/menu');
      default:
        return null;
    }
  };

  getSelectedTab = () => {
    const { pathname } = this.props;
    if (stringContains('/ballot', pathname)) return 0;
    if (stringContains('/friends', pathname)) return 2;
    if (stringContains('/value', pathname)) return 1; // '/values'
    if (stringContains('/settings/', pathname)) return 3;
    return -1;
  };

  handleNavigation = to => historyPush(to);

  render () {
    // console.log('FooterBar render');
    const numberOfIncomingFriendRequests = this.state.friendInvitationsSentToMe.length || 0;

    const badgeStyle = {
      display: 'inline-block',
    };

    return (
      <div className="footer-container u-show-mobile-tablet">
        <BottomNavigation value={this.getSelectedTab()} onChange={this.handleChange} showLabels>
          <BottomNavigationAction className="no-outline" id="ballotTabFooterBar" label="Ballot" showLabel icon={<DescriptionIcon />} />
          <BottomNavigationAction className="no-outline" id="valuesTabFooterBar" label="Values" showLabel icon={<QuestionAnswerIcon />} />
          <BottomNavigationAction
            className="no-outline"
            id="friendsTabFooterBar"
            label="Friends"
            showLabel
            icon={(
              <Badge badgeContent={numberOfIncomingFriendRequests} color="primary" max={9} style={badgeStyle} onClick={() => this.handleNavigation('/friends')}>
                <PeopleIcon />
              </Badge>
            )}
          />
          {/* <BottomNavigationAction className="no-outline" id="voteTabFooterBar" label="Vote" showLabel icon={<ion-icon class="footer-icon" name="clipboard" />} /> */}
          <BottomNavigationAction className="no-outline" id="settingsTabFooterBar" label="Settings" showLabel icon={<SettingsIcon />} />
        </BottomNavigation>
      </div>
    );
  }
}

export default FooterBar;
