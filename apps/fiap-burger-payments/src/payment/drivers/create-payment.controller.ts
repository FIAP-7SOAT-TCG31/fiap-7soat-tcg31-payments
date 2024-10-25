import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  CreatePaymentCommand,
  CreatePaymentResult,
} from '../application/commands/create-payment.command';
import { CreatePaymentInput } from '../application/dtos/create-payment.input';

@Controller({ version: '1', path: 'payments' })
export class CreatePaymentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async execute(@Body() data: CreatePaymentInput) {
    const result = await this.commandBus.execute<
      CreatePaymentCommand,
      CreatePaymentResult
    >(new CreatePaymentCommand(data));

    return result.data;
  }
}
