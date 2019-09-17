import React from 'react';
import { navigation, Button, LineChart, BarChart, PieChart } from 'nr1';
import { searchAncestors } from '../results/util.js'

export default class NRQLRenderer extends React.Component {

  constructor(props) {
    super(props)

    let accountId = searchAncestors(this.props.node,
      (ancestor) => ancestor.__meta.typename == 'Account',
      (ancestor) => ancestor.id || parseInt(ancestor.__meta.context.arguments.id.value))

    this.state = {
      accountId: accountId,
      nrqlQuery: this.props.node.value,
      chart: null
    }
  }

  static test(node) {
    return node.__meta.typename == "Nrql"
  }

  renderChart() {
    let {nrqlQuery, accountId, chart} = this.state
    switch (chart) {
      case "line":
        return <div style={{ width: "100%", height: "300px", marginTop: "20px" }}>
          <LineChart fullWidth accountId={accountId} query={nrqlQuery}/>
        </div>

      case "bar":
        return <div style={{ width: "100%", height: "300px", marginTop: "20px" }}>
          <BarChart fullWidth accountId={accountId} query={nrqlQuery}/>
        </div>

      case "pie":
        return <div style={{ width: "100%", height: "300px", marginTop: "20px" }}>
          <PieChart fullWidth accountId={accountId} query={nrqlQuery}/>
        </div>

      default:
        return null
    }
  }

  render() {
    let {nrqlQuery, accountId} = this.state
    let { addCell } = this.props.util
    let suggestedQuery = `
{
  actor {
    account(id: ${accountId}) {
      nrql(query: "${nrqlQuery}") {
        results
      }
    }
  }
}`

    return <>
      <div className="json-tree-text-field json-tree-value-widget nrql-renderer">
        &nbsp;
        "{nrqlQuery}"
        <br />
        <Button
          type={Button.TYPE.PLAIN_NEUTRAL}
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.DATAVIZ__DATAVIZ__CHART__A_EDIT}
          onClick={() => {
            navigation.openStackedNerdlet({
              id: 'wanda-data-exploration.data-explorer',
              urlState: {
                initialActiveInterface: "nrqlEditor",
                initialNrqlValue: nrqlQuery,
                initialAccountId: accountId
              }
            });
          }}
        >
          View in Chart Builder
        </Button>
        <Button
          type={Button.TYPE.PLAIN_NEUTRAL}
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.DATAVIZ__DATAVIZ__LINE_CHART}
          onClick={() => { this.setState({chart: "line"}) }}
        >
          Render as Line Chart
        </Button>
        <Button
          type={Button.TYPE.PLAIN_NEUTRAL}
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.DATAVIZ__DATAVIZ__PIE_CHART}
          onClick={() => { this.setState({chart: "pie"}) }}
        >
          Render as Pie Chart
        </Button>
        <Button
          type={Button.TYPE.PLAIN_NEUTRAL}
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.DATAVIZ__DATAVIZ__BAR_CHART}
          onClick={() => { this.setState({chart: "bar"}) }}
        >
          Render as Bar Chart
        </Button>
        <Button
          type={Button.TYPE.PLAIN_NEUTRAL}
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__NODE}
          onClick={() => { addCell({query: suggestedQuery, notes: "It's easy to make NRQL queries in GraphQL."}) }}
        >
          Run NRQL in NerdGraph
        </Button>

        {this.renderChart()}
      </div>
    </>
  }
}

