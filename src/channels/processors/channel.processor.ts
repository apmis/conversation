export interface ChannelProcessor {
  processInbound(payload: any): Promise<any>;
}