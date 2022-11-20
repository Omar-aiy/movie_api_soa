const axios = require('axios');
const { EXTEREN_API, API_KEY } = require('./constants');
const { formatJSON } = require('./functions');

const api = axios.create({ baseURL: EXTEREN_API, headers: { "Content-type": "application/json" } });

const getMoviesAPI = async (page=1) => {
    const response = await api.get(`/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
    return response.data.results.map(formatJSON);
};

module.exports = { getMoviesAPI };