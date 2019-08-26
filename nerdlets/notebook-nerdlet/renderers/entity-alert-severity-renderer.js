import React from 'react';
import { Button } from 'nr1';
import { normalizeWhitespace } from '../renderer-util.js'
import { searchAncestors } from '../augmentation-util.js'

export default class EntityAlertSeverityRenderer extends React.Component {
  static test(node) {
    return node.__meta.typename == "EntityAlertSeverity" && node.value == "NOT_CONFIGURED"
  }

  getEntityGuid() {
    let guid = searchAncestors(this.props.node,
      (ancestor) => ancestor.__meta.typename == 'ApmApplicationEntity' ||
                    ancestor.__meta.typename == 'AlertableEntity',
      (ancestor) => ancestor.__meta.context.arguments.guid.value)
    return guid
  }

  render() {
    let entityGuid = this.getEntityGuid();
    let alertSeverity = this.props.node.value
    return <>
      <span className="json-tree-text-field">
        {alertSeverity}
      </span>
      &nbsp;
      { entityGuid ? this.renderJumpStartButton(entityGuid) : null}
    </>
  }

  renderJumpStartButton(entityGuid) {
    let addCell = this.props.addCell
    let suggestedQuery = `
mutation {
  jumpStartApmApplicationEntityAlerts(
    guid: "${entityGuid}",
    errorRate: {critical: 1.5, warning: 1.5},
    apdex: {critical: 1.5, warning: 1.5},
    responseTimeBaseline: {critical: 1.5, warning: 1.5}) {
    policyId
  }
}
  `
    return <Button
        type={Button.TYPE.NORMAL}
        sizeType={Button.SIZE_TYPE.SLIM}
        iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__NODE}
        onClick={() => {
          return addCell({
            query: suggestedQuery,
            notes: normalizeWhitespace(`
            Jump start your alerting config for an APM Application Entity!
            All you need to supply is the entityGuid. By default, each condition
            has a basic configuration, but you can customize them by providing a
            critical and warning threshold. You can also exclude of any of the
            conditions by setting it to null.`)
          })
        }}
      >
        Add an alert policy to this entity
      </Button>
  }
}
