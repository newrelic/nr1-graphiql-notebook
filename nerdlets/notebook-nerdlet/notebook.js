import React from 'react';
import { HeadingText, Button, Stack, StackItem, TextField, Modal } from 'nr1';
import NotebookCell from './notebook-cell';
import { uuidv4 } from './uuid';

export default class Notebook extends React.Component {
  constructor(props) {
    super(props);

    const emptyCells = [this.createCell()];
    this.state = {
      title: this.props.ephemeral ? undefined : this.props.title,
      cells: this.props.cells
        ? this.props.cells.map((cell) => { return this.createCell(cell); })
        : emptyCells,
      ephemeral: this.props.ephemeral,
      titleError: false,
      shareHidden: true,
      sharedContents: ''
    };
  }

createCell = (cell) => {
  const defaultQuery = `
{
  actor {
    user {
      email
      name
    }
  }
}
    `.trim();
  const defaults = {
    query: defaultQuery,
    uuid: uuidv4(),
    domRef: React.createRef(),
    ref: React.createRef()
  };
  return Object.assign(defaults, cell || {});
}

onSave = () => {
  if (this.state.title) {
    this.props.onSave(this.serialize());
    this.setState({ ephemeral: false });
  } else {
    this.setState({ titleError: true });
  }
}

onDelete = () => {
  this.props.onDelete(this.props.uuid);
}

onDeleteCell = (cellUUID) => {
  const cells = this.state.cells.filter((cell) => {
    return cell.uuid != cellUUID;
  });
  this.setState({ cells });
}

serialize = () => {
  const serializedCells = this.state.cells.map((cell) => {
    return cell.ref.current.serialize();
  });

  return {
    cells: serializedCells,
    uuid: this.props.uuid,
    title: this.state.title
  };
}

onEditTitle = (evt) => {
  const title = evt.target.value;
  this.setState({ title: title, titleError: false });
}

popCell() {
  this.setState({ cells: this.state.cells.slice(0, -1) });
}

addCell = (cell) => {
  const cells = this.state.cells.map((cell) => {
    return { ...cell, collapsed: true };
  });

  cell.query = cell.query && cell.query.trim();

  const newCell = this.createCell(cell);

  cells.push(newCell);

  this.setState({ cells: cells }, () => newCell.domRef.current.scrollIntoView());
}

updateCell = (cellUUID, cellUpdate) => {
  const cells = this.state.cells.map((cell) => {
    if (cell.uuid == cellUUID) {
      return { ...cell, ...cellUpdate };
    }
    return cell;
  });
  this.setState({ cells });
}

renderNotebookToolbar() {
  return (
    <div className="notebook-tool-bar">
      <TextField
        style={{ fontSize: '20px', marginBottom: '14px' }}
        label="Notebook Name"
        placeholder="My Great Notebook"
        className={this.state.titleError ? 'notebook-name-error' : ''}
        value={this.state.title || undefined}
        onChange={this.onEditTitle}
      />
      <Stack fullWidth gapType={Stack.GAP_TYPE.BASE}>
        <StackItem grow>
          <Button
            onClick={() => this.addCell({})}
            type={Button.TYPE.PRIMARY}
            iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}
          >
                    Add new Query
          </Button>
        </StackItem>
        <StackItem>
          <Button
            onClick={this.onSave}
            type={Button.TYPE.PRIMARY}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__DOWNLOAD}
          >
                    Save this Notebook
          </Button>
          <Button
            style={{ marginLeft: '14px' }}
            onClick={this.onDelete}
            type={Button.TYPE.DESTRUCTIVE}
            disabled={this.state.ephemeral}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
          >
                  Delete this Notebook
          </Button>
          <Button
            style={{ marginLeft: '14px' }}
            disabled={this.state.ephemeral}
            onClick={() => {
              this.setState({ shareHidden: false, sharedContents: this.serialize() });
            }}
            type={Button.TYPE.NORMAL}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__SHARE_LINK}
          >
                    Share this Notebook
          </Button>
        </StackItem>
      </Stack>
    </div>
  );
}

closeModal = () => {
  this.setState({ shareHidden: true });
}

render() {
  const { cells } = this.state;
  return (
    <div>
      {this.renderNotebookToolbar()}
      {cells.map((cell, i) => {
        return (
          <NotebookCell
            ref={cell.ref}
            domRef={cell.domRef}
            key={cell.uuid}
            cellIndex={i}
            uuid={cell.uuid}
            schema={this.props.schema}
            query={cell.query}
            notes={cell.notes}
            collapsed={cell.collapsed}
            addCell={this.addCell}
            onExpand={() => this.updateCell(cell.uuid, { collapsed: false })}
            onCollapse={() => this.updateCell(cell.uuid, { collapsed: true })}
            onChange={() => { this.serialize(); }}
            onDelete={() => this.onDeleteCell(cell.uuid)}
            accounts={this.props.accounts}
          />
        );
      })}

      {
        cells.length > 1 && (
          <div className="notebook-tool-bar">
            <Button
              onClick={() => this.addCell({})}
              type={Button.TYPE.PRIMARY}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}
            >
                  Add new Query
            </Button>
          </div>
        )
      }

      {/* TODO seems to cause an error but things... work...?  */}
      <Modal hidden={this.state.shareHidden} onClose={this.closeModal} >
        <HeadingText>Copy the contents of the box below</HeadingText>
        <textarea
          readOnly
          className="notebook-import-export-box"
          value={
            btoa(unescape(encodeURIComponent(JSON.stringify(this.state.sharedContents))))
          }
        />
      </Modal>
    </div>
  );
}
}
