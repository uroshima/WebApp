import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {  Modal } from 'react-bootstrap'; // , OverlayTrigger, Popover
import { Link } from 'react-router';
// import TextTruncate from 'react-text-truncate';
import Slider from 'react-slick';
import { cordovaDot, historyPush, hasIPhoneNotch } from '../../utils/cordovaUtils';
import { toTitleCase } from '../../utils/textFormat';
import AnalyticsActions from '../../actions/AnalyticsActions';
import BallotIntroFollowIssues from './BallotIntroFollowIssues';
import BallotIntroFollowAdvisers from './BallotIntroFollowAdvisers';
import BallotIntroVerifyAddress from './BallotIntroVerifyAddress';
import CandidateStore from '../../stores/CandidateStore';
import ImageHandler from '../ImageHandler';
import IssuesByBallotItemDisplayList from '../Issues/IssuesByBallotItemDisplayList';
import IssueStore from '../../stores/IssueStore';
// import LearnMore from '../Widgets/LearnMore';
import { renderLog } from '../../utils/logging';
import OrganizationStore from '../../stores/OrganizationStore';
import SupportStore from '../../stores/SupportStore';
import VoterActions from '../../actions/VoterActions';
import VoterStore from '../../stores/VoterStore';
import VoterGuideStore from '../../stores/VoterGuideStore';

// December 2018:  We want to work toward being airbnb style compliant, but for now these are disabled in this file to minimize massive changes
/* eslint no-param-reassign: 0 */

const NUMBER_OF_CANDIDATES_TO_DISPLAY = 4;

// This is related to components/VoterGuide/VoterGuideOfficeItemCompressed
export default class OfficeItemCompressed extends Component {
  static propTypes = {
    allBallotItemsCount: PropTypes.number,
    we_vote_id: PropTypes.string.isRequired,
    ballot_item_display_name: PropTypes.string.isRequired,
    candidate_list: PropTypes.array,
    currentBallotIdInUrl: PropTypes.string,
    kind_of_ballot_item: PropTypes.string.isRequired,
    link_to_ballot_item_page: PropTypes.bool,
    organization: PropTypes.object,
    organization_we_vote_id: PropTypes.string,
    updateOfficeDisplayUnfurledTracker: PropTypes.func,
    urlWithoutHash: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      candidateList: [],
      maximumNumberOrganizationsToDisplay: NUMBER_OF_CANDIDATES_TO_DISPLAY,
      organization: {},
      showBallotIntroFollowIssues: false,
    };

    this.getCandidateLink = this.getCandidateLink.bind(this);
    this.getOfficeLink = this.getOfficeLink.bind(this);
    this.goToCandidateLink = this.goToCandidateLink.bind(this);
    this.goToOfficeLink = this.goToOfficeLink.bind(this);
    this._nextSliderPage = this._nextSliderPage.bind(this);
    this._toggleBallotIntroFollowIssues = this._toggleBallotIntroFollowIssues.bind(this);
  }

  componentDidMount () {
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.issueStoreListener = IssueStore.addListener(this.onIssueStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.supportStoreListener = SupportStore.addListener(this.onSupportStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.onVoterGuideStoreChange();
    this.onCandidateStoreChange();
    if (this.props.organization && this.props.organization.organization_we_vote_id) {
      this.setState({
        organization: this.props.organization,
      });
    }
  }

  componentWillReceiveProps (nextProps) {
    // console.log("officeItemCompressed componentWillReceiveProps, nextProps.candidate_list:", nextProps.candidate_list);
    // 2018-05-10 I don't think we need to trigger a new render because the incoming candidate_list should be the same
    // if (nextProps.candidate_list && nextProps.candidate_list.length) {
    //   this.setState({
    //     candidateList: nextProps.candidate_list,
    //   });
    // }

    // Only update organization if it is a different organization
    if (nextProps.organization && nextProps.organization.organization_we_vote_id && this.state.organization.organization_we_vote_id !== nextProps.organization.organization_we_vote_id) {
      this.setState({
        organization: OrganizationStore.getOrganizationByWeVoteId(nextProps.organization.organization_we_vote_id),
      });
    }
  }

  componentWillUnmount () {
    this.candidateStoreListener.remove();
    this.issueStoreListener.remove();
    this.organizationStoreListener.remove();
    this.supportStoreListener.remove();
    this.voterGuideStoreListener.remove();
  }

  // See https://reactjs.org/docs/error-boundaries.html
  static getDerivedStateFromError (error) { // eslint-disable-line no-unused-vars
    // Update state so the next render will show the fallback UI, We should have a "Oh snap" page
    return { hasError: true };
  }

  onCandidateStoreChange () {
    if (this.props.candidate_list && this.props.candidate_list.length && this.props.we_vote_id) {
      // console.log("onCandidateStoreChange");
      const newCandidateList = [];
      if (this.props.candidate_list) {
        this.props.candidate_list.forEach((candidate) => {
          if (candidate && candidate.we_vote_id) {
            newCandidateList.push(CandidateStore.getCandidate(candidate.we_vote_id));
          }
        });
      }
      this.setState({
        candidateList: newCandidateList,
      });
      // console.log(this.props.candidate_list);
    }
  }

  onIssueStoreChange () {
    this.setState();
  }

  onVoterGuideStoreChange () {
    this.setState();
  }

  onOrganizationStoreChange () {
    // console.log("VoterGuideOfficeItemCompressed onOrganizationStoreChange, org_we_vote_id: ", this.state.organization.organization_we_vote_id);
    const { organization } = this.state;
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(organization.organization_we_vote_id),
    });
  }

  onSupportStoreChange () {
    // Whenever positions change, we want to make sure to get the latest organization, because it has
    //  position_list_for_one_election and position_list_for_all_except_one_election attached to it
    const { organization } = this.state;
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(organization.organization_we_vote_id),
    });
  }

  getCandidateLink (candidateWeVoteId) {
    if (this.state.organization && this.state.organization.organization_we_vote_id) {
      // If there is an organization_we_vote_id, signal that we want to link back to voter_guide for that organization
      return `/candidate/${candidateWeVoteId}/btvg/${this.state.organization.organization_we_vote_id}`;
    } else {
      // If no organization_we_vote_id, signal that we want to link back to default ballot
      return `/candidate/${candidateWeVoteId}/b/btdb/`; // back-to-default-ballot
    }
  }

  getOfficeLink () {
    if (this.state.organization && this.state.organization.organization_we_vote_id) {
      // If there is an organization_we_vote_id, signal that we want to link back to voter_guide for that organization
      return `/office/${this.props.we_vote_id}/btvg/${this.state.organization.organization_we_vote_id}`;
    } else {
      // If no organization_we_vote_id, signal that we want to link back to default ballot
      return `/office/${this.props.we_vote_id}/b/btdb/`; // back-to-default-ballot
    }
  }

  componentDidCatch (error, info) {
    // We should get this information to Splunk!
    console.error('OfficeItemCompressed caught error: ', `${error} with info: `, info);
  }

  _toggleBallotIntroFollowIssues () {
    VoterActions.voterUpdateRefresh(); // Grab the latest voter information which includes interface_status_flags
    const { showBallotIntroFollowIssues } = this.state;
    if (!showBallotIntroFollowIssues) {
      AnalyticsActions.saveActionModalIssues(VoterStore.electionId());
    }

    this.setState({ showBallotIntroFollowIssues: !showBallotIntroFollowIssues });
  }

  _nextSliderPage () {
    VoterActions.voterUpdateRefresh(); // Grab the latest voter information which includes interface_status_flags
    this.refs.slider.slickNext();
  }

  goToCandidateLink (candidateWeVoteId) {
    const candidateLink = this.getCandidateLink(candidateWeVoteId);
    historyPush(candidateLink);
  }

  goToOfficeLink () {
    const officeLink = this.getOfficeLink();
    historyPush(officeLink);
  }

  render () {
    // console.log("OfficeItemCompressed render");
    renderLog(__filename);
    let { ballot_item_display_name: ballotItemDisplayName } = this.props;
    const { we_vote_id: weVoteId } = this.props;

    ballotItemDisplayName = toTitleCase(ballotItemDisplayName);
    const unsortedCandidateList = this.state.candidateList ? this.state.candidateList.slice(0) : {};
    const totalNumberOfCandidatesToDisplay = this.state.candidateList.length;
    const arrayOfCandidatesVoterSupports = [];
    // let advisersThatMakeVoterIssuesScoreDisplay;
    // let advisersThatMakeVoterNetworkScoreCount = 0;
    // let advisersThatMakeVoterNetworkScoreDisplay = null;
    // let atLeastOneCandidateChosenByIssueScore = false;
    // let candidateWeVoteWithMostSupportFromNetwork = null;
    // let candidateWeVoteIdWithHighestIssueScore = null;
    let voterSupportsAtLeastOneCandidate = false;
    let supportProps;
    let candidateHasVoterSupport;
    let voterIssuesScoreForCandidate;

    // Prepare an array of candidate names that are supported by voter
    unsortedCandidateList.forEach((candidate) => {
      supportProps = SupportStore.get(candidate.we_vote_id);
      if (supportProps) {
        candidateHasVoterSupport = supportProps.is_support;
        voterIssuesScoreForCandidate = IssueStore.getIssuesScoreByBallotItemWeVoteId(candidate.we_vote_id);
        candidate.voterNetworkScoreForCandidate = Math.abs(supportProps.support_count - supportProps.oppose_count);
        candidate.voterIssuesScoreForCandidate = Math.abs(voterIssuesScoreForCandidate);
        candidate.is_support = supportProps.is_support;
        if (candidateHasVoterSupport) {
          arrayOfCandidatesVoterSupports.push(candidate.ballot_item_display_name);
          voterSupportsAtLeastOneCandidate = true;
        }
      }
    });

    const sortedCandidateList = unsortedCandidateList;
    sortedCandidateList.sort((optionA, optionB) => optionB.voterNetworkScoreForCandidate - optionA.voterNetworkScoreForCandidate ||
                                                   (optionA.is_support === optionB.is_support ? 0 : optionA.is_support ? -1 : 1) ||  // eslint-disable-line no-nested-ternary
                                                   optionB.voterIssuesScoreForCandidate - optionA.voterIssuesScoreForCandidate);

    // If the voter isn't supporting any candidates, then figure out which candidate the voter's network likes the best
    if (arrayOfCandidatesVoterSupports.length === 0) {
      // This function finds the highest support count for each office but does not handle ties. If two candidates have
      // the same network support count, only the first candidate will be displayed.
      let largestNetworkSupportCount = 0;
      let networkSupportCount;
      let networkOpposeCount;
      let largestIssueScore = 0;
      sortedCandidateList.forEach((candidate) => {
        // Support in voter's network
        supportProps = SupportStore.get(candidate.we_vote_id);
        if (supportProps) {
          networkSupportCount = supportProps.support_count;
          networkOpposeCount = supportProps.oppose_count;

          if (networkSupportCount > networkOpposeCount) {
            if (networkSupportCount > largestNetworkSupportCount) {
              largestNetworkSupportCount = networkSupportCount;
            }
          }
        }
        // Support based on Issue score
        if (voterIssuesScoreForCandidate > largestIssueScore) {
          largestIssueScore = voterIssuesScoreForCandidate;
        }
      });
      // Candidate chosen by issue score
      // if (atLeastOneCandidateChosenByIssueScore) {
      //   // If there are issues the voter is following, we should attempt to to create a list of orgs that support or oppose this ballot item
      //   const organizationNameIssueSupportList = IssueStore.getOrganizationNameSupportListUnderThisBallotItem(candidateWeVoteIdWithHighestIssueScore);
      //   const organizationNameIssueSupportListDisplay =
      //     organizationNameIssueSupportList.map(organizationName => (
      //       <span key={organizationName} className="u-flex u-flex-row u-justify-start u-items-start">
      //         <img src={cordovaDot('/img/global/icons/thumbs-up-color-icon.svg')} width="20" height="20" />
      //         <span>&nbsp;</span>
      //         <span>
      //           {organizationName}
      //           {' '}
      //           <strong>+1</strong>
      //         </span>
      //       </span>
      //     ));
      //   const organizationNameIssueOpposeList = IssueStore.getOrganizationNameOpposeListUnderThisBallotItem(candidateWeVoteIdWithHighestIssueScore);
      //   const organizationNameIssueOpposeListDisplay =
      //     organizationNameIssueOpposeList.map(organizationName => (
      //       <span key={organizationName} className="u-flex u-flex-row u-justify-start u-items-start">
      //         <img src={cordovaDot('/img/global/icons/thumbs-down-color-icon.svg')} width="20" height="20" />
      //         <span>&nbsp;</span>
      //         <span>
      //           {organizationName}
      //           <strong>-1</strong>
      //         </span>
      //       </span>
      //     ));
      //   advisersThatMakeVoterIssuesScoreDisplay = (
      //     <span>
      //       { organizationNameIssueSupportList.length ? <span>{organizationNameIssueSupportListDisplay}</span> : null}
      //       { organizationNameIssueOpposeList.length ? <span>{organizationNameIssueOpposeListDisplay}</span> : null}
      //     </span>
      //   );
      //   advisersThatMakeVoterIssuesScoreCount = organizationNameIssueSupportList.length + organizationNameIssueOpposeList.length;
      // }

      // if (candidateWeVoteWithMostSupportFromNetwork) {
      //   // If there are issues the voter is following, we should attempt to to create a list of orgs that support or oppose this ballot item
      //   const nameNetworkSupportList = SupportStore.getNameSupportListUnderThisBallotItem(candidateWeVoteWithMostSupportFromNetwork);
      //   const nameNetworkSupportListDisplay =
      //     nameNetworkSupportList.map(speakerDisplayName => (
      //       <span key={speakerDisplayName} className="u-flex u-flex-row u-justify-start u-items-start">
      //         <img src={cordovaDot('/img/global/icons/thumbs-up-color-icon.svg')} width="20" height="20" alt="thumbs up" />
      //         <span>&nbsp;</span>
      //         <span>
      //           {speakerDisplayName}
      //           {' '}
      //           <strong>+1</strong>
      //         </span>
      //       </span>
      //     ));
      //   const nameNetworkOpposeList = SupportStore.getNameOpposeListUnderThisBallotItem(candidateWeVoteWithMostSupportFromNetwork);
      //   const nameNetworkOpposeListDisplay =
      //     nameNetworkOpposeList.map(speakerDisplayName => (
      //       <span key={speakerDisplayName} className="u-flex u-flex-row u-justify-start u-items-start">
      //         <img src={cordovaDot('/img/global/icons/thumbs-down-color-icon.svg')} width="20" height="20" alt="thumbs down" />
      //         <span>&nbsp;</span>
      //         <span>
      //           {speakerDisplayName}
      //           {' '}
      //           <strong>-1</strong>
      //         </span>
      //       </span>
      //     ));
      //   advisersThatMakeVoterNetworkScoreDisplay = (
      //     <span>
      //       { nameNetworkSupportList.length ? <span>{nameNetworkSupportListDisplay}</span> : null}
      //       { nameNetworkOpposeList.length ? <span>{nameNetworkOpposeListDisplay}</span> : null}
      //     </span>
      //   );
      //   advisersThatMakeVoterNetworkScoreCount = nameNetworkSupportList.length + nameNetworkOpposeList.length;
      // }
    }

    const sliderSettings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipe: true,
      accessibility: true,
      afterChange: this.afterChangeHandler,
      arrows: false,
    };
    let candidatePreviewCount = 0;
    const candidatePreviewLimit = this.state.maximumNumberOrganizationsToDisplay;
    const candidatePreviewList = [];
    let oneCandidateDisplay = <span />;
    const BallotIntroFollowIssuesModal = (
      <Modal
        bsPrefix="background-brand-blue modal"
        id="ballotIntroFollowIssuesId"
        show={this.state.showBallotIntroFollowIssues}
        onHide={() => this._toggleBallotIntroFollowIssues(this)}
      >
        <Modal.Body>
          <div className="intro-modal__close">
            <a onClick={this._toggleBallotIntroFollowIssues} className={`intro-modal__close-anchor ${hasIPhoneNotch() ? 'intro-modal__close-anchor-iphonex' : ''}`}>
              <img src={cordovaDot('/img/global/icons/x-close.png')} alt="close" />
            </a>
          </div>
          <Slider dotsClass="slick-dots intro-modal__gray-dots" className="calc-height intro-modal__height-full" ref="slider" {...sliderSettings}>
            <div className="intro-modal__height-full" key={1}><BallotIntroFollowIssues next={this._nextSliderPage} /></div>
            <div className="intro-modal__height-full" key={2}><BallotIntroFollowAdvisers next={this._nextSliderPage} /></div>
            <div className="intro-modal__height-full" key={3}><BallotIntroVerifyAddress next={this._toggleBallotIntroFollowIssues} manualFocus={this.state.current_page_index === 2} /></div>
          </Slider>
        </Modal.Body>
      </Modal>
    );

    return (
      <div className="card-main office-item">
        { BallotIntroFollowIssuesModal }
        <a className="anchor-under-header" name={weVoteId} />
        <div className="card-main__content">
          {/* Desktop */}
          <h2 className="u-f3 card-main__ballot-name u-gray-dark u-stack--sm">
            <span className="card-main__ballot-name-link u-cursor--pointer">
              <Link to={this.getOfficeLink()}>
                {ballotItemDisplayName}
              </Link>
            </span>
          </h2>
          {/* *************************
            Display either a) the candidates the voter supports, or b) the first several candidates running for this office
            ************************* */}
          <div>
            { this.state.candidateList.map((oneCandidate) => {
              if (!oneCandidate || !oneCandidate.we_vote_id) {
                return null;
              }

              const voterSupportsThisCandidate = SupportStore.get(oneCandidate.we_vote_id) && SupportStore.get(oneCandidate.we_vote_id).is_support;
              const candidatePartyText = oneCandidate.party && oneCandidate.party.length ? `${oneCandidate.party}. ` : '';

              // If at the end the candidates, none were chosen by voter, we use this preview list.
              candidatePreviewCount += 1;
              if (candidatePreviewCount <= candidatePreviewLimit) {
                oneCandidateDisplay = (
                  <div key={`candidate_preview-${oneCandidate.we_vote_id}`} className="u-stack--md u-gray-border-bottom">
                    <div className="o-media-object u-flex-auto u-min-50 u-push--sm u-stack--sm u-cursor--pointer">
                      {/* Candidate Image */}
                      <Link to={this.getCandidateLink(oneCandidate.we_vote_id)}>
                        <ImageHandler
                          className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm"
                          sizeClassName="icon-candidate-small u-push--sm "
                          imageUrl={oneCandidate.candidate_photo_url_large}
                          alt="candidate-photo"
                          kind_of_ballot_item="CANDIDATE"
                        />
                      </Link>
                      {/* Candidate Name */}
                      <div className="o-media-object__body u-flex u-flex-column u-flex-auto u-justify-between">
                        <Link to={this.getCandidateLink(oneCandidate.we_vote_id)}>
                          <h4 className="card-main__candidate-name card-main__candidate-name-link u-f5">
                            {oneCandidate.ballot_item_display_name}
                            <span className="u-margin-left--sm card-main__candidate-party-description">{candidatePartyText}</span>
                          </h4>
                        </Link>
                        <div>
                          {/* Issues related to this Candidate */}
                          <IssuesByBallotItemDisplayList
                            ballotItemWeVoteId={oneCandidate.we_vote_id}
                            placement="bottom"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
                candidatePreviewList.push(oneCandidateDisplay);
              }

              // If (and only if) the voter supports this candidate, display it now
              if (voterSupportsThisCandidate) {
                return (
                  <span key={`voter_supports_${oneCandidate.we_vote_id}`}>
                    <div className="u-flex u-items-center">
                      <div className="o-media-object u-flex-auto u-cursor--pointer u-stack--sm">
                        {/* Candidate Image */}
                        <Link to={this.getCandidateLink(oneCandidate.we_vote_id)}>
                          <ImageHandler
                            className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm"
                            sizeClassName="icon-candidate-small u-push--sm "
                            imageUrl={oneCandidate.candidate_photo_url_large}
                            alt="candidate-photo"
                            kind_of_ballot_item="CANDIDATE"
                          />
                        </Link>
                        {/* Candidate Name */}
                        <div className="u-flex-auto u-justify-between">
                          <Link to={this.getCandidateLink(oneCandidate.we_vote_id)}>
                            <h2 className="h5 candidate-h2">
                              {oneCandidate.ballot_item_display_name}
                            </h2>
                          </Link>
                        </div>
                      </div>
                      <div className="u-flex-none u-justify-end">
                        <Link to={this.getCandidateLink(oneCandidate.we_vote_id)}>
                          <span className="u-push--xs">Chosen by you</span>
                          <img src={cordovaDot('/img/global/svg-icons/thumbs-up-color-icon.svg')}
                               alt="Thumbs up"
                               width="24"
                               height="24"
                          />
                        </Link>
                      </div>
                    </div>
                  </span>
                );
              } else {
                return null;
              }
            })}
            {/* If voter hasn't chosen candidate, show options. */}
            { !voterSupportsAtLeastOneCandidate ?
              (
                <div>
                  { candidatePreviewList }
                </div>
              ) :
              null
            }
          </div>
          {' '}
          <Link to={this.getOfficeLink()}>
            <div className="BallotItem__view-more u-items-center u-no-break d-print-none">
              { totalNumberOfCandidatesToDisplay > this.state.maximumNumberOrganizationsToDisplay ? (
                <span>
                  {' '}
                  show all
                  {' '}
                  {totalNumberOfCandidatesToDisplay}
                  {' '}
                  candidates
                  <i className="material-icons ios-arrow">arrow_forward_ios</i>
                </span>
              ) : (
                <span>
                  show more
                  <i className="material-icons ios-arrow">arrow_forward_ios</i>
                </span>
              )
            }
            </div>
          </Link>
        </div>
      </div>
    );
  }
}
