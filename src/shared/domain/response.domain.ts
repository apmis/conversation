import { ResponseDirection } from "./enums";

export class Response {
  constructor(
    public id: string,
    public conversationId: string,
    public questionId: string,
    public attribute: string,
    public direction: ResponseDirection,
    public message: string,
    public timestamp: Date = new Date(),
  ) {}

  static inbound(conversationId: string, questionId: string, attribute: string, message: string): Response {
    return new Response(
      crypto.randomUUID(),
      conversationId,
      questionId,
      attribute,
      ResponseDirection.INBOUND,
      message,
      new Date(),
    );
  }

  static outbound(conversationId: string,questionId: string, attribute: string, message: string): Response {
    return new Response(
      crypto.randomUUID(),
      conversationId,
      questionId,
      attribute,
      ResponseDirection.OUTBOUND,
      message,
      new Date(),
    );
  }
}