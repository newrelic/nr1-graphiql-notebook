import React from 'react';
import { List, ListItem, Button } from 'nr1'
import { normalizeWhitespace } from '../renderer-util.js'

export default class EntityTagsRenderer extends React.Component {
  static test(node) {
    return node.__meta.list && node.__meta.ofTypeName == "EntityTag"
  }

  render() {
    let tags = this.props.node.value
    return <List rowHeight={30}>
      {
        this.expandTags(tags).map((tag) => {
          return <ListItem key={tag.key}>
            <b>{tag.key}</b>={tag.value}
            &nbsp;
            {this.renderEntitySearchButton(tag.key, tag.value)}
            </ListItem>
        })
      }
    </List>
  }

  expandTags(tags) {
    return flatMap(tags, (tag) => {
      return tag.values.value.map((tagValue) => {
        return {key: tag.key.value, value: tagValue.value}
      })
    })
  }

  renderEntitySearchButton(tagKey, tagValue) {
    let addCell = this.props.addCell
    let suggestedQuery = `
  {
    actor {
      entitySearch(queryBuilder: {tags: {key: "${tagKey}", value: "${tagValue}"}}) {
        query
        results {
          entities {
            name
            guid
          }
        }
      }
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
            Search for entities tagged with ${tagKey}=${tagValue}.
            The 'entitySearch' field allows you to search entities
            based on specific attributes with a NRQL-like syntax.`)
          })
        }}
      >
        Query for entities with this tag
      </Button>
  }
}

function flatMap(list, fn) {
  return list.reduce((result, element) => {
    return result.concat(fn(element) || [])
  }, [])
}
