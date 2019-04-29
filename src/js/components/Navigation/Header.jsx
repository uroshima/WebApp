import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getApplicationViewBooleans } from '../../utils/applicationUtils';
import { hasIPhoneNotch, isAndroid, isCordova, isIOS, isWebApp } from '../../utils/cordovaUtils';
import HeaderBackToBallot from './HeaderBackToBallot';
import HeaderBackTo from './HeaderBackTo';
import HeaderBackToVoterGuides from './HeaderBackToVoterGuides';
import HeaderBar from './HeaderBar';
import { stringContains } from '../../utils/textFormat';
import { renderLog } from '../../utils/logging';


export default class Header extends Component {
  static propTypes = {
    params: PropTypes.object,
    location: PropTypes.object,
    pathname: PropTypes.string,
    voter: PropTypes.object,
    weVoteBrandingOff: PropTypes.bool,
  };

  componentDidUpdate () {
    // console.log("React Header ---------------   componentDidMount ()");
    // let heightA = $("#app-header").outerHeight();
    // let heightHC = $("#header-container").outerHeight();
    // let height2N = $("#secondary-nav-bar").outerHeight();
    // let heightW = $("#headroom-wrapper").outerHeight();
    // console.log("header rectangle height: " + heightA + ", " + heightHC + ", " + height2N + ", " + heightW);
  }

  render () {
    // console.log('Header render');
    renderLog(__filename);

    const { params, location, pathname, voter, weVoteBrandingOff } = this.props;
    const { friendsMode, settingsMode, valuesMode, voterGuideMode,
      showBackToFriends, showBackToBallotHeader, showBackToSettings, showBackToValues, showBackToVoterGuides } = getApplicationViewBooleans(pathname);
    // const hideGettingStartedButtons = voterGuideShowGettingStartedNavigation;
    let iPhoneSpacer = '';
    if (isCordova() && isIOS() && hasIPhoneNotch()) {
      iPhoneSpacer = <div className="ios-notched-spacer" />;
    } else if (isCordova() && isIOS() && !hasIPhoneNotch()) {
      iPhoneSpacer = <div className="ios-no-notch-spacer" />;
    }

    let pageHeaderStyle = weVoteBrandingOff ? 'page-header__container_branding_off headroom' : 'page-header__container headroom';
    if (isIOS()) {
      pageHeaderStyle = 'page-header__container headroom page-header-cordova-ios';   // Note March 2018: no headroom.js for Cordova
    } else if (isAndroid()) {
      pageHeaderStyle = 'page-header__container headroom';
    }

    if (voterGuideMode) {
      return (
        <div id="app-header">
          {iPhoneSpacer}
          <div className={isWebApp ? 'headroom-wrapper-webapp__voter-guide' : ''}>
            <div className={pageHeaderStyle} id="header-container">
              {showBackToBallotHeader ?
                <HeaderBackToBallot location={location} params={params} pathname={pathname} voter={voter} /> : (
                  <span>
                    {showBackToVoterGuides ?
                      <HeaderBackToVoterGuides location={location} params={params} pathname={pathname} voter={voter} /> :
                      <HeaderBar location={location} pathname={pathname} voter={voter} />
                    }
                  </span>
                )
              }
            </div>
          </div>
        </div>
      );
    } else if (settingsMode) {
      const backToSettingsLink = isWebApp() ? '/settings/menu' : '/more/hamburger';
      const backToSettingsLinkText = 'Settings';

      return (
        <div id="app-header">
          { iPhoneSpacer }
          <div className={isWebApp ? 'headroom-wrapper-webapp__default' : ''} id="headroom-wrapper">
            <div className={pageHeaderStyle} id="header-container">
              { showBackToSettings ? (
                <span>
                  <span className="d-block d-sm-none">
                    <HeaderBackTo backToLink={backToSettingsLink} backToLinkText={backToSettingsLinkText} location={location} params={params} voter={voter} />
                  </span>
                  <span className="d-none d-sm-block">
                    <HeaderBar location={location} pathname={pathname} voter={voter} />
                  </span>
                </span>
              ) : (
                <span>
                  { showBackToVoterGuides ?
                    <HeaderBackToVoterGuides location={location} params={params} pathname={pathname} voter={voter} /> :
                    <HeaderBar location={location} pathname={pathname} voter={voter} />
                  }
                </span>
              )
              }
            </div>
          </div>
        </div>
      );
    } else if (valuesMode) {
      let backToValuesLink = '/values';
      if (stringContains('/value/', pathname)) {
        backToValuesLink = '/values/list';
      }
      const backToValuesLinkText = 'Back';

      return (
        <div id="app-header">
          { iPhoneSpacer }
          <div className={isWebApp ? 'headroom-wrapper-webapp__default' : ''} id="headroom-wrapper">
            <div className={pageHeaderStyle} id="header-container">
              { showBackToValues ?
                <HeaderBackTo backToLink={backToValuesLink} backToLinkText={backToValuesLinkText} location={location} params={params} voter={voter} /> :
                <HeaderBar location={location} pathname={pathname} voter={voter} />
              }
            </div>
          </div>
        </div>
      );
    } else if (friendsMode) {
      const backToFriendsLink = '/friends';
      const backToFriendsLinkText = 'Back';

      return (
        <div id="app-header">
          { iPhoneSpacer }
          <div className={isWebApp ? 'headroom-wrapper-webapp__default' : ''} id="headroom-wrapper">
            <div className={pageHeaderStyle} id="header-container">
              { showBackToFriends ?
                <HeaderBackTo backToLink={backToFriendsLink} backToLinkText={backToFriendsLinkText} location={location} params={params} voter={voter} /> :
                <HeaderBar location={location} pathname={pathname} voter={voter} />
              }
            </div>
          </div>
        </div>
      );
    } else if (pathname === '/for-campaigns' ||
               pathname === '/for-organizations' ||
               pathname.startsWith('/how') ||
               pathname === '/more/about' ||
               pathname === '/welcome') {
      return null;
    } else {
      // This handles other pages, like the Ballot display
      return (
        <div id="app-header">
          { iPhoneSpacer }
          <div className={isWebApp() ?    // eslint-disable-line no-nested-ternary
            stringContains('/ballot', pathname) ? 'headroom-wrapper-webapp__ballot' : // eslint-disable-line no-nested-ternary
              stringContains('/office', pathname) ? 'headroom-wrapper-webapp__office' : 'headroom-wrapper-webapp__default' : ''}
            id="headroom-wrapper"
          >
            <div className={pageHeaderStyle} id="header-container">
              { showBackToBallotHeader ?
                <HeaderBackToBallot location={location} params={params} pathname={pathname} voter={voter} /> :
                <HeaderBar location={location} pathname={pathname} voter={voter} />
              }
            </div>
          </div>
        </div>
      );
    }
  }
}
