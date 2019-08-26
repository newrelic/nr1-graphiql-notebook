import React from "react"
import GraphiQLExplorer from 'graphiql-explorer'

export default class NotebookGraphiqlExplorer extends React.Component {
  getDefaultScalarArgValue = (parentField, arg, argType) => {
    if (parentField.name == "account" && arg.name == "id" && this.props.accountId) {
      return { kind: 'IntValue', value: this.props.accountId };
    }
    if (argType == "Nrql") {
      return { kind: 'StringValue', value: "SELECT * FROM Transaction" };
    }
    if (parentField.name == "nrql" && arg.name == "timeout") {
      return { kind: 'IntValue', value: 5 };
    }
    return GraphiQLExplorer.defaultValue(argType)
  }

  render() {
    return <GraphiQLExplorer
      schema={this.props.schema}
      defaultQuery={this.props.defaultQuery}
      query={this.props.query}
      onEdit={this.props.onEditQuery}
      onClickDocsLink={this.props.onClickDocsLink}
      explorerIsOpen={true}
      getDefaultScalarArgValue={this.getDefaultScalarArgValue}
    />
  }
}
