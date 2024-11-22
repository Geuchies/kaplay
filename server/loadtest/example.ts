import { Client, Room } from "colyseus.js";
import { cli, Options } from "@colyseus/loadtest";

export async function main(options: Options) {
    const client = new Client(options.endpoint);
    const room: Room = await client.joinOrCreate(options.roomName, {
        // your join options here...
    });

    console.log("joined successfully!");

    room.onMessage("message-type", (payload) => {
        // logic
    });

    room.onStateChange((state) => {
        console.log("state change:", state);
    });

    room.onLeave((code) => {
        console.log("left");
    });
    // Function to generate random coordinates (for example within a 800x600 area)
    function getRandomCoordinates() {
        return {
            x: Math.floor(Math.random() * 800),
            y: Math.floor(Math.random() * 600),
        };
    }

    // Set up an interval to send move messages
    setInterval(() => {
        const coordinates = getRandomCoordinates();
        room.send("move", coordinates); // Send "move" message with random coordinates
        console.log("Sent move coordinates:", coordinates);
    }, 200); // Adjust interval time as desired (e.g., 1000ms for every second)
}

cli(main);
