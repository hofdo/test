const { EventHubProducerClient } = require("@azure/event-hubs");

const connectionString = "Endpoint=sb://eh-zcamprivage2022.servicebus.windows.net/;SharedAccessKeyName=rootManagedAccessKey;SharedAccessKey=duPp8T82aGyMSgO+hQ5zoJuxZCLUreQ6yyVYo39DoqM=;EntityPath=eventhub-zcamprivage2022";
const eventHubName = "eventhub-zcamprivage2022";

async function main() {

    // Create a producer client to send messages to the event hub.
    const producer = new EventHubProducerClient(connectionString, eventHubName);

    // Prepare a batch of three events.
    const batch = await producer.createBatch();
    batch.tryAdd({ body: "First event" });
    batch.tryAdd({ body: "Second event" });
    batch.tryAdd({ body: "Third event" });

    // Send the batch to the event hub.
    await producer.sendBatch(batch);

    // Close the producer client.
    await producer.close();

    console.log("A batch of three events have been sent to the event hub");
}

main().catch((err) => {
    console.log("Error occurred: ", err);
});