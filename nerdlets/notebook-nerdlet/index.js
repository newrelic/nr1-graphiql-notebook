import React from 'react';
import Notebook from './notebook.js';
import Select from 'react-select'; //replace w/ dropdown
import {
  HeadingText,
  Modal,
  Button,
  Stack,
  StackItem,
  UserStorageQuery,
  UserStorageMutation,
  NerdletStateContext,
  nerdlet,
  NerdGraphQuery,
  Spinner,
  AccountsQuery,
} from 'nr1';
import { NerdGraphError, EmptyState } from '@newrelic/nr1-community';
import { getIntrospectionQuery, buildClientSchema } from 'graphql';
import { v4 as uuidv4 } from 'uuid';
import { gettingStartedNotebook } from './getting-started-notebook.js';

const COLLECTION = 'graphiql-notebook';

export default class NotebookNerdlet extends React.PureComponent {
  constructor(props) {
    super(props);
    const emptyNotebook = this.newEmptyNotebook();
    this.state = {
      emptyNotebook: emptyNotebook,
      currentNotebook: emptyNotebook,
      importHidden: true,
    };
  }

  newEmptyNotebook() {
    return {
      uuid: uuidv4(),
      schemaVersion: 0,
      title: 'New Notebook',
      cells: null,
      ephemeral: true,
    };
  }

  async getNotebook(uuid) {
    const notebooks = await this.getNotebooks();
    //console.debug([notebooks, uuid]);
    //debugger;
    return notebooks.find((notebook) => {
      return notebook.uuid == uuid;
    });
  }

  async getNotebooks() {
    const collection = await UserStorageQuery.query({
      collection: COLLECTION,
      fetchPolicyType: 'no-cache',
    });
    const { emptyNotebook } = this.state;
    return [emptyNotebook].concat(
      collection.data.map(({ document }) => document)
    );
  }

  saveNotebook = (newNotebook) => {
    return UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: COLLECTION,
      documentId: newNotebook.uuid,
      document: newNotebook,
    }).then(() => {
      let emptyNotebook =
        newNotebook.uuid === this.state.emptyNotebook.uuid
          ? this.newEmptyNotebook()
          : this.state.emptyNotebook;

      this.setState(
        {
          currentNotebook: newNotebook,
          emptyNotebook,
        },
        () => {
          nerdlet.setUrlState({ notebook: newNotebook.uuid });
        }
      );
    });
  };

  onDelete = (uuid) => {
    UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: COLLECTION,
      documentId: uuid,
    }).then(() => {
      this.setState({ currentNotebook: this.state.emptyNotebook }, () => {
        nerdlet.setUrlState({ notebook: this.state.emptyNotebook.uuid });
      });
    });
  };

  onNotebookSelect = async ({ value: selectedUUID }) => {
    const currentNotebook = await this.getNotebook(selectedUUID);
    this.setState({ currentNotebook }, () => {
      nerdlet.setUrlState({ notebook: currentNotebook.uuid });
    });
  };

  closeImportModal = () => this.setState({ importHidden: true });

  /**
   * - Processes the UserStorage query data
   * - If empty, returns the Getting Started template
   * - Otherwise leverages the selected notebook
   *
   * @param {Object} data - UserStorage query data
   * @param {Object} nerdletUrlState - read-only data from Nerdlet state context
   * @param {Array} accounts - List of accounts from the AccountsQuery
   */
  _processNotebookData(data, nerdletUrlState, accounts) {
    //debugger;
    const { emptyNotebook } = this.state;
    let urlNotebookUUID = nerdletUrlState.notebook;
    const storageNotebooks = data.map(({ document }) => document);
    let currentNotebook = null;
    if (urlNotebookUUID == emptyNotebook.uuid) {
      currentNotebook = emptyNotebook;
    } else if (storageNotebooks.length == 0) {
      let gettingStarted = gettingStartedNotebook(
        (accounts && accounts[0] && accounts[0].id) || 1
      );
      urlNotebookUUID = gettingStarted.uuid;
      storageNotebooks.push(gettingStarted);
      currentNotebook = gettingStarted;
    } else {
      currentNotebook = storageNotebooks.find(
        (notebook) => notebook.uuid == urlNotebookUUID
      );
    }
    currentNotebook = currentNotebook || storageNotebooks[0];
    const options = [
      { value: emptyNotebook.uuid, label: emptyNotebook.title },
    ].concat(
      storageNotebooks.map((notebook) => {
        return {
          value: notebook.uuid,
          label: notebook.title,
        };
      })
    );
    return { notebooks: storageNotebooks, currentNotebook, options };
  }

  render() {
    return (
      <NerdGraphQuery
        query={getIntrospectionQuery()}
        fetchPolicyType="no-cache"
      >
        {({ data, loading, errors }) => {
          if (loading) {
            return <Spinner />;
          }
          if (errors) {
            return (
              <>
                <HeadingText>Error Fetching GraphQL Schema</HeadingText>
                <ul>
                  {errors.map((error, index) => {
                    return (
                      <li key={index}>
                        <NerdGraphError error={error} />
                      </li>
                    );
                  })}
                </ul>
              </>
            );
          }
          if (data) {
            const schema = buildClientSchema(data);
            return (
              <AccountsQuery>
                {({ data, error, loading }) => {
                  if (loading) {
                    return <Spinner />;
                  }
                  if (error) {
                    return <NerdGraphError error={error} />;
                  }
                  const accounts = data;
                  return (
                    <UserStorageQuery collection={COLLECTION}>
                      {({ data, loading, error }) => {
                        if (loading) {
                          return <Spinner />;
                        }
                        if (error) {
                          return <NerdGraphError error={error} />;
                        }
                        const userStorage = data;
                        //console.debug(userStorage);
                        //debugger;
                        return (
                          <NerdletStateContext.Consumer>
                            {(nerdletUrlState) => {
                              const {
                                notebooks,
                                currentNotebook,
                                options,
                              } = this._processNotebookData(
                                userStorage,
                                nerdletUrlState,
                                accounts
                              );

                              return (
                                <div className="notebook">
                                  {this.renderHeader(currentNotebook, options)}
                                  <Notebook
                                    key={currentNotebook.uuid}
                                    uuid={currentNotebook.uuid}
                                    schema={schema}
                                    title={currentNotebook.title}
                                    cells={currentNotebook.cells}
                                    ephemeral={!!currentNotebook.ephemeral}
                                    onSave={this.saveNotebook}
                                    onDelete={this.onDelete}
                                    accounts={accounts}
                                  />
                                  <Modal
                                    hidden={this.state.importHidden}
                                    onClose={this.closeImportModal}
                                  >
                                    <HeadingText>
                                      Paste below and press "import"
                                    </HeadingText>
                                    <textarea
                                      ref={(r) => (this.importTextArea = r)}
                                      className="notebook-import-export-box"
                                    />
                                    <Button
                                      onClick={() => {
                                        let encodedNotebook = this
                                          .importTextArea.value;
                                        if (encodedNotebook) {
                                          let decodedNotebook = JSON.parse(
                                            atob(encodedNotebook)
                                          );
                                          this.saveNotebook(
                                            decodedNotebook
                                          ).then(() => {
                                            this.closeImportModal();
                                          });
                                        }
                                      }}
                                      type={Button.TYPE.NORMAL}
                                      iconType={
                                        Button.ICON_TYPE
                                          .INTERFACE__OPERATIONS__IMPORT
                                      }
                                    >
                                      Import
                                    </Button>
                                  </Modal>
                                </div>
                              );
                            }}
                          </NerdletStateContext.Consumer>
                        );
                      }}
                    </UserStorageQuery>
                  );
                }}
              </AccountsQuery>
            );
          } else {
            return (
              <div className="empty-state-container">
                <EmptyState
                  heading="Unable to fetch Schema"
                  description="Check your Nerdpack configuration."
                  buttonText=""
                />
              </div>
            );
          }
        }}
      </NerdGraphQuery>
    );
  }

  renderHeader(currentNotebook, options) {
    return (
      <div className="notebook-header">
        <HeadingText style={{ marginBottom: '14px', color: '#8e9494' }}>
          Your Notebooks
        </HeadingText>
        <Stack
          gapType={Stack.GAP_TYPE.BASE}
          verticalType={Stack.VERTICAL_TYPE.CENTER}
          horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
        >
          <StackItem>
            <div style={{ width: '300px' }}>
              <Select
                options={options}
                value={{
                  value: currentNotebook.uuid,
                  label: currentNotebook.title,
                }}
                defaultValue={options[0]}
                onChange={this.onNotebookSelect}
              />
            </div>
          </StackItem>
          <StackItem shrink={true}>
            <Button
              style={{ marginLeft: '14px' }}
              onClick={() => this.setState({ importHidden: false })}
              type={Button.TYPE.NORMAL}
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__IMPORT}
            >
              Import Notebook
            </Button>
          </StackItem>
        </Stack>
      </div>
    );
  }
}
