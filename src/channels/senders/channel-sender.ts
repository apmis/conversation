import { ParticipantDomain } from "../../shared/domain";

export interface ChannelSender {
  sendMessage(participant: ParticipantDomain, message: string, context?: Record<string, any>): Promise<void>;
}