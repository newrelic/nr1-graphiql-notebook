import React from 'react';
import PropTypes from 'prop-types';

import {
  NerdGraphQuery,
  Spinner,
  TextField,
  Button,
  Stack,
  StackItem
} from 'nr1';
import GraphiQL from 'graphiql';
import JSONTree from 'react-json-tree';

import { expandResponse } from './results/augmentation.js';
import { notebookJsonTreeStyling } from './notebook-json-tree-styling.js';
import GraphiQLExplorer from 'graphiql-explorer';
import NotebookStorage from './graphiql/notebook-storage.js';

const NodeRenderer = require('./renderers/render.js');

export default class NotebookCell extends React.Component {
  static propTypes = {
    uuid: PropTypes.string,
    notes: PropTypes.array,
    query: PropTypes.string,
    onChange: PropTypes.func,
    accounts: PropTypes.array,
    schema: PropTypes.object,
    addCell: PropTypes.func,
    cellIndex: PropTypes.string,
    collapsed: PropTypes.bool,
    onExpand: PropTypes.bool,
    onDelete: PropTypes.func,
    domRef: PropTypes.object,
    onCollapse: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.storage = new NotebookStorage(this.props.uuid);
    this.state = {
      notes: this.props.notes || undefined,
      query: this.props.query || '',
      queryResponse: {}
    };
  }

  static cellCounter = 0;

  // Obviously the state of the children should be pulled up
  // but GraphiQL doesn't make that easy, especially combined with OneGraph's Explorer.
  // This is the fix until we can do it right
  serialize = () => {
    return {
      query: this.state.query,
      notes: this.state.notes,
      uuid: this.props.uuid
    };
  };

  stripTypeName = results => {
    const omitTypename = (key, value) =>
      key === '__typename' ? undefined : value;
    return JSON.parse(JSON.stringify(results), omitTypename);
  };

  onEditQuery = query => {
    this.setState({ query }, () => {
      this.props.onChange(this.serialize());
    });
  };

  onEditNotes = evt => {
    this.setState({ notes: evt.target.value }, () => {
      this.props.onChange(this.serialize());
    });
  };

  onClickDocsLink = fieldOrType => {
    this.graphiQLInstance &&
      this.graphiQLInstance.setState({ docExplorerOpen: true }, () => {
        this.graphiQLInstance.docExplorerComponent.showDoc(fieldOrType);
      });
  };

  getDefaultScalarArgValue = (parentField, arg, argType) => {
    const defaultAccount = this.props.accounts[0];
    if (parentField.name === 'account' && arg.name === 'id' && defaultAccount) {
      return { kind: 'IntValue', value: defaultAccount.id };
    }
    if (arg.name === 'accountId' && defaultAccount) {
      return { kind: 'IntValue', value: defaultAccount.id };
    }
    if (argType === 'Nrql') {
      return {
        kind: 'StringValue',
        value: 'SELECT * FROM Transaction SINCE 1 hour ago LIMIT 10'
      };
    }
    if (parentField.name === 'nrql' && arg.name === 'timeout') {
      return { kind: 'IntValue', value: 5 };
    }
    return GraphiQLExplorer.defaultValue(argType);
  };

  fetcher = ({ query, variables }) => {
    return NerdGraphQuery.query({
      query,
      variables,
      fetchPolicyType: 'no-cache'
    }).then(({ data, errors }) => {
      this.setState({ jsonTreeLoading: true }, () => {
        setTimeout(() => {
          this.setState({
            jsonTreeLoading: false,
            queryResponse: expandResponse(
              this.props.schema,
              query,
              variables,
              data
            ),
            errors: errors
          });
        }, 0);
      });
      return { data: this.stripTypeName(data), errors };
    });
  };

  renderErrors() {
    if (!this.state.errors) return null;
    return (
      <>
        <div className="cell-out-error">Errors [{this.props.cellIndex}]</div>
        <JSONTree
          data={this.state.errors}
          theme={notebookJsonTreeStyling()}
          hideRoot
          shouldExpandNode={() => true}
        />
      </>
    );
  }

  render() {
    if (!this.props.schema) return <Spinner fillContainer />;
    return (
      <div ref={this.props.domRef} className="notebook-cell">
        <div className="notebook-cell-header">
          <Stack fullWidth gapType={Stack.GAP_TYPE.NONE}>
            <StackItem shrink>
              <div className="cell-in-label">In [{this.props.cellIndex}]</div>
            </StackItem>
            <StackItem grow style={{ textAlign: 'right' }}>
              <Button
                style={{ paddingRight: '0px' }}
                onClick={this.props.onDelete}
                type={Button.TYPE.PLAIN_NEUTRAL}
                disabled={this.props.cellIndex === 0}
                iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_REMOVE}
              />
            </StackItem>
          </Stack>
        </div>

        <div className="notebook-cell-notes">
          <TextField
            style={{ marginBottom: '7px' }}
            multiline
            label="Notes"
            placeholder="e.g. Lorem Ipsum"
            value={this.state.notes}
            onChange={this.onEditNotes}
          />
        </div>

        <div
          className="notebook-cell-input-summary-bar"
          onClick={this.props.onExpand}
          style={{ display: this.props.collapsed ? null : 'none' }}
        >
          <Stack fullWidth horizontalType={Stack.HORIZONTAL_TYPE.BOTTOM}>
            <StackItem grow className="notebook-cell-input-summary">
              {this.state.query}
            </StackItem>
            <StackItem>
              <Button
                className="notebook-cell-input-expand"
                type={Button.TYPE.PLAIN_NEUTRAL}
                iconType={Button.ICON_TYPE.INTERFACE__ARROW__EXPAND}
              />
            </StackItem>
          </Stack>
        </div>

        <div
          style={{
            textAlign: 'right',
            display: this.props.collapsed ? 'none' : null
          }}
        >
          <Button
            className="notebook-cell-input-collapse"
            onClick={this.props.onCollapse}
            type={Button.TYPE.PLAIN_NEUTRAL}
            iconType={Button.ICON_TYPE.INTERFACE__ARROW__SHRINK}
          />
        </div>

        <div
          className="graphiql-container"
          style={{ display: this.props.collapsed ? 'none' : null }}
        >
          <div className="notebook-graphiql-explorer-container">
            <GraphiQLExplorer
              schema={this.props.schema}
              query={this.state.query}
              onEdit={this.onEditQuery}
              onClickDocsLink={this.onClickDocsLink}
              explorerIsOpen
              getDefaultScalarArgValue={this.getDefaultScalarArgValue}
            />
          </div>
          <GraphiQL
            ref={ref => {
              this.graphiQLInstance = ref;
            }}
            fetcher={this.fetcher}
            schema={this.props.schema}
            storage={this.storage}
            query={this.state.query}
            onEditQuery={this.onEditQuery}
          >
            <GraphiQL.Logo>
              <span />
            </GraphiQL.Logo>
          </GraphiQL>
        </div>

        <div className="notebook-cell-footer">
          <div className="cell-out-label">Out [{this.props.cellIndex}]</div>

          <div className="cell-out-value">
            {this.state.jsonTreeLoading ? (
              <Spinner />
            ) : (
              <JSONTree
                sortObjectKeys={false}
                postprocessValue={treeHelpers.postprocessValue}
                valueRenderer={treeHelpers.valueRenderer}
                isCustomNode={node =>
                  node && node.__custom && React.isValidElement(node.__custom)
                }
                data={NodeRenderer.renderTree(this.state.queryResponse, {
                  addCell: this.props.addCell
                })}
                theme={notebookJsonTreeStyling()}
                hideRoot
                shouldExpandNode={() => true}
              />
            )}
          </div>

          {!this.state.jsonTreeLoading && this.state.errors
            ? this.renderErrors()
            : null}
        </div>
      </div>
    );
  }
}

const treeHelpers = {
  postprocessValue: node => {
    if (node && node.__meta) {
      const { __meta, ...nodeWithoutMeta } = node;
      return nodeWithoutMeta;
    } else {
      return node;
    }
  },

  valueRenderer: node => node.__custom || node
};
