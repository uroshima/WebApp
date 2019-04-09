import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import BallotSearchResults from '../../components/Ballot/BallotSearchResults';
import BallotActions from '../../actions/BallotActions';
import BallotStore from '../../stores/BallotStore';
import FooterDoneBar from '../../components/Navigation/FooterDoneBar';
import { renderLog } from '../../utils/logging';
import { cordovaDot, historyPush } from '../../utils/cordovaUtils';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationPositionItem from '../../components/VoterGuide/OrganizationPositionItem';
import OrganizationStore from '../../stores/OrganizationStore';
import VoterGuideActions from '../../actions/VoterGuideActions';
import VoterGuideStore from '../../stores/VoterGuideStore';
import VoterStore from '../../stores/VoterStore';
import { isProperlyFormattedVoterGuideWeVoteId } from '../../utils/textFormat';


export default class VoterGuideChoosePositions extends Component {
  static propTypes = {
    params: PropTypes.object,
  };

  constructor (props) {
    super(props);
    this.state = {
      clearSearchTextNow: false,
      searchIsUnderway: false,
      linkedOrganizationWeVoteId: '',
      organization: {},
      voter: {},
      voterGuide: {},
      voterGuideWeVoteId: '',
    };
    this.clearSearch = this.clearSearch.bind(this);
    this.searchUnderway = this.searchUnderway.bind(this);
    this.onOrganizationStoreChange = this.onOrganizationStoreChange.bind(this);
    this.goToVoterGuideDisplay = this.goToVoterGuideDisplay.bind(this);
  }

  componentWillMount () {
    document.body.style.backgroundColor = '#A3A3A3';
    document.body.className = 'story-view';
  }

  componentDidMount () {
    // Get Voter Guide information
    let voterGuide;
    let voterGuideFound = false;
    if (this.props.params.voter_guide_we_vote_id && isProperlyFormattedVoterGuideWeVoteId(this.props.params.voter_guide_we_vote_id)) {
      this.setState({
        voterGuideWeVoteId: this.props.params.voter_guide_we_vote_id,
      });
      voterGuide = VoterGuideStore.getVoterGuideByVoterGuideId(this.props.params.voter_guide_we_vote_id);
      if (voterGuide && voterGuide.we_vote_id) {
        this.setState({
          voterGuide,
        });
        voterGuideFound = true;
        if (voterGuide.google_civic_election_id && voterGuide.google_civic_election_id !== BallotStore.currentBallotGoogleCivicElectionId) {
          // console.log("VoterGuideSettingsDashboard componentDidMount retrieving ballot for: ", voterGuide.google_civic_election_id);
          BallotActions.voterBallotItemsRetrieve(voterGuide.google_civic_election_id, '', '');
        }
      }
    }
    // Get Voter and Voter's Organization
    const voter = VoterStore.getVoter();
    if (voter) {
      this.setState({ voter });
      const linkedOrganizationWeVoteId = voter.linked_organization_we_vote_id;
      // console.log("voterGuideChoosePositions componentDidMount linkedOrganizationWeVoteId: ", linkedOrganizationWeVoteId);
      if (linkedOrganizationWeVoteId) {
        this.setState({
          linkedOrganizationWeVoteId,
        });
        const organization = OrganizationStore.getOrganizationByWeVoteId(linkedOrganizationWeVoteId);
        if (organization && organization.organization_we_vote_id) {
          this.setState({
            organization,
          });
          // Positions for this organization, for this election
          if (voterGuide && voterGuide.google_civic_election_id) {
            OrganizationActions.positionListForOpinionMaker(organization.organization_we_vote_id, false, true, voterGuide.google_civic_election_id);
            OrganizationActions.positionListForOpinionMaker(organization.organization_we_vote_id, true, false, voterGuide.google_civic_election_id);
          }
        } else {
          OrganizationActions.organizationRetrieve(linkedOrganizationWeVoteId);
        }
        if (!voterGuideFound) {
          // console.log("voterGuideChoosePositions voterGuide NOT FOUND calling VoterGuideActions.voterGuidesRetrieve");
          VoterGuideActions.voterGuidesRetrieve(linkedOrganizationWeVoteId);
        }
      }
    }
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.edit_mode) {
      this.setState({ editMode: nextProps.params.edit_mode });
    }
    if (nextProps.params.voter_guide_we_vote_id && isProperlyFormattedVoterGuideWeVoteId(nextProps.params.voter_guide_we_vote_id)) {
      this.setState({
        voterGuide: VoterGuideStore.getVoterGuideByVoterGuideId(nextProps.params.voter_guide_we_vote_id),
        voterGuideWeVoteId: nextProps.params.voter_guide_we_vote_id,
      });
    }
    const voter = VoterStore.getVoter();
    if (voter && voter.we_vote_id) {
      this.setState({ voter });
    }
  }

  componentWillUnmount () {
    document.body.style.backgroundColor = null;
    document.body.className = '';
    this.organizationStoreListener.remove();
    this.voterGuideStoreListener.remove();
    this.voterStoreListener.remove();
    this.timer = null;
  }


  onOrganizationStoreChange () {
    const { linkedOrganizationWeVoteId } = this.state;
    // console.log("voterGuideChoosePositions onOrganizationStoreChange, org_we_vote_id: ", this.state.linkedOrganizationWeVoteId);
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(linkedOrganizationWeVoteId),
    });
  }

  onVoterGuideStoreChange () {
    // console.log("voterGuideChoosePositions onVoterGuideStoreChange, this.state.voterGuideWeVoteId", this.state.voterGuideWeVoteId);
    if (this.state.voterGuideWeVoteId && isProperlyFormattedVoterGuideWeVoteId(this.state.voterGuideWeVoteId)) {
      const voterGuide = VoterGuideStore.getVoterGuideByVoterGuideId(this.state.voterGuideWeVoteId);
      if (voterGuide && voterGuide.we_vote_id) {
        // console.log("voterGuideChoosePositions onVoterGuideStoreChange voterGuide FOUND");
        this.setState({
          voterGuide,
        });
      }
    }
  }

  onVoterStoreChange () {
    const voter = VoterStore.getVoter();
    if (voter && voter.we_vote_id) {
      this.setState({ voter });
    }
    const linkedOrganizationWeVoteId = voter.linked_organization_we_vote_id;
    // console.log("voterGuideChoosePositions onVoterStoreChange linkedOrganizationWeVoteId: ", linkedOrganizationWeVoteId);
    if (linkedOrganizationWeVoteId && this.state.linkedOrganizationWeVoteId !== linkedOrganizationWeVoteId) {
      OrganizationActions.organizationRetrieve(linkedOrganizationWeVoteId);
      this.setState({
        linkedOrganizationWeVoteId,
      });
    }
    if (linkedOrganizationWeVoteId) {
      let voterGuideNeeded = true;
      if (this.state.voterGuide && this.state.voterGuide.we_vote_id) {
        voterGuideNeeded = false;
      }
      if (voterGuideNeeded) {
        // console.log("voterGuideChoosePositions onVoterStoreChange calling VoterGuideActions.voterGuidesRetrieve");
        VoterGuideActions.voterGuidesRetrieve(linkedOrganizationWeVoteId);
      }
    }
  }

  // This function is called by BallotSearchResults and SearchBar when an API search has been cleared
  clearSearch () {
    // console.log("VoterGuideSettingsPositions, clearSearch");
    this.setState({
      clearSearchTextNow: true,
      searchIsUnderway: false,
    });
  }

  // This function is called by BallotSearchResults and SearchBar when an API search has been triggered
  searchUnderway (searchIsUnderway) {
    // console.log("VoterGuideSettingsPositions, searchIsUnderway: ", searchIsUnderway);
    this.setState({
      clearSearchTextNow: false,
      searchIsUnderway,
    });
  }

  goToVoterGuideDisplay () {
    const voterGuideDisplay = `/voterguide/${this.state.voterGuide.organization_we_vote_id}/ballot/election/${this.state.voterGuide.google_civic_election_id}/ballot`;

    historyPush(voterGuideDisplay);
  }

  render () {
    renderLog(__filename);

    const { positionListForOneElection } = this.state.organization;

    let lookingAtSelf = false;
    if (this.state.voter) {
      lookingAtSelf = this.state.voter.linked_organization_we_vote_id === this.state.organization.organization_we_vote_id;
    }

    // console.log("lookingAtSelf: ", lookingAtSelf);
    const electionName = BallotStore.currentBallotElectionName;
    const atLeastOnePositionFoundForThisElection = positionListForOneElection && positionListForOneElection.length !== 0;

    const iconSize = 18;
    const iconColor = '#ccc'; // "#999";

    return (
      <div>
        <Helmet title="Choose Positions - We Vote" />
        <div className="create-voter-guide container well">
          <a href="/voterguidepositions/:voter_guide_we_vote_id" onClick={this.goToVoterGuideDisplay}>
            <img src={cordovaDot('/img/global/icons/x-close.png')} className="x-close" alt="close" />
          </a>
          <div className="create-voter-guide__h1 xs-text-left">Enter Your Positions</div>
          <div className="create-voter-guide__steps xs-text-left">
            Step 5 of 5
          </div>
          <div className="create-voter-guide__description xs-text-left">
            Search for candidates or measures, and
            click
            {' '}
            <span className="u-no-break">
              <span className="btn__icon">
                <img src={cordovaDot('/img/global/svg-icons/thumbs-up-icon.svg')}
                     width={iconSize}
                     height={iconSize}
                     color={iconColor}
                     alt="thumbs up"
                />
              </span>
              {' '}
              Support
            </span>
            {' '}
            or&nbsp;
            <span className="u-no-break">
              <span className="btn__icon">
                <img src={cordovaDot('/img/global/svg-icons/thumbs-down-icon.svg')}
                     width={iconSize}
                     height={iconSize}
                     color={iconColor}
                     alt="thumbs down"
                />
              </span>
              {' '}
              Oppose
            </span>
            {' '}
            to add them to your ballot.
          </div>
          <div className="row">
            <div className="col-1 col-md-2">&nbsp;</div>
            <div className="col-10 col-md-8">
              <div className="card">
                <div className="card-main">
                  <h4 className="h4 card__additional-heading">
                    <span className="u-push--sm">{ electionName || 'This Election'}</span>
                  </h4>
                  { lookingAtSelf ? (
                    <div className="u-margin-left--md u-push--md">
                      <BallotSearchResults
                        clearSearchTextNow={this.state.clearSearchTextNow}
                        googleCivicElectionId={this.state.voterGuide.google_civic_election_id}
                        organizationWeVoteId={this.state.voter.linked_organization_we_vote_id}
                        searchUnderwayFunction={this.searchUnderway}
                      />
                    </div>
                  ) : null
                  }

                  { atLeastOnePositionFoundForThisElection && !this.state.searchIsUnderway ? (
                    <span>
                      { positionListForOneElection.map(item => (
                        <OrganizationPositionItem
                          key={item.position_we_vote_id}
                          position={item}
                          organization={this.state.organization}
                          editMode={this.state.editMode}
                        />
                      )) }
                    </span>
                  ) : null
                  }
                </div>
              </div>

              <div className="fa-pull-right">
                <button
                  type="button"
                  className="btn btn-lg btn-success"
                  onClick={this.goToVoterGuideDisplay}
                >
                  See Full Ballot&nbsp;&nbsp;&gt;
                </button>
              </div>

              <div className="clearfix" />

              { this.state.searchIsUnderway ?
                <div className="u-stack--xl" /> :
                <div className="u-stack--md" /> }

              {this.state.searchIsUnderway ? (
                <span>
                  <FooterDoneBar doneFunction={this.clearSearch} doneButtonText="Clear Search" />
                </span>
              ) : null
              }
            </div>
            <div className="col-1 col-md-2">&nbsp;</div>
          </div>
        </div>
      </div>
    );
  }
}
