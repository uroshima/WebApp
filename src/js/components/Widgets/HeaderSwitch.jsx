import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';

class HeaderSwitch extends PureComponent {
  static propTypes = {
    color: PropTypes.string.isRequired,
    choices: PropTypes.array.isRequired,
    selectedCategoryIndex: PropTypes.number.isRequired,
    switchToDifferentCategoryFunction: PropTypes.func,
  };

  switchToDifferentCategory (switchToChoice = 0) {
    if (this.props.switchToDifferentCategoryFunction) {
      this.props.switchToDifferentCategoryFunction(switchToChoice);
    }
  }

  render () {
    const { color, choices, selectedCategoryIndex } = this.props;
    return (
      <Container color={color}>
        <Choice selectedCategoryIndex={selectedCategoryIndex === 0} color={color} onClick={() => this.switchToDifferentCategory(0)}>
          <ChoiceText>{choices[0]}</ChoiceText>
        </Choice>
        <Choice selectedCategoryIndex={selectedCategoryIndex === 1} color={color} onClick={() => this.switchToDifferentCategory(1)}>
          <ChoiceText>{choices[1]}</ChoiceText>
        </Choice>
        <Choice selectedCategoryIndex={selectedCategoryIndex === 2} color={color} onClick={() => this.switchToDifferentCategory(2)}>
          <ChoiceText>{choices[2]}</ChoiceText>
        </Choice>
      </Container>
    );
  }
}

const Container = styled.div`
  display: flex;
  flex-flow: row;
  border-radius: 64px;
  height: 36px;
  min-width: 250px;
  width: 720px;
  cursor: pointer;
  border: 1px solid ${({ color }) => color};
  transition: all 150ms ease-in;
`;

const Choice = styled.div`
  display: flex;
  background: ${({ selectedCategoryIndex, color }) => (selectedCategoryIndex ? color : 'transparent')};
  color: ${({ selectedCategoryIndex, color, theme }) => (selectedCategoryIndex ? theme.colors.brandBlue : color)};
  border-radius: 64px;
  text-transform: uppercase;
  width: 50%;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-in;
`;

const ChoiceText = styled.p`
  margin: auto;
  font-size: 16px;
  text-align: center;
  transition: all 150ms ease-in;
`;

export default withTheme(HeaderSwitch);
