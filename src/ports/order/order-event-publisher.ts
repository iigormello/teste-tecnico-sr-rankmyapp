export interface IOrderEventPublisher {
  publish(eventType: string, payload: unknown): Promise<void>;
}
