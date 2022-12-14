const { Client } = require("pg");
const { getMoviesAPI } = require("./exteren-api");
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('./constants');

const client = new Client({ user: DB_USER, host: DB_HOST, database: DB_NAME, password: DB_PASSWORD, port: DB_PORT });
client.connect().then(() => console.log("Connected to database")).catch(error => console.log(error));


const getMovies = async (page=1) => {
    const movies = await getMoviesAPI(page);
    let array = [];
    movies.forEach(async (movie) => {
        addMovie(movie).then((res) => console.log(res)).catch(error => console.log(error.message))
        array.push(await (getMovieByTitle(movie.title)));
    });
    return array;
};

const getMovieById = async (id) => {
    const { rows } = await client.query(`SELECT * FROM movie WHERE id=${id}`);
    if (rows.length == 0) throw new Error("Movie not found");
    return rows[0];
};

const getMovieByTitle = async (title) => {
    const { rows } = await client.query(`SELECT * FROM movie WHERE title='${title}'`);
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
        try {
            await client.query(`INSERT INTO movie (title, description, picture_url, price) VALUES ('${title}', '${description}', '${picture_url}', ${price}) RETURNING *`);
            const movie = await getMovieByTitle(title);
            return {message: "Added successfully", movie: movie};
        } catch (error) {
            if (error.message.includes("duplicate key value violates unique constraint")) throw new Error("Movie already exists");
            throw new Error("Failed to add movie")
        }
    } else {
        const { rowCount } = await client.query(`UPDATE movie SET title=$1, description=$2, picture_url=$3, price=$4 WHERE id=$5`, [title, description, picture_url, price, id]);
        if (rowCount == 0) throw new Error("Failed to edit movie");
        const {rows} = await client.query(`SELECT * FROM movie ORDER BY id DESC LIMIT 1`);
        return rows;
    }
};

const deleteMovie = async (id) => {
    if (isNaN(id)) throw new Error("ID must be a number");
    if (!(await getMovieById(id))) throw new Error("Movie not found");
    const { rowCount } = await client.query(`DELETE FROM movie WHERE id=${id}`);
    if (rowCount == 0) throw new Error("Failed to delete movie");
    return "Deleted successfully";
};

const deleteAll = async () => {
    const { rowCount } = await client.query(`TRUNCATE movie`);
    if (rowCount == 0) throw new Error("Failed to delete all movies");
    return "Deleted successfully";
};

module.exports = { getMovies, getMovieById, getMovieByTitle, addMovie, editMovie, deleteMovie, deleteAll};