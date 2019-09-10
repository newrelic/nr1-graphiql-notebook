const gettingStartedNotebook = (accountId) => {
  return {
    "uuid":"91620335-52f3-4425-973d-a8ed16751a65",
    "title":"Getting Started",
    "cells": [
      { "query": "{\n  actor {\n    user {\n      email\n      name\n    }\n  }\n}",
        "notes": "Welcome! This is a GraphiQL Notebook. Notebooks are composed of cells. A cell, like this one, contains a section for notes and an instance of the GraphiQL query editor. Let's run a query to see the output."
      },

      { "query": "{\n  actor {\n    entitySearch(queryBuilder: {type: APPLICATION}) {\n      results {\n        entities {\n          guid\n          accountId\n          name\n          tags {\n            key\n            values\n          }\n          ... on AlertableEntityOutline {\n            alertSeverity\n          }\n        }\n      }\n    }\n  }\n}\n",
        "notes": "GraphiQL Notebook output is \"context aware\". It contains renderers that try to show you interesting things in the output. Here's an example of a query that takes advantage of custom rendering."
      },

      { "query": `{\n  actor {\n    account(id: ${accountId}) {\n      nrql(query: \"SELECT count(*) FROM Transaction SINCE 10 minutes ago\") {\n        suggestedFacets {\n          nrql\n        }\n      }\n    }\n  }\n}\n`,
        "notes": "In this next example you'll see we do a NRQL query and show some interesting things about the suggested facets."
      }
    ]
  }
}

export { gettingStartedNotebook }
