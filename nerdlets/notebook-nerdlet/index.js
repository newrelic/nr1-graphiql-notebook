import React from 'react'
import PropTypes from 'prop-types'
import Notebook from './notebook.js'
import Select from 'react-select' //replace w/ dropdown
import { HeadingText, Modal, Button, Stack, StackItem, UserStorageQuery, UserStorageMutation} from 'nr1'
import { nerdlet, NerdGraphQuery } from 'nr1';
import { getIntrospectionQuery, buildClientSchema } from "graphql";
import { uuidv4 } from "./uuid";
import { gettingStartedNotebook } from "./getting-started-notebook.js"

const COLLECTION = "graphiql-notebook"

export default class NotebookNerdlet extends React.Component {
    static propTypes = {
        nerdletUrlState: PropTypes.object,
        launcherUrlState: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number,
    };

    constructor(props) {
        super(props)
        let emptyNotebook = this.newEmptyNotebook()
        this.state = {
            emptyNotebook: emptyNotebook,
            notebooks: [],
            currentNotebook: emptyNotebook,
            importHidden: true,
            initializeSchemaErrors: false
        }
    }

    newEmptyNotebook() {
        return {
            uuid: uuidv4(),
            schemaVersion: 0,
            title: "New Notebook",
            cells: null,
            ephemeral: true
        }
    }

    getNotebook(uuid) {
        return this.getNotebooks().find((notebook) => {
            return notebook.uuid == uuid
        })
    }

    getNotebooks() {
        return [this.state.emptyNotebook].concat(this.state.notebooks)
    }

    componentDidMount() {
        Promise.all([
            this.initializeSchema(),
            this.fetchAccounts(),
            this.initializeNotebooks()
        ]).then(([schemaResponse, accountsResponse, collectionResponse]) => {
            let schema = schemaResponse.data
            let schemaErrors = schemaResponse.errors || [];
            let {actor: {accounts: accounts }} = accountsResponse.data
            let collection = collectionResponse.data

            let urlNotebookUUID = this.props.nerdletUrlState.notebook
            let notebooks = collection.map(({document}) => document)

            //If the collection's empty, show "Getting Started"
            if (notebooks.length == 0) {
                let gettingStarted = gettingStartedNotebook(accounts && accounts[0] && accounts[0].id || 1)
                urlNotebookUUID = gettingStarted.uuid
                notebooks.push(gettingStarted)
            }
            let currentNotebook = notebooks.find((notebook) => notebook.uuid == urlNotebookUUID)

            this.setState({
                schema: schema ? buildClientSchema(schema) : false,
                initializeSchemaErrors: schemaErrors.length > 0 ? schemaErrors : false,
                notebooks: notebooks,
                accounts: accounts || [],
                currentNotebook: currentNotebook || this.state.emptyNotebook
            })
        })
    }

    initializeSchema() {
        return NerdGraphQuery.query({ query: getIntrospectionQuery(), fetchPolicyType: 'no-cache' })
    }

    initializeNotebooks() {
        return UserStorageQuery.query({ collection: COLLECTION })
    }

    fetchAccounts() {
        return NerdGraphQuery.query({ query: `
        {
            actor {
                accounts {
                    id
                }
            }
        }
        `, fetchPolicyType: 'no-cache' })
    }

    saveNotebook = (newNotebook) => {
        return UserStorageMutation.mutate({
            actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
            collection: COLLECTION,
            documentId: newNotebook.uuid,
            document: newNotebook
        }).then(() => {
            let emptyNotebook = newNotebook.uuid === this.state.emptyNotebook.uuid ?
                this.newEmptyNotebook() : this.state.emptyNotebook

            let notesbooks = this.state.notebooks.indexOf(newNotebook) > -1 ?
                this.state.notebooks.slice(0).concat([newNotebook]) :
                this.state.notebooks

            this.setState({
                notebooks: notesbooks,
                currentNotebook: newNotebook,
                emptyNotebook: emptyNotebook
            },
            () => {nerdlet.setUrlState({notebook: newNotebook.uuid})})
        })
    }

    onDelete = (uuid) => {
        UserStorageMutation.mutate({
            actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
            collection: COLLECTION,
            documentId: uuid
        }).then(() => {
            let notebooks = this.state.notebooks.slice(0).filter((notebook) => {
                return notebook.uuid != uuid
            })
            let currentNotebook = this.getNotebook(this.state.emptyNotebook.uuid)
            this.setState({
                    notebooks: notebooks,
                    currentNotebook: currentNotebook
                },
                () => {nerdlet.setUrlState({notebook: currentNotebook.uuid})})
        })
    }

    onNotebookSelect = ({value: selectedUUID}) => {
        let currentNotebook = this.getNotebook(selectedUUID)
        this.setState({
                currentNotebook: currentNotebook
            },
            () => {nerdlet.setUrlState({notebook: currentNotebook.uuid})})
    }

    closeImportModal = () => this.setState({importHidden: true})

    render() {
        let notebook = this.state.currentNotebook
        const initializeSchemaErrors = this.state.initializeSchemaErrors

        if (initializeSchemaErrors) {
          return (
            <>
            <h2>Error Fetching GraphQL Schema</h2>
            <ul>
              {initializeSchemaErrors.map((error, index) => {
                return <li key={index}><pre>{JSON.stringify(error)}</pre></li>
              })}
            </ul>
            </>
          )
        }

        return <div className="notebook">
            {this.renderHeader()}
            <Notebook
                key={ notebook.uuid }
                uuid={ notebook.uuid }
                schema={ this.state.schema }
                title={ notebook.title }
                cells={ notebook.cells }
                ephemeral={ !!notebook.ephemeral }
                onSave={ this.saveNotebook }
                onDelete={ this.onDelete }
                accounts={ this.state.accounts }
            />
            <Modal hidden={this.state.importHidden} onClose={this.closeImportModal} >
                <HeadingText>Paste below and press "import"</HeadingText>
                <textarea
                    ref={(r) => this.importTextArea = r}
                    className="notebook-import-export-box" />
                <Button
                    onClick={() => {
                        let encodedNotebook = this.importTextArea.value
                        if (encodedNotebook) {
                            let decodedNotebook = JSON.parse(atob(encodedNotebook))
                            this.saveNotebook(decodedNotebook).then(() => {
                                this.closeImportModal()
                            })
                        }
                    }}
                    type={Button.TYPE.NORMAL}
                    iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__IMPORT}>
                    Import
                </Button>
            </Modal>
        </div>
    }

    notebookOptions = () => {
        return this.getNotebooks().map((notebook) => {
            return {
                value: notebook.uuid,
                label: notebook.title
            }
        })
    }

    renderHeader() {
        const options = this.notebookOptions()
        const currentNotebook = this.state.currentNotebook
        return <div className="notebook-header">
                <HeadingText style={{marginBottom:"14px", color: "#8e9494"}}>Your Notebooks</HeadingText>
                <Stack gapType={Stack.GAP_TYPE.BASE} verticalType={Stack.VERTICAL_TYPE.CENTER} horizontalType={Stack.HORIZONTAL_TYPE.CENTER}>
                    <StackItem>
                        <div style={{ width: "300px" }}>
                            <Select
                                options={options}
                                value={{value: currentNotebook.uuid, label: currentNotebook.title}}
                                defaultValue={options[0]}
                                onChange={this.onNotebookSelect}
                            />
                        </div>
                    </StackItem>
                    <StackItem shrink={true}>
                        <Button
                            style={{ marginLeft: "14px" }}
                            onClick={() => this.setState({importHidden: false})}
                            type={Button.TYPE.NORMAL}
                            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__IMPORT}>
                            Import Notebook
                        </Button>
                    </StackItem>
                </Stack>
            </div>
    }
}
