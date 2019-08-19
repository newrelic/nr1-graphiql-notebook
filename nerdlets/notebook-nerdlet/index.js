import React from 'react';
import PropTypes from 'prop-types';
import { NerdGraphQuery } from 'nr1';
import Select from 'react-select'
import { Button, TextField, Stack, StackItem } from 'nr1'
import NotebookCell from './notebook-cell';
import { getIntrospectionQuery, buildClientSchema } from "graphql";
import NotebookToolbar from "./notebook-toolbar.js"

/*
deal with state stuff of getting query document on first render for the json tree
  can handle updates with onQueryEdit after that
  worry about variables........? yeah, because we need account ids and they could be in the vars. later.

Add some functionality that hijacks the query vars and allows you to refer to another cell......??

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
            cellCount: 1
        }
    }

    componentDidMount() {
        NerdGraphQuery
            .query({ query: getIntrospectionQuery(), fetchPolicyType: 'no-cache' })
            .then(({ data }) => {
                this.setState({ schema: buildClientSchema(data) })
            })
    }

    decrementCellCount() {
        this.setState({ cellCount: Math.max(0, this.state.cellCount - 1) })
    }

    incrementCellCount() {
        this.setState({ cellCount: this.state.cellCount + 1 })
    }

    render() {
        const options = [
            { value: 'great', label: 'My Great Notebok' },
            { value: 'nerdstorage', label: 'NerdStorage Examples' },
            { value: 'scratch', label: 'Scratchpad' }
          ]

        return <div className="notebook">
            <div className="notebook-tool-header">
                <Stack gapType={Stack.GAP_TYPE.BASE} alignmentType={Stack.ALIGNMENT_TYPE.CENTER}>
                    <StackItem grow={true}/>
                    <StackItem>
                        <div style={{width: "300px" }}>
                            <Select options={options} defaultValue={options[0]}/>
                        </div>
                    </StackItem>
                    <StackItem shrink={true}>
                        <Button
                            style={{marginLeft: "14px"}}
                            onClick={() => alert('Hello World!')}
                            type={Button.TYPE.NORMAL}
                            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__IMPORT}>
                            Import Notebook
                        </Button>
                    </StackItem>
                </Stack>
            </div>

            <NotebookToolbar/>

            {Array(this.state.cellCount).fill(<NotebookCell schema={this.state.schema} />)}

            {
                this.state.cellCount > 1 && <div className="notebook-tool-bar">
                    <Button
                        onClick={() => this.incrementCellCount()}
                        type={Button.TYPE.PRIMARY}
                        iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_ADD}>
                        Add new Query
                    </Button>
                </div>
            }

        </div>
    }
}
