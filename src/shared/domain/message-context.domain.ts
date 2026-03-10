
export type MessageContext = {
  participantId?: string;
  questionnaireCode?: string;
  channelId?: string;
  channelType?: string;
  messageId: string;
  [key: string]: any
};