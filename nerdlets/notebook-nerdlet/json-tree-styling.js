// This... is the way react-json-tree does styling. So. I guess this is how we're going to style react-json-tree.

export function ourStyling() {
  const palette = {
    "brand-050": "#f0fcfc",
    "brand-100": "#c9f3f5",
    "brand-400": "#52c6cc",
    "brand-800": "#007e8a",
    "brand-900": "#005054",

    "neutral-050": "#fafbfb",
    "neutral-100": "#f4f5f5",
    "neutral-400": "#d5d7d7",
    "neutral-800": "#2a3434",
    "neutral-900": "#000e0e",

    "neutral-extended-050": "#fafbfb",
    "neutral-extended-100": "#f4f5f5",
    "neutral-extended-200": "#edeeee",
    "neutral-extended-300": "#e3e4e4",
    "neutral-extended-400": "#d5d7d7",
    "neutral-extended-500": "#b9bdbd",
    "neutral-extended-600": "#8e9494",
    "neutral-extended-700": "#464e4e",
    "neutral-extended-800": "#2a3434",
    "neutral-extended-900": "#000e0e",

    "blue-050": "#f2fafc",
    "blue-100": "#d0f0ff",
    "blue-400": "#6cf",
    "blue-800": "#0079bf",
    "blue-900": "#003555",

    "green-050": "#f2fcf3",
    "green-100": "#d0ffd1",
    "green-400": "#68f261",
    "green-800": "#11a600",
    "green-900": "#085400",

    "yellow-050": "#fcf9f2",
    "yellow-100": "#fff4d1",
    "yellow-400": "#ffd966",
    "yellow-800": "#bf9600",
    "yellow-900": "#544c00",

    "red-050": "#fcf2f3",
    "red-100": "#ffd1d7",
    "red-400": "#ff667a",
    "red-800": "#bf0016",
    "red-900": "#54000b"
  }

  const colors = {
    BACKGROUND_COLOR: "none",
    LABEL_COLOR: palette["blue-800"],
    ARROW_COLOR: palette["neutral-extended-500"],
    ITEM_STRING_EXPANDED_COLOR: palette["neutral-extended-500"],
    ITEM_STRING_COLOR: palette["neutral-extended-500"],
    STRING_COLOR: palette["red-400"],
    DATE_COLOR: palette["green-400"],
    NUMBER_COLOR: palette["blue-400"],
    BOOLEAN_COLOR: palette["green-800"],
    NULL_COLOR: palette["neutral-extended-500"],
    UNDEFINED_COLOR: "#aaa",
    FUNCTION_COLOR: "#aaa",
    SYMBOL_COLOR: "#aaa",
  }

  const valueColorMap = colors => ({
    String: colors.STRING_COLOR,
    Date: colors.DATE_COLOR,
    Number: colors.NUMBER_COLOR,
    Boolean: colors.BOOLEAN_COLOR,
    Null: colors.NULL_COLOR,
    Undefined: colors.UNDEFINED_COLOR,
    Function: colors.FUNCTION_COLOR,
    Symbol: colors.SYMBOL_COLOR
  });

  return {
    tree: {
      border: 0,
      padding: 0,
      marginTop: '0.5em',
      marginBottom: '0.5em',
      marginLeft: '0.125em',
      marginRight: 0,
      lineHeight: '23px',
      listStyle: 'none',
      fontSize: '14px',
      MozUserSelect: 'none',
      WebkitUserSelect: 'none',
      backgroundColor: colors.BACKGROUND_COLOR
    },

    value: ({ style }, nodeType, keyPath) => ({
      style: {
        ...style,
        paddingTop: '0.25em',
        paddingRight: 0,
        marginLeft: '0.875em',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
        wordWrap: 'break-word',
        // paddingLeft: keyPath.length > 1 ? '2.125em' : '1.25em',
        paddingLeft: '1.25em',
        textIndent: '0em',
        wordBreak: 'break-all'
      }
    }),

    label: {
      display: 'inline-block',
      fontWeight: '600',
      color: colors.LABEL_COLOR,
      verticalAlign: "top"
    },

    valueLabel: {
      margin: '0 0.5em 0 0'
    },

    valueText: ({ style }, nodeType) => ({
      style: {
        ...style,
        color: valueColorMap(colors)[nodeType]
      }
    }),

    itemRange: (styling, expanded) => ({
      style: {
        paddingTop: expanded ? 0 : '0.25em',
        cursor: 'pointer',
        color: colors.LABEL_COLOR
      }
    }),

    arrow: ({ style }, nodeType, expanded) => ({
      style: {
        ...style,
        marginLeft: 0,
        transition: '150ms',
        WebkitTransition: '150ms',
        MozTransition: '150ms',
        WebkitTransform: expanded ? 'rotateZ(90deg)' : 'rotateZ(0deg)',
        MozTransform: expanded ? 'rotateZ(90deg)' : 'rotateZ(0deg)',
        transform: expanded ? 'rotateZ(90deg)' : 'rotateZ(0deg)',
        transformOrigin: '45% 50%',
        WebkitTransformOrigin: '45% 50%',
        MozTransformOrigin: '45% 50%',
        position: 'relative',
        lineHeight: '1.1em',
        fontSize: '0.75em'
      }
    }),

    arrowContainer: ({ style }, arrowStyle) => ({
      style: {
        ...style,
        display: 'inline-block',
        paddingRight: '0.5em',
        paddingLeft: arrowStyle === 'double' ? '1em' : 0,
        cursor: 'pointer'
      }
    }),

    arrowSign: {
      color: colors.ARROW_COLOR
    },

    arrowSignInner: {
      position: 'absolute',
      top: 0,
      left: '-0.4em'
    },

    nestedNode: ({ style }, keyPath, nodeType, expanded, expandable) => ({
      style: {
        ...style,
        position: 'relative',
        paddingTop: '0.25em',
        marginLeft: keyPath.length > 1 ? '0.875em' : 0,
        paddingLeft: !expandable ? '1.125em' : 0
      }
    }),

    rootNode: {
      padding: 0,
      margin: 0
    },

    nestedNodeLabel: ({ style }, keyPath, nodeType, expanded, expandable) => ({
      style: {
        ...style,
        margin: 0,
        padding: 0,
        WebkitUserSelect: expandable ? 'inherit' : 'text',
        MozUserSelect: expandable ? 'inherit' : 'text',
        cursor: expandable ? 'pointer' : 'default'
      }
    }),

    nestedNodeItemString: ({ style }, keyPath, nodeType, expanded) => ({
      style: {
        ...style,
        paddingLeft: '0.5em',
        cursor: 'default',
        color: expanded
          ? colors.ITEM_STRING_EXPANDED_COLOR
          : colors.ITEM_STRING_COLOR
      }
    }),

    nestedNodeItemType: {
      marginLeft: '0.3em',
      marginRight: '0.3em'
    },

    nestedNodeChildren: ({ style }, nodeType, expanded) => ({
      style: {
        ...style,
        padding: 0,
        margin: 0,
        listStyle: 'none',
        display: expanded ? 'block' : 'none'
      }
    }),

    rootNodeChildren: {
      padding: 0,
      margin: 0,
      listStyle: 'none'
    }
  };
};
