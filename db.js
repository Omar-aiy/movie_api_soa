const { Client } = require("pg");
const { getMoviesAPI } = require("./exteren-api");
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('./constants');

const client = new Client({ user: DB_USER, host: DB_HOST, database: DB_NAME, password: DB_PASSWORD, port: DB_PORT });
client.connect().then(() => console.log("Connected to database")).catch(error => console.log(error));


const getMovies = async (page=1) => {
    const movies = await getMoviesAPI(page);
    const { rows } = await client.query(`SELECT * FROM product WHERE type='Movie'`);
    let array = [];
    movies.forEach(movie => {
        const dbMovie = rows.find(dbMovie => dbMovie.title == movie.title);
        if (dbMovie) array.push(dbMovie);
        else addMovie(movie).then(async () => array.push(await getMovieByTitle(movie.title)));
    });
    console.log(array.length);
    return array;
};

const getMovieById = async (id) => {
    const { rows } = await client.query(`SELECT * FROM product WHERE id=${id} AND type='Movie'`);
    if (rows.length == 0) throw new Error("Movie not found");
    return rows[0];
};

const getMovieByTitle = async (title) => {
    const { rows } = await client.query(`SELECT * FROM product WHERE title='${title}' AND type='Movie'`);
    if (rows.length == 0) throw new Error("Movie not found");
    return rows[0];
};

const addMovie = async ({title, description, picture_url, price}) => await editOrAddMovie(0, {title, description, picture_url, price}, true);

const editMovie = async (id, {title, description, picture_url, price}) => await editOrAddMovie(id, {title, description, picture_url, price}, false);

const editOrAddMovie = async (id=0, {title, description, picture_url, price}, add) => {
    if (!title || !description || !picture_url || !price) throw new Error("Missing parameters");
    if (isNaN(price)) throw new Error("Price must be a number");
    if (isNaN(id)) throw new Error("ID must be a number");
    if (price < 0) throw new Error("Price must be positive");
    if (add) {
        if (await getMovieByTitle(title)) throw new Error("Movie already exists");
        const {rowCount} = await client.query(`INSERT INTO product (title, description, picture_url, price, type) VALUES ($1, $2, $3, $4, $5)`, [title, description, picture_url, price, 'Movie']);
        if (rowCount == 0) throw new Error("Failed to add movie");
        return "Added successfully";
    } else {
        const { rowCount } = await client.query(`UPDATE product SET title=$1, description=$2, picture_url=$3, price=$4 WHERE id=$5 AND type=$6`, [title, description, picture_url, price, id, 'Movie']);
        if (rowCount == 0) throw new Error("Failed to edit movie");
        return "Edited successfully";
    }
};

const deleteMovie = async (id) => {
    if (isNaN(id)) throw new Error("ID must be a number");
    if (!(await getMovieById(id))) throw new Error("Movie not found");
    const { rowCount } = await client.query(`DELETE FROM product WHERE id=${id} AND type='Movie'`);
    if (rowCount == 0) throw new Error("Failed to delete movie");
    return "Deleted successfully";
};

const deleteAll = async () => {
    const { rowCount } = await client.query(`DELETE FROM product WHERE type='Movie'`);
    if (rowCount == 0) throw new Error("Failed to delete all movies");
    return "Deleted successfully";
};

module.exports = { getMovies, getMovieById, getMovieByTitle, addMovie, editMovie, deleteMovie, deleteAll};