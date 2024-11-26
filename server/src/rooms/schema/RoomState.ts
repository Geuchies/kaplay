import { Schema, MapSchema, type } from '@colyseus/schema';

export class Player extends Schema {
	@type('string') public sessionId: string;
	@type('string') public userId: string;
	@type('string') public avatar: string;
	@type('string') public name: string;
	@type('number') public x: number = 0;
	@type('number') public y: number = 0;
}

export class _room extends Schema {
	@type('string') public name: string;
	@type('number') public centerX: number;
	@type('number') public centerY: number;
	
}

export class RoomState extends Schema {
	@type({ map: Player }) public players = new MapSchema<Player>();
	@type({ map: _room }) public roomManager = new MapSchema<_room>();
}
