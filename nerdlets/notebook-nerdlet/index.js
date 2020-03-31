import React from 'react';
import Notebook from './notebook.js';
import Select from 'react-select'; // replace w/ dropdown
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
  AccountsQuery
} from 'nr1';
import { NerdGraphError, EmptyState } from '@newrelic/nr1-community';
import { getIntrospectionQuery, buildClientSchema } from 'graphql';
import { v4 as uuidv4 } from 'uuid';
import { gettingStartedNotebook } from './getting-started-notebook.js';

const COLLECTION = 'graphiql-notebook';
const defaultGettingStartedNotebook = gettingStartedNotebook(-1);

export default class NotebookNerdlet extends React.PureComponent {
  constructor(props) {
    super(props);
    const emptyNotebook = this.newEmptyNotebook();
    this.state = {
      emptyNotebook: emptyNotebook,
      //currentNotebook: defaultGettingStartedNotebook,
      importHidden: true
    };
  }

  newEmptyNotebook() {
    return {
      uuid: uuidv4(),
      schemaVersion: 0,
      title: 'New Notebook',
      cells: null,
      ephemeral: true
    };
  }

  async getNotebook(uuid) {
    const notebooks = await this.getNotebooks();
    //console.debug("getNotebook", [notebooks, uuid]);
    // debugger;
    return notebooks.find(notebook => {
      return notebook.uuid === uuid;
    });
  }

  async getNotebooks() {
    const collection = await UserStorageQuery.query({
      collection: COLLECTION,
      fetchPolicyType: 'no-cache'
    });
    const { emptyNotebook } = this.state;
    const notebooks = collection.data.map(({ document }) => document);
    if (notebooks.length == 0) {
      return [emptyNotebook, defaultGettingStartedNotebook];
    } else {
      return [emptyNotebook, ...notebooks];
    }
  }

  saveNotebook = newNotebook => {
    return UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: COLLECTION,
      documentId: newNotebook.uuid,
      document: newNotebook
    }).then(() => {
      const oldEmptyNotebook = this.state.emptyNotebook;
      const emptyNotebook =
        newNotebook.uuid === oldEmptyNotebook.uuid
          ? this.newEmptyNotebook()
          : oldEmptyNotebook;

      this.setState(
        {
          currentNotebook: newNotebook,
          emptyNotebook
        },
        () => {
          nerdlet.setUrlState({ notebook: newNotebook.uuid });
        }
      );
    });
  };

  onDelete = uuid => {
    UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: COLLECTION,
      documentId: uuid
    }).then(() => {
      const { emptyNotebook } = this.state;
      nerdlet.setUrlState({ notebook: emptyNotebook.uuid });
      /*
      this.setState({ currentNotebook: emptyNotebook }, () => {
        nerdlet.setUrlState({ notebook: emptyNotebook.uuid });
      });
      */
    });
  };

  onNotebookSelect = async ({ value: selectedUUID }) => {
    //console.debug(selectedUUID);
    nerdlet.setUrlState({ notebook: selectedUUID });
    /*const currentNotebook = await this.getNotebook(selectedUUID);
    this.setState({ currentNotebook }, () => {
      nerdlet.setUrlState({ notebook: currentNotebook.uuid });
    });*/
  };

  closeImportModal = () => this.setState({ importHidden: true });

  renderHeader(currentNotebook, notebooks) {
    const options = notebooks.map(notebook => {
      return {
        value: notebook.uuid,
        label: notebook.title
      };
    });

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
                  label: currentNotebook.title
                }}
                defaultValue={options[0]}
                onChange={this.onNotebookSelect}
              />
            </div>
          </StackItem>
          <StackItem shrink>
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

  render() {
    const { emptyNotebook } = this.state;
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
                        return (
                          <NerdletStateContext.Consumer>
                            {nerdletUrlState => {
                              const accountId = accounts && accounts[0] ? accounts[0].id : 1;
                              const defaultNotebook = gettingStartedNotebook(accountId);
                              const selectedNotebookUUID = nerdletUrlState.notebook;
                              const storageNotebooks = userStorage.map(({ document }) => document);
                              // create our array of notebooks
                              const notebooks = storageNotebooks.length == 0 ? [emptyNotebook, defaultNotebook] : [emptyNotebook, ...storageNotebooks];
                              //select current notebook
                              let currentNotebook = notebooks.find(notebook => notebook.uuid == selectedNotebookUUID);
                              currentNotebook = currentNotebook || defaultNotebook;

                              return (
                                <div className="notebook">
                                  {this.renderHeader(currentNotebook, notebooks)}
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
                                      ref={r => (this.importTextArea = r)}
                                      className="notebook-import-export-box"
                                    />
                                    <Button
                                      onClick={() => {
                                        const encodedNotebook = this
                                          .importTextArea.value;
                                        if (encodedNotebook) {
                                          const decodedNotebook = JSON.parse(
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
}
