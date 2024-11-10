import { AmqpService } from '@fiap-burger/amqp';
import {
  CommonModuleOptions,
  InjectCommonModuleOptions,
} from '@fiap-burger/setup';
import { Injectable, Logger } from '@nestjs/common';
import { AggregateEvent, AggregatePublisherContext } from '../core';
import { routingKeyOf, toDottedNotation } from './amqp-publisher.utils';

@Injectable()
export class AmqpPublisherContext implements AggregatePublisherContext {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly amqp: AmqpService,
    @InjectCommonModuleOptions()
    private readonly config: CommonModuleOptions,
  ) {}

  async commit(...events: AggregateEvent[]) {
    const eventBusName = `${toDottedNotation(this.config.appName)}.events`;
    await Promise.all(
      events.map((x) =>
        this.amqp.publish(
          eventBusName,
          routingKeyOf(x.eventName),
          x, // TODO: must also append headers for event
        ),
      ),
    );
    this.logger.debug(
      `Published ${events.length} to the event bus ${eventBusName}`,
    );
  }
}