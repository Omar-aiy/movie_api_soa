const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['84.192.118.116:9092'],
  })

async function main() {
    const movie = {
        title: "OmarPostConsumerOpHeroku", 
        description: "OmarPostConsumerOpHeroku", 
        picture_url: "OmarPostConsumerOpHeroku", 
        price: 10
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
}

main()