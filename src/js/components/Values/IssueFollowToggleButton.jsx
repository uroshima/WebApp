import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import IssueActions from '../../actions/IssueActions';
import IssueStore from '../../stores/IssueStore';
import { renderLog } from '../../utils/logging';
import VoterStore from '../../stores/VoterStore';
import { showToastError, showToastSuccess } from '../../utils/showToast';
import { historyPush } from '../../utils/cordovaUtils';

export default class IssueFollowToggleButton extends Component {
  static propTypes = {
    ballotItemWeVoteId: PropTypes.string,
    currentBallotIdInUrl: PropTypes.string,
    issueWeVoteId: PropTypes.string.isRequired,
    issueName: PropTypes.string.isRequired,
    onIssueFollowFunction: PropTypes.func,
    onIssueStopFollowingFunction: PropTypes.func,
    urlWithoutHash: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      isFollowing: false,
    };
    this.onIssueFollow = this.onIssueFollow.bind(this);
    this.onIssueStopFollowing = this.onIssueStopFollowing.bind(this);
  }

  componentDidMount () {
    const isFollowing = IssueStore.isVoterFollowingThisIssue(this.props.issueWeVoteId);
    this.setState({ isFollowing });
  }

  onIssueFollow () {
    // This check is necessary as we enable follow when user clicks on Issue text
    if (!this.state.isFollowing) {
      this.setState({ isFollowing: true });
      IssueActions.issueFollow(this.props.issueWeVoteId, VoterStore.electionId());
      if (this.props.onIssueFollowFunction) {
        this.props.onIssueFollowFunction(this.props.issueWeVoteId);
      }

      showToastSuccess(`Now following ${this.props.issueName}!`);
    }

    const { currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId } = this.props;
    if (currentBallotIdInUrl !== ballotItemWeVoteId) {
      historyPush(`${urlWithoutHash}#${this.props.ballotItemWeVoteId}`);
    }
  }

  onIssueStopFollowing () {
    this.setState({ isFollowing: false });
    IssueActions.issueStopFollowing(this.props.issueWeVoteId, VoterStore.electionId());
    // console.log("IssueFollowToggleButton, this.props.ballotItemWeVoteId:", this.props.ballotItemWeVoteId);
    if (this.props.ballotItemWeVoteId) {
      IssueActions.removeBallotItemIssueScoreFromCache(this.props.ballotItemWeVoteId);
    }
    if (this.props.onIssueStopFollowingFunction) {
      this.props.onIssueStopFollowingFunction(this.props.issueWeVoteId);
    }
    showToastError(`You've stopped following ${this.props.issueName}.`);
    const { currentBallotIdInUrl, urlWithoutHash, ballotItemWeVoteId } = this.props;
    if (currentBallotIdInUrl !== ballotItemWeVoteId) {
      historyPush(`${urlWithoutHash}#${this.props.ballotItemWeVoteId}`);
    }
  }

  render () {
    renderLog(__filename);
    if (!this.state) { return <div />; }

    return this.state.isFollowing ? (
      <div className="u-flex u-items-center u-justify-between card-main intro-modal__text-dark" style={{ padding: '0', margin: '-2px' }}>
        <Button variant="warning"
          size="small"
          onClick={this.onIssueStopFollowing}
          style={{ backgroundColor: '#2E3C5D', borderColor: '#2E3C5D', borderRadius: '0px 0.25rem 0.25rem 0px' }}
        >
          <span>Following</span>
        </Button>
      </div>
    ) : (
      <div className="u-flex u-items-center u-justify-between card-main intro-modal__text-dark" style={{ padding: '0', margin: '-2px' }}>
        <Button variant="success"
          size="small"
          onClick={this.onIssueFollow}
          style={{ backgroundColor: '#2E3C5D', borderColor: '#2E3C5D', borderRadius: '0px 0.25rem 0.25rem 0px' }}
        >
          <span>Follow</span>
        </Button>
      </div>
    );
  }
}
