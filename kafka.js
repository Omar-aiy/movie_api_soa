const axios = require('axios');
const { Kafka } = require('kafkajs')

const runConsumer = async () => {
    const kafka = new Kafka({ clientId: 'my-consumer', brokers: ['84.192.118.116:9092'] });

    const consumer = kafka.consumer({ groupId: 'movie-consumer' });
      
    await consumer.connect();
    await consumer.subscribe({ topic: 'movie', fromBeginning: true });
    
    await consumer.run({
      eachMessage: async ({ message }) => {
            const { orderId, tmpProductId, product } = JSON.parse(message.value.toString());
            axios.post('https://movie-api-omar.herokuapp.com/movies', product)
                .then(async (response) => {
                    console.log(response.data);
                    await sentConfirmation(orderId, tmpProductId, product, "ok");
                })
                .catch(async (error) => { 
                    console.log(error.response.data);
                    sentConfirmation(orderId, tmpProductId, error.response.data, "nok");
                });
        }
    });
};

const sentConfirmation = async ( orderId, tmpProductId, movie, status ) => {
    const kafka = new Kafka({ clientId: 'my-producer', brokers: ['84.192.118.116:9092'] });
    const producer = kafka.producer();

    const message = {
        key: "Movie",
        value: JSON.stringify({
            orderId: orderId,
            tmpProductId: tmpProductId,
            status: status,
            serviceID: 2,
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

module.exports = { runConsumer, sentConfirmation, runProducer };