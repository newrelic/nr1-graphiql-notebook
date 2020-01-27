import React from 'react';
import NotebookNerdlet from './main';
import { NerdletStateContext } from 'nr1';

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <NerdletStateContext.Consumer>
        {nerdletUrlState => (
          <NotebookNerdlet nerdletUrlState={nerdletUrlState} />
        )}
      </NerdletStateContext.Consumer>
    );
  }
}
