import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import BallotActions from '../../actions/BallotActions';
import { renderLog } from '../../utils/logging';

class BallotDecisionsTabs extends Component {
  static propTypes = {
    completionLevelFilterType: PropTypes.string,
    ballotLength: PropTypes.number,
    ballotLengthRemaining: PropTypes.number,
    classes: PropTypes.object,
  };

  shouldComponentUpdate (nextProps) {
    // This lifecycle method tells the component to NOT render if componentWillReceiveProps didn't see any changes
    // console.log("BallotDecisionsTabs shouldComponentUpdate");
    if (this.props.completionLevelFilterType !== nextProps.completionLevelFilterType) {
      // console.log("shouldComponentUpdate: this.props.completionLevelFilterType", this.props.completionLevelFilterType, ", nextProps.completionLevelFilterType", nextProps.completionLevelFilterType);
      return true;
    }
    if (this.props.ballotLength !== nextProps.ballotLength) {
      // console.log("shouldComponentUpdate: this.props.ballotLength", this.props.ballotLength, ", nextProps.ballotLength", nextProps.ballotLength);
      return true;
    }
    if (this.props.ballotLengthRemaining !== nextProps.ballotLengthRemaining) {
      // console.log("shouldComponentUpdate: this.props.ballotLengthRemaining", this.props.ballotLengthRemaining, ", nextProps.ballotLengthRemaining", nextProps.ballotLengthRemaining);
      return true;
    }
    return false;
  }

  getSelectedTab = () => {
    const { ballotLength, ballotLengthRemaining, completionLevelFilterType } = this.props;
    const remainingDecisionsCountIsDifferentThanAllItems = ballotLength !== ballotLengthRemaining;
    const showRemainingDecisions = (remainingDecisionsCountIsDifferentThanAllItems && ballotLengthRemaining) || false;
    const showDecisionsMade = (remainingDecisionsCountIsDifferentThanAllItems && ballotLengthRemaining) || false;
    switch (completionLevelFilterType) {
      case 'filterAllBallotItems':
        return 0;
      case 'filterRemaining':
        if (showRemainingDecisions) {
          return 1;
        } else {
          return 0;
        }
      case 'filterDecided':
        if (showDecisionsMade) {
          return 2;
        } else {
          return 0;
        }
      default:
        return 0;
    }
  }

  goToDifferentCompletionLevelTab (completionLevelFilterType = '') {
    BallotActions.completionLevelFilterTypeSave(completionLevelFilterType);
  }

  render () {
    // console.log("BallotDecisionsTabs render, this.props.completionLevelFilterType:", this.props.completionLevelFilterType);
    renderLog(__filename);
    const { classes, ballotLength, ballotLengthRemaining } = this.props;
    const remainingDecisionsCountIsDifferentThanAllItems = this.props.ballotLength !== this.props.ballotLengthRemaining;
    const showRemainingDecisions = (remainingDecisionsCountIsDifferentThanAllItems && this.props.ballotLengthRemaining) || false;
    const showDecisionsMade = (remainingDecisionsCountIsDifferentThanAllItems && this.props.ballotLengthRemaining) || false;
    const itemsDecidedCount = this.props.ballotLength - this.props.ballotLengthRemaining || 0;

    return (
      <Tabs
        value={this.getSelectedTab()}
        indicatorColor="primary"
        classes={{ root: classes.tabsRoot, flexContainer: classes.tabsFlexContainer, scroller: classes.scroller }}
      >
        <Tab
          classes={{ labelContainer: classes.tabLabelContainer, root: classes.tabRoot }}
          id="allItemsCompletionLevelTab"
          onClick={() => this.goToDifferentCompletionLevelTab('filterAllBallotItems')}
          label={(
            <Badge
              classes={{ badge: classes.badge, colorPrimary: this.getSelectedTab() === 0 ? null : classes.badgeColorPrimary }}
              color="primary"
              badgeContent={ballotLength}
              invisible={ballotLength === 0}
            >
              <span className="u-show-mobile">
                All
              </span>
              <span className="u-show-desktop-tablet">
                All Items
              </span>
            </Badge>
          )}
        />

        { showRemainingDecisions ? (
          <Tab
            classes={{ labelContainer: classes.tabLabelContainer, root: classes.tabRoot }}
            id="remainingChoicesCompletionLevelTab"
            onClick={() => this.goToDifferentCompletionLevelTab('filterRemaining')}
            label={(
              <Badge
                classes={{ badge: classes.badge, colorPrimary: this.getSelectedTab() === 1 ? null : classes.badgeColorPrimary }}
                color="primary"
                badgeContent={ballotLengthRemaining}
                invisible={ballotLengthRemaining === 0}
              >
                <span className="u-show-mobile">
                  Choices
                </span>
                <span className="u-show-desktop-tablet">
                  Remaining Choices
                </span>
              </Badge>
            )}
          />
        ) : null
        }

        { showDecisionsMade ? (
          <Tab
            classes={{ labelContainer: classes.tabLabelContainer, root: classes.tabRoot }}
            id="decidedItemsCompletionLevelTab"
            onClick={() => this.goToDifferentCompletionLevelTab('filterDecided')}
            label={(
              <Badge
                classes={{ badge: classes.badge, colorPrimary: this.getSelectedTab() === 2 ? null : classes.badgeColorPrimary }}
                color="primary"
                badgeContent={itemsDecidedCount}
                invisible={itemsDecidedCount === 0}
              >
                <span className="u-show-mobile">
                  Decided
                </span>
                <span className="u-show-desktop-tablet">
                  Items Decided
                </span>
              </Badge>
            )}
          />
        ) : null
        }
      </Tabs>
    );
  }
}

const styles = theme => ({
  badge: {
    top: 9,
    right: -14,
    minWidth: 16,
    width: 20,
    height: 19.5,
    [theme.breakpoints.down('md')]: {
      fontSize: 8,
      right: -11,
      width: 16,
      height: 16,
      top: 11,
    },
  },
  badgeColorPrimary: {
    background: 'rgba(0, 0, 0, .15)',
    color: '#333',
  },
  tabLabelContainer: {
    padding: '6px 6px',
    [theme.breakpoints.down('md')]: {
      padding: '6px 20px',
    },
  },
  tabsRoot: {
    minHeight: 38,
    height: 38,
    [theme.breakpoints.down('md')]: {
      fontSize: 12,
    },
  },
  tabsFlexContainer: {
    height: 38,
  },
  tabRoot: {
    [theme.breakpoints.up('md')]: {
      minWidth: 200,
    },
  },
  indicator: {
    [theme.breakpoints.up('md')]: {
      minWidth: 200,
    },
  },
  scroller: {
    overflowY: 'hidden',
  },
});

export default withStyles(styles)(BallotDecisionsTabs);

