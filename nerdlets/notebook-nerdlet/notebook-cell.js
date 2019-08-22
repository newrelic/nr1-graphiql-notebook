import React from 'react';
import { NerdGraphQuery } from 'nr1';
import GraphiQL from 'graphiql';
import JSONTree from 'react-json-tree';
import { Spinner, TextField, Button, Stack, StackItem } from 'nr1';
import { expandResponse } from "./response-augmentation.js"
const CustomRender = require('./custom-render.js')
import { ourStyling } from "./json-tree-styling.js"

export default class NotebookCell extends React.Component {
  static cellCounter = 0

  constructor(props) {
    super(props)
    this.cellId = NotebookCell.cellCounter
    this.state = {
      queryResponse: {}
    }
    NotebookCell.cellCounter++
  }

  stripTypeName = (results) => {
    const omitTypename = (key, value) => (key === '__typename' ? undefined : value)
    return JSON.parse(JSON.stringify(results), omitTypename)
  }

  fetcher = ({ query, variables }) => {
    return NerdGraphQuery
      .query({ query, variables, fetchPolicyType: 'no-cache' })
      .then(({ data, errors }) => {
        this.setState({ jsonTreeLoading: true}, () => {
          setTimeout(() => {
            this.setState({ jsonTreeLoading: false, queryResponse: expandResponse(this.props.schema, query, variables, data) })
          }, 0)
        })
        return { data: this.stripTypeName(data), errors }
      })
  }

  render() {
    if (!this.props.schema) return <Spinner fillContainer />;

    return <div className="notebook-cell">
      <Stack gapType={Stack.GAP_TYPE.BASE}>
        <StackItem grow={true}>
          <TextField
            style={{ margin: "14px" }}
            multiline
            label={`Notes [${this.cellId}]`}
            placeholder='e.g. Lorem Ipsum'
          />
        </StackItem>
        <StackItem shrink={true}>
          <Button
            onClick={() => alert("remove")}
            type={Button.TYPE.PLAIN_NEUTRAL}
            iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__FILE__A_REMOVE} />

        </StackItem>
      </Stack>

      <div>
        <GraphiQL
          fetcher={this.fetcher}
          schema={this.props.schema}
        >
          <GraphiQL.Logo className="cell-label cell-in">In [{this.cellId}]</GraphiQL.Logo>
        </GraphiQL>
      </div>

      <div className="cell-out-label">
        Out [{this.cellId}]
      </div>

      <div className="cell-out-value">
        { this.state.jsonTreeLoading ?
        <Spinner/> :
        <JSONTree
          sortObjectKeys={false}
          postprocessValue = {(node) => {
            if (node.__meta) {
              let { __meta, ...nodeWithoutMeta } = node
              return nodeWithoutMeta
            } else {
              return node
            }
          }}
          valueRenderer = {(node) => {
            return node.__custom || node
          }}
          isCustomNode={(node) => node && node.__custom}
          data={CustomRender.renderTree(this.state.queryResponse)}
          theme={ourStyling()}
          shouldExpandNode={() => true}
        />
      }
      </div>
    </div>
  }
}
