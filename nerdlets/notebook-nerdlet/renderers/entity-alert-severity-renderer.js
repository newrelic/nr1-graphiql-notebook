import React from 'react';
import { Button } from 'nr1';
import { normalizeWhitespace } from './util';
import { searchAncestors } from '../results/util.js';

export default class EntityAlertSeverityRenderer extends React.Component {
  static test(node) {
    return node.__meta.typename == 'EntityAlertSeverity' && node.value == 'NOT_CONFIGURED';
  }

  getEntityGuid() {
    // TODO: augment response with interfaces as well as typenames so that we can
    // just test against something like the AlertableEntity interface
    if (this.props.node.guid && this.props.node.guid.value) {
      return this.props.node.guid.value;
    }

    const guid = searchAncestors(this.props.node,
      ancestor => ancestor.__meta.typename == 'ApmApplicationEntity' ||
                    ancestor.__meta.typename == 'AlertableEntity' ||
                    ancestor.__meta.typename == 'ApmApplicationEntityOutline' ||
                    ancestor.__meta.typename == 'AlertableEntityOutline',
      ancestor => ancestor.guid && ancestor.guid.value ||
                     ancestor.__meta.context.arguments.guid && ancestor.__meta.context.arguments.guid.value);
    return guid;
  }

  render() {
    const entityGuid = this.getEntityGuid();
    const alertSeverity = this.props.node.value;
    return (
      <>
        <span className="json-tree-text-field">
          {alertSeverity}
        </span>
      &nbsp;
        { entityGuid ? this.renderJumpStartButton(entityGuid) : null}
      </>
    );
  }

  renderJumpStartButton(entityGuid) {
    const { addCell } = this.props.util;
    const suggestedQuery = `
mutation {
  jumpStartApmApplicationEntityAlerts(
    guid: "${entityGuid}",
    errorRate: {critical: 1.5, warning: 1.5},
    apdex: {critical: 1.5, warning: 1.5},
    responseTimeBaseline: {critical: 1.5, warning: 1.5}) {
    policyId
  }
}
  `;
    return (
      <Button
        type={Button.TYPE.NORMAL}
        sizeType={Button.SIZE_TYPE.SMALL}
        iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__NODE}
        onClick={() => {
          addCell({
            query: suggestedQuery,
            notes: normalizeWhitespace(`
            Jump start your alerting config for an APM Application Entity!
            All you need to supply is the entityGuid. By default, each condition
            has a basic configuration, but you can customize them by providing a
            critical and warning threshold. You can also exclude of any of the
            conditions by setting it to null.`)
          });
        }}
      >
        Add an alert policy to this entity
      </Button>
    );
  }
}
