const { EventHubConsumerClient, earliestEventPosition  } = require("@azure/event-hubs");
const { MongoClient, ObjectId } = require('mongodb');
const express = require('express')
const app = express()

const connectionString = "Endpoint=sb://eventhub-zcamprivage2022.servicebus.windows.net/;SharedAccessKeyName=base;SharedAccessKey=q39I3DrBEBFdb1Ai8rK9iSFfIPISmDOQN71G5JpWNDs=";
const eventHubName = "eh-zcamprivage2022";
const consumerGroup = "$Default"; // name of the default consumer group

const mongoDBConnectionString = "mongodb://mongodb-zcamprivage2022:rY4ki06R3Qev9O40DFFiFtEhKTP93M8sqoRY5WEiDRsZOIrfEQe0PsJLBnknIGVRWMcAwe8lZrwcKMvNMHWiIQ==@mongodb-zcamprivage2022.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@mongodb-zcamprivage2022@"
async function main() {

    // Create a consumer client for the event hub by specifying the checkpoint store.
    const consumerClient = new EventHubConsumerClient(consumerGroup, connectionString, eventHubName);

    let client = new MongoClient(mongoDBConnectionString)

    await app.get('', (req, res) => {
        collection.find({}).limit(100).toArray(function (err, result) {
            if (err) {
                res.status(400).send("Error fetching listings!");
            } else {
                res.json(result);
            }
        });
    })

    app.listen(3000)

    client.connect();
    const db = client.db("tracks");
    const collection = db.collection('tracks_2022');

    // Subscribe to the events, and specify handlers for processing the events and errors.
    const subscription = consumerClient.subscribe({
            processEvents: async (events, context) => {
                if (events.length === 0) {
                    console.log(`No events received within wait time. Waiting for next interval`);
                    return;
                }

                for (const event of events) {
                    await collection.insertOne(event.body);
                    console.log(`Received event: '${JSON.stringify(event.body)}' from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`);
                }
                // Update the checkpoint.
                await context.updateCheckpoint(events[events.length - 1]);

            },

            processError: async (err, context) => {
                console.log(`Error : ${err}`);
            }
        },
        { startPosition: earliestEventPosition }
    );



   await process.on('exit', function (code) {
       subscription.close();
       consumerClient.close();
       db.close();
       app.close();
        return console.log(`Process to exit with code ${code}`);
    });

    await process.on('SIGINT', function() {
        subscription.close();
        consumerClient.close();
        client.close();
        app.close();
        console.log(`Process to exit`)
        process.exit()
    });
}

main().catch((err) => {
    console.log("Error occurred: ", err);
});