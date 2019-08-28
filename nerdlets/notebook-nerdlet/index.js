import React from 'react'
import PropTypes from 'prop-types'
import Notebook from './notebook.js'
import Select from 'react-select' //replace w/ dropdown
import { Button, Stack, StackItem, UserStorageQuery, UserStorageMutation} from 'nr1'

/*
TODO: deal with state stuff of getting query document on first render for the json tree
  can handle updates with onQueryEdit after that
  worry about variables........? yeah, because we need account ids and they could be in the vars. later.

TODO: aliases
TODO: "Add to variables below" button on all leaf nodes?
*/

const COLLECTION = "graphiql-notebook"

export default class NotebookNerdlet extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
    };

    constructor(props) {
        super(props)
        this.emptyNotebook = {
            uuid: uuidv4(),
            title: "New Notebook",
            cells: null,
            placeholder: true
        }
        this.state = {
            notebooks: [this.emptyNotebook],
            currentNotebook: this.emptyNotebook
        }
    }

    // componentDidMount() {
    //     NerdGraphQuery
    //         .query({ query: getIntrospectionQuery(), fetchPolicyType: 'no-cache' })
    //         .then(({ data }) => {
    //             this.setState({ schema: buildClientSchema(data) })
    //         })
    // }

    getNotebook(uuid) {
        return this.state.notebooks.find((notebook) => {
            return notebook.uuid == uuid
        })
    }

    componentDidMount() {
        UserStorageQuery.query({
            collection: COLLECTION
        }).then(({_loading, _error, data}) => {
            if (data) {
                let {actor: { nerdStorage: { collection: collection } } } = data
                let notebooks = collection.map(({document}) => document)
                this.setState({notebooks: [this.emptyNotebook].concat(notebooks)})
            }
        })
    }

    onSave = (serializedNotebook) => {
        UserStorageMutation.mutate({
            actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
            collection: COLLECTION,
            documentId: serializedNotebook.uuid,
            document: serializedNotebook
        })
    }

    onNotebookSelect = ({value: selectedUUID}) => {
        this.setState({ currentNotebook: this.getNotebook(selectedUUID) })
    }

    render() {
        let notebook = this.state.currentNotebook
        return <div className="notebook">
            {this.renderHeader()}
            <Notebook
                key={ this.state.currentNotebook.uuid }
                uuid={ this.state.currentNotebook.uuid }
                title={ notebook.placeholder ? null : notebook.title }
                cells={ notebook.placeholder? null : this.state.currentNotebook.cells }
                onSave={ this.onSave }
            />
        </div>
    }

    notebookOptions = () => {
        return this.state.notebooks.map((notebook) => {
            return {
                value: notebook.uuid,
                label: notebook.title
            }
        })
    }

    renderHeader() {
        const options = this.notebookOptions()

        return <div className="notebook-header">
                <Stack gapType={Stack.GAP_TYPE.BASE} alignmentType={Stack.ALIGNMENT_TYPE.CENTER}>
                    <StackItem>
                        <div style={{ width: "300px" }}>
                            <Select
                                options={options}
                                defaultValue={options[0]}
                                onChange={this.onNotebookSelect}
                            />
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
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
