import { query } from "@quinscape/automaton-js"


export default query(
    // language=GraphQL
        `
        query myQuery($id: String!)
        {
            myQuery(id: $id)
            {
                name
                value
            }
        }`,
    {
        "id": "130521f7-bca8-4e4f-a1b6-8a25b4730f01"
    }
)
