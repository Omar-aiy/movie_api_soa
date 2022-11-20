const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['84.192.118.116:9092'],
  })

async function main() {
    const producer = kafka.producer()

    message = {
        key: "test",
        value: JSON.stringify({
            id: '3',
            value: "[book1 book2]"
        })
    }
    console.log(message)
    await producer.connect()
    await producer.send({
        topic: 'order',
        messages: [
            message,
        ],
    })

    await producer.disconnect()
}
main()