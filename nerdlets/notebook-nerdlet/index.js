import React from 'react';
import NotebookNerdlet from './main';
import { NerdletStateContext, nerdlet } from 'nr1';

export default class Wrapper extends React.PureComponent {
  constructor(props) {
    super(props);
    nerdlet.setConfig({ timePicker: false });
  }

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
