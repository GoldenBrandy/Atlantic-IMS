export default function UserFeatureDataTable({
    rows = []
}) {
    return <table>
        {}
        <tbody>
            {}
            {rows.map((row, index) => <tr key={index}>
                <td>{JSON.stringify(row)}</td>
            {}
            </tr>)}
        {}
        </tbody>
    {}
    </table>
}