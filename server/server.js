const express = require('express')
const axios = require('axios');
const app = express();

app.get("/files/data", async (req, res) => {

    let dataSet = [];
    const filter = req.query.filter; // Get the filter queryparam

    const url = "https://echo-serv.tbxnet.com/v1/secret/files";
    const response = await axios.get(url, {
        headers: {
            'Authorization': 'Bearer aSuperSecretKey',
        },
    });

    // Get the files names list
    const fileNames = response.data.files;

    for (let i = 0; i < fileNames.length; i++) {
        try {
            const response2 = await axios.get(
                `https://echo-serv.tbxnet.com/v1/secret/file/${fileNames[i]}`, {
                headers: {
                    'Authorization': 'Bearer aSuperSecretKey',
                },
            }
            );

            if (response2.status === 404) {
                console.error(`File not found: ${fileNames[i]}`);
                continue;
            }

            if (response2.status === 500) {
                console.error(`Internal server error: ${fileNames[i]}`);
                continue;
            }

            const info = response2.data;

            const formattedData = [];

            const lines = info.split('\n');
            lines.shift();

            for (const line of lines) {
                if (!line) continue; // Skip empty lines

                const [file, text, number, hex] = line.split(',');

                const formattedObject = {
                    file,
                    lines: {
                        text,
                        number: parseInt(number) || undefined,
                        hex: hex ? hex : undefined,
                    },
                };

                // Filter by the queryparam if available
                if (filter && formattedObject.file !== filter) continue;

                // Omit property if undefined or empty
                for (const property in formattedObject) {
                    if (!formattedObject[property] || formattedObject[property] === '') {
                        delete formattedObject[property];
                    }
                }

                dataSet.push(formattedObject);
            }

        } catch (error) {
            console.error(error);
        }
    }

    res.setHeader('Content-Type', 'application/json');
    res.json({ data: dataSet });

});

app.get("/files/list", async (req, res) => {

    let list;

    const url = "https://echo-serv.tbxnet.com/v1/secret/files";
    const response = await axios.get(url, {
        headers: {
            'Authorization': 'Bearer aSuperSecretKey',
        },
    });

    res.setHeader('Content-Type', 'application/json');
    res.json(response.data);

});

app.use((err, req, res, next) => {

    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });

});

const PORT = 8080;

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));

