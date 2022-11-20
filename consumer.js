const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['84.192.118.116:9092'],
})

console.log(kafka)


async function main(){
    const consumer = kafka.consumer({ groupId: 'test-group' })
    
    await consumer.connect()
    await consumer.subscribe({ topic: 'order', fromBeginning: true })
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(message)
        console.log({
          key: message.key.toString(),
          value: message.value.toString(),
        })
      },
    })
}

main()