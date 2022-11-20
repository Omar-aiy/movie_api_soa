const { addMovie, getMovies, deleteAll } = require("./db");

const seed = async () => {
    const movies = await getMovies();
    movies.forEach(async (movie) => {
        await addMovie(movie);
    });
};

seed().then(() => {}).catch(error => console.log(error));
// deleteAll().then((res) => console.log(res)).catch((err) => console.log(err));