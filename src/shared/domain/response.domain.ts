import { ResponseDirection } from "./enums";

export class Response {
  constructor(
    public id: string,
    public conversationId: string,
    public direction: ResponseDirection,
    public message: string,
    public timestamp: Date = new Date(),
  ) {}

  static inbound(conversationId: string, message: string): Response {
    return new Response(
      crypto.randomUUID(),
      conversationId,
      ResponseDirection.INBOUND,
      message,
      new Date(),
    );
  }

  static outbound(conversationId: string, message: string): Response {
    return new Response(
      crypto.randomUUID(),
      conversationId,
      ResponseDirection.OUTBOUND,
      message,
      new Date(),
    );
  }
}