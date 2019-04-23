import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Appbar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import Navigation, { LogoContainer, Divider, NavLink, MobileNavigationMenu, MobileNavDivider, NavRow } from './Navigation';
import HeaderBarLogo from '../Navigation/HeaderBarLogo';
import { historyPush } from '../../utils/cordovaUtils';

class WelcomeAppbar extends Component {
  static propTypes = {
    classes: PropTypes.object,
    pathname: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      showMobileNavigationMenu: false,
    };
  }

  handleShowMobileNavigation = (show) => {
    this.setState({ showMobileNavigationMenu: show });
    if (show) {
      document.querySelector('body').style.overflow = 'hidden';
      return;
    }
    document.querySelector('body').style.overflow = '';
  }

  handleToPageFromMobileNav = (destination) => {
    this.handleShowMobileNavigation(false);
    historyPush(destination);
  }

  render () {
    const { classes, pathname } = this.props;
    // console.log('WelcomeAppbar, pathname: ', pathname);
    const { showMobileNavigationMenu } = this.state;
    return (
      <Appbar position="relative" classes={{ root: classes.appBarRoot }}>
        <Toolbar classes={{ root: classes.toolbar }} disableGutters>
          <LogoContainer>
            <HeaderBarLogo light />
          </LogoContainer>
          <Navigation>
            {pathname === '/how' ?
              <NavLink to="/welcome">Welcome</NavLink> :
              null
            }
            {pathname === '/how/for-voters' ?
              <NavLink to="/welcome">Welcome</NavLink> :
              null
            }
            {pathname === '/how/for-organizations' ?
              <NavLink to="/for-organizations">Welcome</NavLink> :
              null
            }
            {pathname === '/how/for-campaigns' ?
              <NavLink to="/for-campaigns">Welcome</NavLink> :
              null
            }
            {/* Don't show 'For Organizations' or 'For Voters' when on How It Works page */}
            {pathname === '/welcome' ?
              <NavLink to="/for-organizations">For Organizations</NavLink> :
              null
            }
            {!pathname.startsWith('/how') && pathname !== '/welcome' ?
              <NavLink to="/welcome">For Voters</NavLink> :
              null
            }
            <DesktopView>
              {/* Don't show 'For Organizations' or 'For Campaigns' when on How It Works page */}
              { !pathname.startsWith('/how') ?
                <Divider /> :
                null
              }
              { !pathname.startsWith('/how') && pathname === '/for-campaigns' ?
                <NavLink to="/for-organizations">For Organizations</NavLink> :
                null
              }
              { !pathname.startsWith('/how') && pathname !== '/for-campaigns' ?
                <NavLink to="/for-campaigns">For Campaigns</NavLink> :
                null
              }
              {/* Turn off How It Works link on that page */}
              { !pathname.startsWith('/how') ?
                <Divider /> :
                null
              }
              {/* Change the How It Works link depending on which welcome page you are on */}
              { pathname === '/welcome' ?
                <NavLink to="/how/for-voters">How It Works</NavLink> :
                null
              }
              { pathname === '/for-campaigns' ?
                <NavLink to="/how/for-campaigns">How It Works</NavLink> :
                null
              }
              { pathname === '/for-organizations' ?
                <NavLink to="/how/for-organizations">How It Works</NavLink> :
                null
              }
              <Divider />
              <NavLink to="/ballot">Get Started</NavLink>
              <Divider />
              <NavLink to="/settings/account">Sign In</NavLink>
            </DesktopView>
            <MobileTabletView>
              <IconButton
                classes={{ root: classes.iconButton }}
                onClick={() => this.handleShowMobileNavigation(true)}
              >
                <MenuIcon />
              </IconButton>
              {
                showMobileNavigationMenu && (
                  <MobileNavigationMenu>
                    <NavRow>
                      <CloseIcon
                        classes={{ root: classes.navClose }}
                        onClick={() => this.handleShowMobileNavigation(false)}
                      />
                    </NavRow>
                    <MobileNavDivider />
                    <NavRow>
                      <NavLink to="/welcome">For Voters</NavLink>
                    </NavRow>
                    <MobileNavDivider />
                    <NavRow>
                      <NavLink to="/for-organizations">For Organizations</NavLink>
                    </NavRow>
                    <MobileNavDivider />
                    <NavRow>
                      <NavLink to="/for-campaigns">For Campaigns</NavLink>
                    </NavRow>
                    <MobileNavDivider />
                    <NavRow>
                      <NavLink to="/how">How It Works</NavLink>
                    </NavRow>
                    <MobileNavDivider />
                    <NavRow>
                      <Button
                        variant="outlined"
                        classes={{ root: classes.navButtonOutlined }}
                        onClick={() => this.handleToPageFromMobileNav('/ballot')}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outlined"
                        classes={{ root: classes.navButtonOutlined }}
                        onClick={() => this.handleToPageFromMobileNav('/settings/account')}
                      >
                        Sign In
                      </Button>
                    </NavRow>
                  </MobileNavigationMenu>
                )
              }
            </MobileTabletView>
          </Navigation>
        </Toolbar>
      </Appbar>
    );
  }
}

const styles = ({
  appBarRoot: {
    background: 'transparent',
    alignItems: 'center',
    boxShadow: 'none',
  },
  toolbar: {
    width: 960,
    maxWidth: '95%',
    justifyContent: 'space-between',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
  },
  iconButton: {
    color: 'white',
  },
  navButtonOutlined: {
    height: 32,
    borderRadius: 32,
    color: 'white',
    border: '1px solid white',
    marginBottom: '1em',
    fontWeight: '300',
    width: '47%',
    fontSize: 12,
    padding: '5px 0',
    marginTop: 8,
  },
  navClose: {
    position: 'fixed',
    right: 16,
    cursor: 'pointer',
  },
});

const DesktopView = styled.div`
  display: inherit;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const MobileTabletView = styled.div`
  display: inherit;
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

export default withStyles(styles)(WelcomeAppbar);
