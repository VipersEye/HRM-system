export default class Database {
	async select(table, conditions = {}) {
		let data = {
			table,
			conditions,
		};

		let jsonData = JSON.stringify(data);

		let responseHeaders = await fetch('./requests/requestSelect.php', {
			method: 'POST',
			body: jsonData,
		});

		let response = await responseHeaders.text();
		return JSON.parse(response);
	}

	async insert(table, values) {
		let data = {
			table,
			values,
		};

		let jsonData = JSON.stringify(data, (key, val) => {
			if (val === '') return;
			return val;
		});

		let responseHeaders = await fetch('./requests/requestInsert.php', {
			method: 'POST',
			body: jsonData,
		});

		let response = await responseHeaders.text();
		return JSON.parse(response);
	}

	async update(table, values, conditions) {
		let data = {
			table,
			values,
			conditions,
		};

		let jsonData = JSON.stringify(data, (key, val) => {
			if (val === '') return;
			return val;
		});

		let responseHeaders = await fetch('./requests/requestUpdate.php', {
			method: 'POST',
			body: jsonData,
		});

		let response = await responseHeaders.text();
		return JSON.parse(response);
	}

	async delete(table, conditions) {
		let data = {
			table,
			conditions,
		};

		let jsonData = JSON.stringify(data, (key, val) => {
			if (val === '') return;
			return val;
		});

		let responseHeaders = await fetch(`./requests/delete/${table}Delete.php`, {
			method: 'POST',
			body: jsonData,
		});

		let response = await responseHeaders.text();
		return JSON.parse(response);
	}

	async move(from, to) {
		let data = {
			from,
			to,
		};

		let jsonData = JSON.stringify(data);

		let responseHeaders = await fetch('./requests/requestMove.php', {
			method: 'POST',
			body: jsonData,
		});

		let response = await responseHeaders.text();
		if (response !== '1')
			throw new Error('При отправке файла произошла ошибка. Попробуйте снова.');
	}
}
