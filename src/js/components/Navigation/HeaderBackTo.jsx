import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import AppStore from '../../stores/AppStore';
import AppActions from '../../actions/AppActions';
import cookies from '../../utils/cookies';
import { hasIPhoneNotch, isWebApp } from '../../utils/cordovaUtils';
import HeaderBarProfilePopUp from './HeaderBarProfilePopUp';
import OrganizationActions from '../../actions/OrganizationActions';
import { renderLog } from '../../utils/logging';
import VoterGuideActions from '../../actions/VoterGuideActions';
import VoterSessionActions from '../../actions/VoterSessionActions';
import HeaderBackToButton from './HeaderBackToButton';
import SignInModal from '../Widgets/SignInModal';

class HeaderBackTo extends Component {
  static propTypes = {
    backToLink: PropTypes.string,
    backToLinkText: PropTypes.string,
    classes: PropTypes.object,
    location: PropTypes.object,
    params: PropTypes.object.isRequired,
    voter: PropTypes.object,
  };

  constructor (props) {
    super(props);
    this.state = {
      profilePopUpOpen: false,
      showSignInModal: AppStore.showSignInModal(),
      voter: {},
    };
    this.toggleAccountMenu = this.toggleAccountMenu.bind(this);
    this.hideAccountMenu = this.hideAccountMenu.bind(this);
    this.hideProfilePopUp = this.hideProfilePopUp.bind(this);
    this.signOutAndHideProfilePopUp = this.signOutAndHideProfilePopUp.bind(this);
    this.toggleProfilePopUp = this.toggleProfilePopUp.bind(this);
    this.toggleSignInModal = this.toggleSignInModal.bind(this);
    this.transitionToYourVoterGuide = this.transitionToYourVoterGuide.bind(this);
  }

  componentDidMount () {
    // console.log('HeaderBackTo componentDidMount, this.props: ', this.props);
    this.appStoreListener = AppStore.addListener(this.onAppStoreChange.bind(this));

    const weVoteBrandingOffFromUrl = this.props.location.query ? this.props.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem('we_vote_branding_off');
    this.setState({
      voter: this.props.voter,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  componentWillReceiveProps (nextProps) {
    // console.log('HeaderBackTo componentWillReceiveProps, nextProps: ', nextProps);
    const weVoteBrandingOffFromUrl = nextProps.location.query ? nextProps.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem('we_vote_branding_off');
    this.setState({
      voter: nextProps.voter,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  componentWillUnmount () {
    this.appStoreListener.remove();
  }

  onAppStoreChange () {
    this.setState({
      showSignInModal: AppStore.showSignInModal(),
    });
  }

  transitionToYourVoterGuide () {
    // Positions for this organization, for this voter / election
    OrganizationActions.positionListForOpinionMaker(this.state.voter.linked_organization_we_vote_id, true);

    // Positions for this organization, NOT including for this voter / election
    OrganizationActions.positionListForOpinionMaker(this.state.voter.linked_organization_we_vote_id, false, true);
    OrganizationActions.organizationsFollowedRetrieve();
    VoterGuideActions.voterGuideFollowersRetrieve(this.state.voter.linked_organization_we_vote_id);
    VoterGuideActions.voterGuidesFollowedByOrganizationRetrieve(this.state.voter.linked_organization_we_vote_id);
    this.setState({ profilePopUpOpen: false });
  }

  hideAccountMenu () {
    this.setState({ profilePopUpOpen: false });
  }

  toggleAccountMenu () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  toggleProfilePopUp () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  toggleSignInModal () {
    const { showSignInModal } = this.state;
    AppActions.setShowSignInModal(!showSignInModal);
  }

  hideProfilePopUp () {
    this.setState({ profilePopUpOpen: false });
  }

  signOutAndHideProfilePopUp () {
    VoterSessionActions.voterSignOut();
    this.setState({ profilePopUpOpen: false });
  }

  signOutAndHideAccountMenu () {
    VoterSessionActions.voterSignOut();
    this.setState({ profilePopUpOpen: false });
  }

  render () {
    renderLog(__filename);
    const { voter } = this.state;
    const { backToLink, backToLinkText, classes } = this.props;
    const voterPhotoUrlMedium = voter.voter_photo_url_medium;

    const headerClassName = (function header () {
      if (isWebApp()) {
        return 'page-header';
      } else {
        return hasIPhoneNotch() ? 'page-header page-header__cordova-iphonex' : 'page-header page-header__cordova';
      }
    }());

    return (
      <AppBar className={headerClassName} color="default">
        <Toolbar className="header-toolbar header-backto-toolbar" disableGutters>
          <HeaderBackToButton
            backToLink={backToLink}
            backToLinkText={backToLinkText}
            id="backToLinkTabHeader"
          />

          {this.state.profilePopUpOpen && voter.is_signed_in && (
          <HeaderBarProfilePopUp
            {...this.props}
            onClick={this.toggleProfilePopUp}
            profilePopUpOpen={this.state.profilePopUpOpen}
            weVoteBrandingOff={this.state.we_vote_branding_off}
            toggleProfilePopUp={this.toggleProfilePopUp}
            toggleSignInModal={this.toggleSignInModal}
            hideProfilePopUp={this.hideProfilePopUp}
            transitionToYourVoterGuide={this.transitionToYourVoterGuide}
            signOutAndHideProfilePopUp={this.signOutAndHideProfilePopUp}
          />
          )}

          {isWebApp() && (
          <div className="header-nav__avatar-wrapper u-cursor--pointer u-flex-none" onClick={this.toggleAccountMenu}>
            {voterPhotoUrlMedium ? (
              <div id="profileAvatarHeaderBar" className="header-nav__avatar-container">
                <img
                  className="header-nav__avatar"
                  alt="profile avatar"
                  src={voterPhotoUrlMedium}
                  height={34}
                  width={34}
                />
              </div>
            ) : (
              <Button
                className="header-sign-in"
                classes={{ root: classes.headerButtonRoot }}
                color="primary"
                id="signInHeaderBar"
                onClick={this.toggleSignInModal}
                variant="text"
              >
              Sign In
              </Button>
            )}
          </div>
          )}
        </Toolbar>
        {
          this.state.showSignInModal ? (
            <SignInModal
              show
              toggleFunction={this.toggleSignInModal}
            />
          ) : null
        }
      </AppBar>
    );
  }
}

const styles = theme => ({
  headerButtonRoot: {
    paddingTop: 2,
    paddingBottom: 2,
    '&:hover': {
      backgroundColor: 'transparent',
    },
    color: 'rgb(6, 95, 212)',
    marginLeft: '1rem',
    outline: 'none !important',
    [theme.breakpoints.down('md')]: {
      marginLeft: '.1rem',
    },
  },
});

export default withStyles(styles)(HeaderBackTo);

