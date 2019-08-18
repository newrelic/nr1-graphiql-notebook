import React from 'react';
import PropTypes from 'prop-types';
import { NerdGraphQuery } from 'nr1';
import { Button, TextField, Stack, StackItem } from 'nr1'
import NotebookCell from './notebook-cell';
import { getIntrospectionQuery, buildClientSchema } from "graphql";

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
        return <div className="notebook">
            <div className="notebook-tool-bar">
                <TextField style={{fontSize:"20px"}} label='Notebook Name' placeholder='My Great Notebook' />
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
                            style={{marginLeft: "14px"}}
                            onClick={() => alert('Hello World!')}
                            type={Button.TYPE.NORMAL}
                            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__SHARE_LINK}>
                            Share this Notebook
                        </Button>
                    </StackItem>
                </Stack>


            </div>

            {Array(this.state.cellCount).fill(<NotebookCell schema={this.state.schema} />)}

        </div>
    }
}
