const axios = require('axios');
const { Kafka } = require('kafkajs')

const runConsumer = async () => {
    const kafka = new Kafka({ clientId: 'my-consumer', brokers: ['84.192.118.116:9092'] });

    const consumer = kafka.consumer({ groupId: 'movie-consumer' });
      
    await consumer.connect();
    await consumer.subscribe({ topic: 'movie' });
    
    await consumer.run({
      eachMessage: async ({ message }) => {

            const { orderId, tmpProductId, product } = JSON.parse(message.value);

            const movie = {
                title: product.title,
                description: product.description,
                picture_url: product.picture_url,
                price: product.price
            };
            console.log(movie);
            axios.post('https://movie-api-omar.herokuapp.com/movies', movie)
                .then(async (response) => {
                    console.log("Consumer good:", response.data.data.movie);
                    await sentConfirmation(orderId, tmpProductId, response.data.data.movie, "ok");
                })
                .catch(async (error) => { 
                    console.log("Consumer error: ", error.response.data);
                    await sentConfirmation(orderId, tmpProductId, error.response.data, "nok");
                });
        }
    });
};

const sentConfirmation = async (orderId, tmpProductId, movie, status ) => {
    const kafka = new Kafka({ clientId: 'my-producer', brokers: ['84.192.118.116:9092'] });
    const producer = kafka.producer();
    const jsonMessage = {
        orderId: orderId,
        tmpProductId: tmpProductId,
        product: movie,
        status: status,
        serviceId: 2
    };

    if (status === "ok") jsonMessage.realProductId = movie.id;
    console.log("Sent Confirmation:", jsonMessage);

    const message = {
        key: "Movie",
        value: JSON.stringify(jsonMessage)
    };
    await producer.connect();
    await producer.send({ topic: 'product-confirmations', messages: [ message ] });

    await producer.disconnect();
};

module.exports = { runConsumer };