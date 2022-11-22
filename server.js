const bodyParser = require('body-parser');
require('dotenv').config();
const express = require('express');
const { getMovies, addMovie, editMovie, deleteMovie, getMovieByTitle } = require('./db');
const { getMoviesAPI } = require('./exteren-api');
const { success, fail } = require('./functions');
const { logRequest } = require('./middleware');
const app = express();
const port = process.env.PORT || 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const { runConsumer, sentConfirmation } = require('./kafka');
const swaggerOpts = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SOA Movie API',
            version: '1.0.0',
        },
    },
    apis: ['./server.js'],
};
const swaggerSpec = swaggerJSDoc(swaggerOpts);

runConsumer();

app.use(bodyParser.json());
app.use(logRequest)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => res.send('Movies API - Omar Aiyyachi <br>' + '<a href="https://movie-api-omar.herokuapp.com/api-docs">API Documentation</a>'));

/**
 * @swagger
 * components:
 *  schemas:
 *     Movie:
 *      type: object
 *      properties:
 *          description:
 *              type: string
 *          title:
 *              type: string
 *          picture_url:
 *             type: string
 *          price:
 *             type: integer
 * /movies:
 *  get:
 *      parameters:
 *         - in: query  
 *           name: page
 *           schema: 
 *             type: integer 
 *           required: true
 *      description: Get movies
 *      responses:
 *          '200':
 *              description: A successful response
 *              content:
 *                 application/json:
 *                      schema:
 *                         type: object
 *                         properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              data:
 *                                  type: array
 *                                  items:
 *                                      $ref: '#/components/schemas/Movie'
 *          '400':
 *              description: Bad request error
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: object
 *                         properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              error:
 *                                  type: string
 *                                  example: Bad request
*/
app.get('/movies', (req, res) => 
    getMovies(parseInt(req.query.page))
        .then(response => res.send(success(response)))
        .catch(error => { res.status(400).send(fail(error.message))})
);

/**
 * @swagger
 * components:
 *  schemas:
 *     Movie:
 *      type: object
 *      properties:
 *          description:
 *              type: string
 *          title:
 *              type: string
 *          picture_url:
 *             type: string
 *          price:
 *             type: integer
 * /movies/search:
 *  get:
 *      parameters:
 *         - in: query  
 *           name: title
 *           schema: 
 *             type: string 
 *           required: true
 *           example: Lightyear
 *      description: Get movies
 *      responses:
 *          '200':
 *              description: A successful response
 *              content:
 *                 application/json:
 *                      schema:
 *                         type: object
 *                         properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              data:
 *                                  type: object
 *                                  $ref: '#/components/schemas/Movie'
 *          '400':
 *              description: Bad request error
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: object
 *                         properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              error:
 *                                  type: string
 *                                  example: No movie found
*/
app.get('/movies/search', (req, res) => {
    const { title } = req.query;
    getMovieByTitle(title)
        .then(response => res.send(success(response)))
        .catch(error => res.status(400).send(fail(error.message)))
});

/**
 * @swagger
 * /movies:
 *  post:
 *      description: Add a movie
 *      requestBody:
 *          required: true
 *          content:
 *             application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Movie'
 *                      
 * 
 *      responses:
 *         '200':
 *              description: A successful response
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              data:
 *                                  type: string
 *                                  example: Added successfully
 *         '400':
 *              description: Bad request error
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              data:
 *                                  type: string
 *                                  example: Missing fields
 * */
app.post('/movies', (req, res) => {
    addMovie(req.body)
        .then(async (response) => {
            // await sentConfirmation(req.body, "ok"); 
            res.send(success(response)); 
        })
        .catch(async (error) => { 
            // await sentConfirmation(null, "nok");
            res.status(400).send(fail(error.message));
        });
});

/**
 * @swagger
 * /movies/{id}:
 *  put:
 *      description: Edit a movie
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *                type: integer
 *            required: true
 *            example: 176   
 *      requestBody:
 *          required: true
 *          content:
 *             application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Movie'
 *      responses:
 *         '200':
 *              description: A successful response
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              data:
 *                                  type: string
 *                                  example: Edited successfully
 *         '400':
 *              description: Bad request error
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              data:
 *                                  type: string
 *                                  example: Missing fields
 * */
app.put('/movies/:id', (req, res) => {
    editMovie(parseInt(req.params.id), req.body).then(response => res.send(success(response))).catch(error => res.status(400).send(fail(error.message)));
});

/**
 * @swagger
 * /movies/{id}:
 *  delete:
 *      description: Delete a movie
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *                type: integer
 *            required: true
 *            example: 176
 *      responses:
 *         '200':
 *              description: A successful response
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              data:
 *                                  type: string
 *                                  example: Deleted successfully
 *         '400':
 *              description: Bad request error
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              data:
 *                                  type: string
 *                                  example: Error deleting movie
 * */
app.delete('/movies/:id', (req, res) => {
    deleteMovie(parseInt(req.params.id)).then(response => res.send(success(response))).catch(error => res.status(400).send(fail(error.message)));
});

app.listen(port, () => console.log(`Server running on port ${port}!`));