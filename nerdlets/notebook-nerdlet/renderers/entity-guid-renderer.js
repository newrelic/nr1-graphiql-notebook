import React from 'react';
import { navigation, Button } from 'nr1';

export default class EntityGuidRenderer extends React.Component {
  static test(node) {
    return node.__meta.typename == "EntityGuid"
  }

  render() {
    let entityGuid = this.props.node.value

    let addCell = this.props.addCell
    let suggestedQuery = `
{
  actor {
    entity(guid: "${entityGuid}") {
      accountId
      type
      domain
      entityType
      name
      indexedAt
      guid
    }
  }
}`
    return <div className="json-tree-text-field json-tree-value-widget">
      &nbsp;
      "{entityGuid}"
      <br />
      <Button
          type={Button.TYPE.PLAIN_NEUTRAL}
          sizeType={Button.SIZE_TYPE.SLIM}
          iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER__S_OK}
          onClick={() => {
            navigation.openStackedNerdlet({
              id: 'slicer-dicer.apm-overview',
              urlState: { entityId: entityGuid }
            });
          }}>
          Visit Entity
      </Button>

      <Button
        type={Button.TYPE.PLAIN_NEUTRAL}
        sizeType={Button.SIZE_TYPE.SLIM}
        iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__NODE}
        onClick={() => { addCell(suggestedQuery) }}
      >
        Query NerdGraph for more details
      </Button>
    </div>
  }
}
