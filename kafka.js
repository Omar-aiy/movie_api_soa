const axios = require('axios');
const { Kafka } = require('kafkajs')

const runConsumer = async () => {
    const kafka = new Kafka({ clientId: 'my-consumer', brokers: ['84.192.118.116:9092'] });

    const consumer = kafka.consumer({ groupId: 'movie-consumer' });
      
    await consumer.connect();
    await consumer.subscribe({ topic: 'movie' });
    
    await consumer.run({
      eachMessage: async ({ message }) => {
            console.log(JSON.parse(message.value));

            const { orderId, tmpProductId, product } = JSON.parse(message.value);

            const movie = {
                title: product.title,
                description: product.description,
                picture_url: product.picture_url,
                price: product.price
            };
            axios.post('https://movie-api-omar.herokuapp.com/movies', movie)
                .then(async (response) => {
                    console.log(response.data);
                    await sentConfirmation(orderId, tmpProductId, response.data, "ok");
                })
                .catch(async (error) => { 
                    console.log(error.response.data);
                    await sentConfirmation(orderId, tmpProductId, error.response.data, "nok");
                });
        }
    });
};

const sentConfirmation = async (orderId, tmpProductId, movie, status ) => {
    const kafka = new Kafka({ clientId: 'my-producer', brokers: ['84.192.118.116:9092'] });
    const producer = kafka.producer();

    const message = {
        key: "Movie",
        value: JSON.stringify({
            orderId: orderId,
            tmpProductId: tmpProductId,
            status: status,
            serviceId: 2,
            product: movie
        })
    };
    await producer.connect();
    await producer.send({ topic: 'product-confirmations', messages: [ message ] });

    await producer.disconnect();
};

const runProducer = async () => {

    const movie = {
        title: "OmarPostConsumer", 
        description: "OmarPostConsumer", 
        picture_url: "OmarPostConsumer", 
        price: 15
    };

    const kafka = new Kafka({ clientId: 'my-producer', brokers: ['84.192.118.116:9092']});
    const producer = kafka.producer();

    const message = {
        key: "Movie",
        value: JSON.stringify({
            orderId: 1,
            tmpProductId: 1,
            status: true,
            serviceID: 1,
            product: movie
        })
    };
    await producer.connect();
    await producer.send({ topic: 'movie', messages: [ message ] });

    await producer.disconnect();
};

//runConsumer();
module.exports = { runConsumer, sentConfirmation, runProducer };