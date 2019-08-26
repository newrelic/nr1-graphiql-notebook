import React from 'react';
import PropTypes from 'prop-types';
import { NerdGraphQuery } from 'nr1';
import Select from 'react-select'
import { Button, Stack, StackItem, TextField} from 'nr1'
import NotebookCell from './notebook-cell';
import { getIntrospectionQuery, buildClientSchema } from "graphql";

/*
TODO: deal with state stuff of getting query document on first render for the json tree
  can handle updates with onQueryEdit after that
  worry about variables........? yeah, because we need account ids and they could be in the vars. later.

TODO: aliases
TODO: "Add to variables below" button on all leaf nodes?
*/
export default class NotebookNerdlet extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
    };

    constructor(props) {
        super(props)
        this.state = {
            schema: null,
            cells: [{query: undefined, ref: React.createRef()}]
        }
    }

    componentDidMount() {
        NerdGraphQuery
            .query({ query: getIntrospectionQuery(), fetchPolicyType: 'no-cache' })
            .then(({ data }) => {
                this.setState({ schema: buildClientSchema(data) })
            })
    }

    popCell() {
        this.setState({ cells: this.state.cells.slice(0, -1)})
    }

    addCell = (cell) => {
        let newCell = {query: cell.query, notes: cell.notes, ref: React.createRef()}
        this.setState({ cells: this.state.cells.concat([newCell])}, () => {
            newCell.ref.current.scrollIntoView()
        })
    }

    renderLauncherToolbar() {
        const options = [
            { value: 'great', label: 'My Great Notebok' },
            { value: 'nerdstorage', label: 'NerdStorage Examples' },
            { value: 'scratch', label: 'Scratchpad' }
        ]

        return <div className="notebook-tool-header">
            <Stack gapType={Stack.GAP_TYPE.BASE} alignmentType={Stack.ALIGNMENT_TYPE.CENTER}>
                <StackItem grow={true} />
                <StackItem>
                    <div style={{ width: "300px" }}>
                        <Select options={options} defaultValue={options[0]} />
                    </div>
                </StackItem>
                <StackItem shrink={true}>
                    <Button
                        style={{ marginLeft: "14px" }}
                        onClick={() => alert('Hello World!')}
                        type={Button.TYPE.NORMAL}
                        iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__IMPORT}>
                        Import Notebook
                    </Button>
                </StackItem>
            </Stack>
        </div>
    }

    renderNotebookToolbar() {
        return <div className="notebook-tool-bar">
            <TextField style={{ fontSize: "20px" }} label='Notebook Name' placeholder='My Great Notebook' />
            <Stack gapType={Stack.GAP_TYPE.BASE}>
                <StackItem grow={true}>
                    <Button
                        onClick={() => this.addCell()}
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

    render() {
        let { cells } = this.state
        return <div className="notebook">
            {this.renderLauncherToolbar()}
            {this.renderNotebookToolbar()}
            {cells.map((cell, i) => {
                return <NotebookCell
                            cellRef={cell.ref}
                            key={`notebook-cell-${i}`}
                            schema={this.state.schema}
                            query={cell.query}
                            notes={cell.notes}
                            addCell={this.addCell}
                        />
            })}

            {
                cells.length > 1 && <div className="notebook-tool-bar">
                    <Button
                        onClick={() => this.addCell()}
                        type={Button.TYPE.PRIMARY}
                        iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}>
                        Add new Query
                    </Button>
                </div>
            }

        </div>
    }
}
