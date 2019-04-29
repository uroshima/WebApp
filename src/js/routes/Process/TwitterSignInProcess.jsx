import { Component } from 'react';
import AppActions from '../../actions/AppActions';
import cookies from '../../utils/cookies';
import { historyPush } from '../../utils/cordovaUtils';
import LoadingWheel from '../../components/LoadingWheel';
import { oAuthLog, renderLog } from '../../utils/logging';
import TwitterActions from '../../actions/TwitterActions';
import TwitterStore from '../../stores/TwitterStore';
import VoterStore from '../../stores/VoterStore';
import VoterActions from '../../actions/VoterActions';

// This will be needed in the future
// import WouldYouLikeToMergeAccounts from "../../components/WouldYouLikeToMergeAccounts";

export default class TwitterSignInProcess extends Component {
  static propTypes = {
  };

  constructor (props) {
    super(props);
    this.state = {
      twitterAuthResponse: {},
      yesPleaseMergeAccounts: false,
      mergingTwoAccounts: false,
    };
    // These will be needed in the future
    // this.cancelMergeFunction = this.cancelMergeFunction.bind(this);
    // this.yesPleaseMergeAccounts = this.yesPleaseMergeAccounts.bind(this);
  }

  componentDidMount () {
    this.twitterStoreListener = TwitterStore.addListener(this.onTwitterStoreChange.bind(this));
    this.twitterSignInRetrieve();
  }

  componentWillUnmount () {
    this.twitterStoreListener.remove();
  }

  onTwitterStoreChange () {
    this.setState({
      twitterAuthResponse: TwitterStore.getTwitterAuthResponse(),
    });
  }

  // This will be needed in the future
  // cancelMergeFunction () {
  //   historyPush({
  //     pathname: "/more/network",
  //     state: {
  //     },
  //   });
  //   // message: "You have chosen to NOT merge your two accounts.",
  //   // message_type: "success"
  // }

  voterMergeTwoAccountsByTwitterKey (twitterSecretKey, voterHasDataToPreserve = true) {
    if (this.state.mergingTwoAccounts) {
      // console.log("In process of mergingTwoAccounts");
    } else {
      // console.log("About to make API call");
      VoterActions.voterMergeTwoAccountsByTwitterKey(twitterSecretKey);
      // Prevent voterMergeTwoAccountsByFacebookKey from being called multiple times
      this.setState({ mergingTwoAccounts: true });
    }
    let redirectPathname = '';
    const signInStartPath = cookies.getItem('sign_in_start_path');
    if (voterHasDataToPreserve) {
      redirectPathname = '/more/network';
      if (signInStartPath) {
        redirectPathname = signInStartPath;
        AppActions.unsetStoreSignInStartPath();
        cookies.removeItem('sign_in_start_path', '/');
      }
      historyPush({
        pathname: redirectPathname,
        state: {
          message: 'Your accounts have been merged.',
          message_type: 'success',
        },
      });
    } else {
      redirectPathname = '/ballot';
      if (signInStartPath) {
        redirectPathname = signInStartPath;
        AppActions.unsetStoreSignInStartPath();
        cookies.removeItem('sign_in_start_path', '/');
      }
      historyPush({
        pathname: redirectPathname,
        query: { wait_until_voter_sign_in_completes: 1 },
        state: {
          message: 'You have successfully signed in with Twitter.',
          message_type: 'success',
        },
      });
    }
  }

  // This creates the public.twitter_twitterlinktovoter entry, which is needed
  // to establish is_signed_in within the voter.voter
  voterTwitterSaveToCurrentAccount () {
    VoterActions.voterTwitterSaveToCurrentAccount();
    let redirectPathname = '/more/network';
    const signInStartPath = cookies.getItem('sign_in_start_path');
    if (signInStartPath) {
      redirectPathname = signInStartPath;
      AppActions.unsetStoreSignInStartPath();
      cookies.removeItem('sign_in_start_path', '/');
    }
    historyPush({
      pathname: redirectPathname,
      state: {
        message: 'You have successfully signed in with Twitter.',
        message_type: 'success',
      },
    });
    if (VoterStore.getVoterPhotoUrlMedium().length === 0) {
      // This only fires once, for brand new users on their very first login
      VoterActions.voterRetrieve();
    }
  }

  twitterSignInRetrieve () {
    TwitterActions.twitterSignInRetrieve();
  }

  // This will be needed in the future
  // yesPleaseMergeAccounts () {
  //   this.setState({ yesPleaseMergeAccounts: true });
  // }

  render () {
    renderLog(__filename);
    const { twitterAuthResponse, yesPleaseMergeAccounts } = this.state;

    oAuthLog('TwitterSignInProcess render');
    if (!twitterAuthResponse ||
      !twitterAuthResponse.twitter_retrieve_attempted) {
      // console.log('STOPPED, missing twitter_retrieve_attempted: twitterAuthResponse:', twitterAuthResponse);
      return LoadingWheel;
    }
    oAuthLog('=== Passed initial gate ===');
    oAuthLog('twitterAuthResponse:', twitterAuthResponse);
    const { twitter_secret_key: twitterSecretKey } = twitterAuthResponse;

    if (twitterAuthResponse.twitter_sign_in_failed) {
      oAuthLog('Twitter sign in failed - push to /settings/account');
      historyPush({
        pathname: '/settings/account',
        state: {
          message: 'Twitter sign in failed. Please try again.',
          message_type: 'success',
        },
      });
      return LoadingWheel;
    }

    if (yesPleaseMergeAccounts) {
      // Go ahead and merge this voter record with the voter record that the twitterSecretKey belongs to
      oAuthLog('this.voterMergeTwoAccountsByTwitterKey -- yes please merge accounts');
      this.voterMergeTwoAccountsByTwitterKey(twitterSecretKey);
      return LoadingWheel;
    }

    // This process starts when we return from attempting voterTwitterSignInRetrieve
    // If twitter_sign_in_found NOT True, go back to the sign in page to try again
    if (!twitterAuthResponse.twitter_sign_in_found) {
      oAuthLog('twitterAuthResponse.twitter_sign_in_found', twitterAuthResponse.twitter_sign_in_found);
      historyPush({
        pathname: '/settings/account',
        state: {
          message: 'Twitter authentication not found. Please try again.',
          message_type: 'warning',
        },
      });
      return LoadingWheel;
    }

    // Is there a collision of two accounts?
    if (twitterAuthResponse.existing_twitter_account_found) {
      // For now are not asking to merge accounts
      this.voterMergeTwoAccountsByTwitterKey(twitterSecretKey, twitterAuthResponse.voter_has_data_to_preserve);
      return LoadingWheel;

      // In the future we want to use the following code to ask people before we merge their current account into
      //  their account that they previously signed into Twitter with

      // // Is there anything to save from this voter account?
      // if (twitterAuthResponse.voter_has_data_to_preserve) {
      //   // console.log("TwitterSignInProcess voterHasDataToPreserve is TRUE");
      //   const cancelMergeFunction = this.cancelMergeFunction;
      //   const pleaseMergeAccountsFunction = this.yesPleaseMergeAccounts;
      //   // Display the question of whether to merge accounts or not
      //   return (
      //     <WouldYouLikeToMergeAccounts
      //       cancelMergeFunction={cancelMergeFunction}
      //       pleaseMergeAccountsFunction={pleaseMergeAccountsFunction}
      //     />
      //   );
      //   // return <span>WouldYouLikeToMergeAccounts</span>;
      // } else {
      //   // Go ahead and merge the accounts, which means deleting the current voter and switching to the twitter-linked account
      //   // console.log("TwitterSignInProcess this.voterMergeTwoAccountsByTwitterKey - No data to merge");
      //   this.voterMergeTwoAccountsByTwitterKey(twitterSecretKey, twitterAuthResponse.voter_has_data_to_preserve);
      //   return LoadingWheel;
      // }
    } else {
      oAuthLog('Setting up new Twitter entry - voterTwitterSaveToCurrentAccount');
      this.voterTwitterSaveToCurrentAccount();
      return LoadingWheel;
    }
  }
}
