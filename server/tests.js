const express = require('express');
const axios = require('axios');
const chai = require('chai');
const expect = chai.expect;

describe('API', () => {
    it('Debe devolver una respuesta JSON con la información de los archivos', async () => {
        // Obtener la respuesta del API
        const response = await axios.get('http://localhost:8080/files/data');

        // Validar la respuesta
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.data.length).to.be.greaterThan(0);

        for (const fileSet of response.data) {
            for (const file of fileSet) {
                expect(file.file).to.be.a('string');
                expect(file.text).to.be.a('string');
                if (file.number !== null) {
                    expect(file.number).to.be.a('number');
                }
                if (file.hex !== null) {
                    expect(file.hex).to.be.a('string');
                }
            }
        }
    });
});