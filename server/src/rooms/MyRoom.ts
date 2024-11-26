import { Room, Client } from "@colyseus/core";
import { RoomState, Player, _room } from "./schema/RoomState";

// list of avatars
const avatars = ['dino', 'bean', 'bag', 'btfly', 'bobo', 'ghostiny', 'ghosty', 'mark'];


type Direction = "up" | "down" | "left" | "right";

const movementDelta: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};


export class MyRoom extends Room<RoomState> {
  maxClients = 100;

  onCreate (options: any) {
    this.setState(new RoomState());

    const center = new _room();
    center.name = "center";
    center.centerX = 0;
    center.centerY = 0;

    const left = new _room()
    left.name = "left";
    left.centerX = 1000;
    left.centerY = 1000;

    this.state.roomManager.set("center", center)
    this.state.roomManager.set("left", left)
    
    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      player.x = message.x;
      player.y = message.y;
    });

    this.onMessage<{ direction: Direction }>("move-key", (client, message) => {
      if (movementDelta[message.direction]) {
        const player = this.state.players.get(client.sessionId);
        const move = movementDelta[message.direction];
        player.x += move.x;
        player.y += move.y;
      } else {
        console.warn("Invalid movement direction:", message.direction);
      }
    });
    
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();
    player.x = Math.floor(Math.random() * 400);
    player.y = Math.floor(Math.random() * 400);
    player.sessionId = client.sessionId;
    // get a random avatar for the player
    player.avatar = avatars[Math.floor(Math.random() * avatars.length)];

    this.state.players.set(client.sessionId, player);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
