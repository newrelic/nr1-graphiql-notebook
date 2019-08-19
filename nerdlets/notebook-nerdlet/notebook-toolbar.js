import React from 'react';
import { TextField, Button, Stack, StackItem } from 'nr1';

export default class NotebookToolbar extends React.Component {

  render() {
    return <div className="notebook-tool-bar">
      <TextField style={{ fontSize: "20px" }} label='Notebook Name' placeholder='My Great Notebook' />
      <Stack gapType={Stack.GAP_TYPE.BASE}>
        <StackItem grow={true}>
          <Button
            onClick={() => this.incrementCellCount()}
            type={Button.TYPE.PRIMARY}
            iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}>
            Add new Query
          </Button>
        </StackItem>
        <StackItem>
          <Button
            onClick={() => alert('Hello World!')}
            type={Button.TYPE.NORMAL}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__DOWNLOAD}>
            Save this Notebook
          </Button>
          <Button
            style={{ marginLeft: "14px" }}
            onClick={() => alert('Hello World!')}
            type={Button.TYPE.NORMAL}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__SHARE_LINK}>
            Share this Notebook
          </Button>
        </StackItem>
      </Stack>
    </div>
  }
}
