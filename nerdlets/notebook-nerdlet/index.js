import React from 'react';
import NotebookNerdlet from './main';
import {
  PlatformStateContext,
  NerdletStateContext,
  AutoSizer,
  nerdlet,
} from 'nr1';

export default class Wrapper extends React.PureComponent {
  constructor(props) {
    super(props);
    nerdlet.setConfig({ timePicker: false });
  }

  render() {
    return (
      <PlatformStateContext.Consumer>
        {platformUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => (
              <AutoSizer>
                {({ width, height }) => (
                  <NotebookNerdlet
                    launcherUrlState={platformUrlState}
                    nerdletUrlState={nerdletUrlState}
                    width={width}
                    height={height}
                  />
                )}
              </AutoSizer>
            )}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
