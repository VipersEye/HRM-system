export default class Database {

    async select(table, conditions) {

        let data = {
            table,
            conditions
        };
        let jsonData = JSON.stringify(data);

        let responseHeaders = await fetch('./requests/requestSelect.php', {
            method: 'POST',
            body: jsonData
        });
        let response = await responseHeaders.text();
        return JSON.parse(response);
    }

}