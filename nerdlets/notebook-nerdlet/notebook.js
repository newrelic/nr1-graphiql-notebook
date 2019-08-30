import React from 'react';
import { Button, Stack, StackItem, TextField } from 'nr1'
import NotebookCell from './notebook-cell';

export default class Notebook extends React.Component {
  constructor(props) {
    super(props)
    //better default query plz
    let defaultQuery = `
{
  actor {
    user {
      email
      name
    }
  }
}
    `.trim()

    let emptyCells = [{query: defaultQuery, domRef: React.createRef(), ref: React.createRef()}]
    this.state = {
        title: this.props.ephemeral ? undefined : this.props.title,
        cells: this.props.cells ?
          this.props.cells.map((cell) => { return {domRef: React.createRef(), ref: React.createRef(), ...cell} }) :
          emptyCells,
        ephemeral: this.props.ephemeral,
        titleError: false
    }
}

onSave = () => {
  if (this.state.title) {
    this.props.onSave(this.serialize())
    this.setState({ephemeral: false})
  } else {
    this.setState({titleError: true})
  }
}

onDelete = () => {
  this.props.onDelete(this.props.uuid)
}

onDeleteCell = (cellId) => {
  let cells = this.state.cells.filter((_cell, i) => {
    return i != cellId
  })
  this.setState({ cells })
}

serialize = () => {
    let serializedCells = this.state.cells.map((cell) => {
      return cell.ref.current.serialize()
    })

    return {
      cells: serializedCells,
      uuid: this.props.uuid,
      title: this.state.title
    }
}

onEditTitle = (evt) => {
  let title = evt.target.value
  this.setState({ title: title, titleError: false})
}

popCell() {
    this.setState({ cells: this.state.cells.slice(0, -1)})
}

addCell = (cell) => {
    let cells = this.state.cells.slice(0).map((cell) => {
        return {...cell, collapsed: true}
    } )

    let newCell = {
        query: cell.query && cell.query.trim(),
        notes: cell.notes,
        domRef: React.createRef(),
        ref: React.createRef()
    }

    cells.push(newCell)

    this.setState({ cells: cells}, () => newCell.domRef.current.scrollIntoView())
}

updateCell = (cellIndex, cellUpdate) => {
    let cells = this.state.cells.slice(0)
    Object.assign(cells[cellIndex], cellUpdate)
    this.setState({cells: cells})
}

renderNotebookToolbar() {
    return <div className="notebook-tool-bar">
        <TextField
          style={{ fontSize: "20px" }}
          label='Notebook Name'
          placeholder='My Great Notebook'
          className={ this.state.titleError ? "notebook-name-error" : ""}
          value={this.state.title || undefined}
          onChange={this.onEditTitle} />
        <Stack gapType={Stack.GAP_TYPE.BASE}>
            <StackItem grow={true}>
                <Button
                    onClick={() => this.addCell({})}
                    type={Button.TYPE.PRIMARY}
                    iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}>
                    Add new Query
                </Button>
            </StackItem>
            <StackItem>
                <Button
                    onClick={this.onSave}
                    type={Button.TYPE.PRIMARY}
                    iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__DOWNLOAD}>
                    Save this Notebook
                </Button>
                <Button
                  style={{ marginLeft: "14px" }}
                  onClick={this.onDelete}
                  type={Button.TYPE.DESTRUCTIVE}
                  disabled={this.state.ephemeral}
                  iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}>
                  Delete this Notebook
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

render() {
    let { cells } = this.state
    return <>
        {this.renderNotebookToolbar()}
        {cells.map((cell, i) => {
            return <NotebookCell
                        ref={cell.ref}
                        domRef={cell.domRef}
                        key={`notebook-cell-${i}`}
                        cellId={i}
                        schema={this.props.schema}
                        query={cell.query}
                        notes={cell.notes}
                        collapsed={cell.collapsed}
                        addCell={this.addCell}
                        onExpand={() => this.updateCell(i, {collapsed: false})}
                        onCollapse={() => this.updateCell(i, {collapsed: true})}
                        onChange={() => { this.serialize() }}
                        onDelete={() => this.onDeleteCell(i)}
                    />
        })}

        {
          cells.length > 1 && <div className="notebook-tool-bar">
              <Button
                  onClick={() => this.addCell({})}
                  type={Button.TYPE.PRIMARY}
                  iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}>
                  Add new Query
              </Button>
          </div>
        }
    </>
}
}
