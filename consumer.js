const axios = require('axios');
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['84.192.118.116:9092'],
});

const runConsumer = async () => {
  const consumer = kafka.consumer({ groupId: 'movie-consumer' });
    
  await consumer.connect();
  await consumer.subscribe({ topic: 'movie', fromBeginning: true });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(topic, partition, message);
      const movie = JSON.parse(message.value.toString());
      axios.post('https://movie-api-omar.herokuapp.com/movies', movie)
        .then(response => console.log(response.data))
        .catch(error => console.log(error.response.data));
    }
  })
};

const runConsumerConfirmation = async () => {
  const consumer = kafka.consumer({ groupId: 'my-product-confirmations' });
    
  await consumer.connect();
  await consumer.subscribe({ topic: 'product-confirmations', fromBeginning: true });
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      const res = JSON.parse(message.value.toString());
      console.log(res);
    }
  })
};

runConsumerConfirmation();