import { navigation } from 'nr1'
import { Button, SparklineChart, LineChart } from 'nr1';

let RENDERERS = [
  {
    test: (node) => node.__meta.typename == "EpochMilliseconds",
    render: (node) => {
      return new Date(node.value)
    }
  },
  {
    test: (node) => node.__meta.typename == "Nrql",
    render: (node) => {
      //TODO — offer a util to search ancestors using a given fnc, could traverse up until it finds an account object
      let accountId = parseInt(node.__meta.parent.__meta.parent.__meta.parent.__meta.parent.__meta.context.arguments.id.value)
      let query = node.value
      //TODO find a way to style things (larger line height for the whole thing? how much can I style JSON tree?)
      return {
        __custom: <><div className="json-tree-text-field json-tree-value-widget">
          &nbsp;
          <Button
            type={Button.TYPE.PLAIN_NEUTRAL}
            sizeType={Button.SIZE_TYPE.SLIM}
            iconType={Button.ICON_TYPE.DATAVIZ__DATAVIZ__CHART__A_EDIT}
            onClick={() => {
              navigation.openCard({
                id: 'wanda-data-exploration.data-explorer',
                urlState: {
                  initialActiveInterface: "nrqlEditor",
                  initialNrqlValue: query,
                  initialAccountId: accountId
                }
              });
            }}
          >
            View in Chart Builder
          </Button>
          <br/>
          "{node.value}"
          <br/>
          <Button
            type={Button.TYPE.PLAIN_NEUTRAL}
            sizeType={Button.SIZE_TYPE.SLIM}
            iconType={Button.ICON_TYPE.DATAVIZ__DATAVIZ__LINE_CHART}
          >
            Render as Line Chart
          </Button>
          <Button
            type={Button.TYPE.PLAIN_NEUTRAL}
            sizeType={Button.SIZE_TYPE.SLIM}
            iconType={Button.ICON_TYPE.DATAVIZ__DATAVIZ__PIE_CHART}
          >
            Render as Pie Chart
          </Button>
          <Button
            type={Button.TYPE.PLAIN_NEUTRAL}
            sizeType={Button.SIZE_TYPE.SLIM}
            iconType={Button.ICON_TYPE.DATAVIZ__DATAVIZ__BAR_CHART}
          >
            Render as Bar Chart
          </Button>
          <Button
            type={Button.TYPE.PLAIN_NEUTRAL}
            sizeType={Button.SIZE_TYPE.SLIM}
            iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__NODE}
            onClick={() => { console.log("click") }}
          >
            Query in NerdGraph
          </Button>
          <div style={{width: "600px", height:"300px"}}>
            <LineChart
              accountId={accountId}
              query={query}
            />
          </div>
        </div>
        </>
      }
    }
  },
  {
    test: (node) => node.__meta.typename == "EntityGuid",
    render: (node) => {
      return {
        __custom: <div className="json-tree-text-field json-tree-value-widget">
          &nbsp;
          <Button
            type={Button.TYPE.PLAIN_NEUTRAL}
            sizeType={Button.SIZE_TYPE.SLIM}
            iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER__S_OK}
            onClick={() => {
            navigation.openCard({
              id: 'slicer-dicer.apm-overview',
              urlState: { entityId: node.value }
            });
          }}>
            Visit Entity
          </Button>

          <Button
            type={Button.TYPE.PLAIN_NEUTRAL}
            sizeType={Button.SIZE_TYPE.SLIM}
            iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__NODE}
            onClick={() => { console.log("click") }}
          >
            Query for more details
          </Button>
          <br/>
          "{node.value}"
        </div>
      }
    }
  },
  {
    test: (node) => node.__meta.leaf,
    render: (node) => node.value
  }
]

//TODO the logic around stripping meta data feels really clunky :/
export function renderTree(node) {
  if (!node.__meta) return node
  let renderedNode = { ...node }
  let renderer = RENDERERS.find((renderer) => renderer.test(renderedNode))
  if (renderer) renderedNode = renderer.render(renderedNode)
  if (!renderedNode.__custom && renderedNode.__meta) transformChildren(renderedNode)
  return renderedNode
}

function transformChildren(node) {
  if (node.__meta.list) {
    node.value = node.value.map(renderTree)
  } else {
    Object.entries(node).forEach(([field, value]) => {
      node[field] = renderTree(value)
    })
  }
}
