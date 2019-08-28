import React from 'react';
import { NerdGraphQuery } from 'nr1';
import GraphiQL from 'graphiql';
import JSONTree from 'react-json-tree';
import { Spinner, TextField, Button, Stack, StackItem } from 'nr1';
import { expandResponse } from "./response-augmentation.js"
const CustomRender = require('./custom-render.js')
import { ourStyling } from "./json-tree-styling.js"
import GraphiQLExplorer from "graphiql-explorer"
import NotebookStorage from './graphiql/notebook-storage.js';

export default class NotebookCell extends React.Component {
  static cellCounter = 0

  constructor(props) {
    super(props)

    this.cellId = this.props.cellId
    this.storage = new NotebookStorage(this.cellId)
    this.resultsRef = React.createRef()
    this.state = {
      notes: this.props.notes || undefined,
      query: this.props.query || this.storage.getSavedQuery() || undefined,
      queryResponse: {},
    }
  }

  // I know I know...
  serialize = () => { return {query: this.state.query, notes: this.state.notes} }

  stripTypeName = (results) => {
    const omitTypename = (key, value) => (key === '__typename' ? undefined : value)
    return JSON.parse(JSON.stringify(results), omitTypename)
  }

  onEditQuery = (query) => {
    this.setState({ query }, () => {
      this.props.onChange(this.serialize())
    })
  }

  onEditNotes = (evt) => {
    this.setState({ notes: evt.target.value }, () => {
      this.props.onChange(this.serialize())
    })
  }

  onClickDocsLink = (fieldOrType) => {
    this.graphiQLInstance && this.graphiQLInstance.setState({ docExplorerOpen: true }, () => {
      this.graphiQLInstance.docExplorerComponent.showDoc(fieldOrType)
    })
  }

  fetcher = ({ query, variables }) => {
    return NerdGraphQuery
      .query({ query, variables, fetchPolicyType: 'no-cache' })
      .then(({ data, errors }) => {
        this.setState({ jsonTreeLoading: true }, () => {
          setTimeout(() => {
            this.setState({
              jsonTreeLoading: false,
              queryResponse: expandResponse(this.props.schema, query, variables, data) },
              () => { this.resultsRef.current.scrollIntoView() })
          }, 0)
        })
        return { data: this.stripTypeName(data), errors }
      })
  }

  render() {
    if (!this.props.schema) return <Spinner fillContainer />;
    return <div ref={this.props.domRef} className="notebook-cell">
        <div className="notebook-cell-header">
          <Stack gapType={Stack.GAP_TYPE.NONE}>
            <StackItem shrink={true}>
              <div className="cell-in-label">In [{this.cellId}]</div>
            </StackItem>
            <StackItem grow={true} style={{textAlign: "right"}}>
              <Button
                style={{paddingRight: "0px"}}
                onClick={() => alert("remove")}
                type={Button.TYPE.PLAIN_NEUTRAL}
                iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_REMOVE} />
            </StackItem>
          </Stack>
        </div>

        <div className="notebook-cell-notes">
          <TextField
            style={{marginBottom: "7px"}}
            multiline
            label="Notes"
            placeholder='e.g. Lorem Ipsum'
            value={this.state.notes}
            onChange={this.onEditNotes} />
        </div>

      <div className="notebook-cell-input-summary-bar" onClick={this.props.onExpand} style={{display: this.props.collapsed ? null : "none"}}>
        <Stack alignmentType={Stack.ALIGNMENT_TYPE.TRAILING}>
          <StackItem grow={true} className="notebook-cell-input-summary">
            {this.state.query}
          </StackItem>
          <StackItem>
            <Button
              className="notebook-cell-input-expand"
              type={Button.TYPE.PLAIN_NEUTRAL}
              iconType={Button.ICON_TYPE.INTERFACE__ARROW__EXPAND} />
          </StackItem>
        </Stack>
      </div>


      <div style={{textAlign: "right", display: this.props.collapsed ? "none" : null}}>
        <Button
              className="notebook-cell-input-collapse"
              onClick={this.props.onCollapse}
              type={Button.TYPE.PLAIN_NEUTRAL}
              iconType={Button.ICON_TYPE.INTERFACE__ARROW__SHRINK} />
      </div>

      <div className="graphiql-container" style={{display: this.props.collapsed ? "none" : null}}>
        <div className="notebook-graphiql-explorer-container">
          <GraphiQLExplorer
            schema={this.props.schema}
            query={this.state.query}
            onEdit={this.onEditQuery}
            onClickDocsLink={this.onClickDocsLink}
            explorerIsOpen={true}
            getDefaultScalarArgValue={ this.getDefaultScalarArgValue }
          />
        </div>
        <GraphiQL
          ref={(ref) => { this.graphiQLInstance = ref }}
          fetcher={this.fetcher}
          schema={this.props.schema}
          storage={ this.storage }
          query={this.state.query}
          onEditQuery={this.onEditQuery}>
          <GraphiQL.Logo>{<span></span>}</GraphiQL.Logo>
        </GraphiQL>
      </div>

      <div ref={this.resultsRef} className="notebook-cell-footer">
        <div className="cell-out-label">
          Out [{this.cellId}]
        </div>

        <div className="cell-out-value">
          {this.state.jsonTreeLoading ?
            <Spinner /> :
            <JSONTree
              sortObjectKeys={false}
              postprocessValue={treeHelpers.postprocessValue}
              valueRenderer={treeHelpers.valueRenderer}
              isCustomNode={React.isValidElement}
              data={CustomRender.renderTree(this.state.queryResponse, this.props.addCell)}
              theme={ourStyling()}
              hideRoot={true}
              shouldExpandNode={() => true}
            />
          }
        </div>
      </div>
    </div>
  }
}

let treeHelpers = {
  postprocessValue: (node) => {
    if (node && node.__meta) {
      let { __meta, ...nodeWithoutMeta } = node
      return nodeWithoutMeta
    } else {
      return node
    }
  },

  // TODO really need dis?
  valueRenderer: (node) => node.__custom || node
}
