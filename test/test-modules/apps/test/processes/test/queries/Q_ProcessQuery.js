import { query } from "@quinscape/automaton-js"


export default query(
    // language=GraphQL
        `
        query myOtherQuery($id: String!)
        {
            myOtherQuery(id: $id)
            {
                name
                value
            }
        }`,
    {
        "id": "27af1ea6-60d7-423c-849e-d56c1e6983a5"
    }
)
