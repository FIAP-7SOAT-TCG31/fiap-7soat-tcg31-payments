import { AggregateRoot } from '@fiap-burger/tactical-design/core';
import { PaymentApproved } from '../events/payment.approved';
import { PaymentCreated } from '../events/payment.created';
import { PaymentDrafted } from '../events/payment.drafted';
import { PaymentRejected } from '../events/payment.rejected';
import { PaymentInstructionFactory } from '../factories/payment-instruction.factory';
import { PaymentInstruction } from '../values/payment-instruction.value';
import {
  PaymentStatus,
  PaymentStatusFactory,
} from '../values/payment-status.value';
import { PaymentType } from '../values/payment.types';

export class Payment extends AggregateRoot {
  constructor(
    protected readonly _id: string,
    private readonly _amount: number,
    private readonly _type: PaymentType,
    private _status: PaymentStatus,
    private _paymentInstruction: PaymentInstruction,
  ) {
    super(_id);
  }

  get amount() {
    return this._amount;
  }

  get type() {
    return this._type;
  }

  get status() {
    return this._status.value;
  }

  get paymentInstruction() {
    return this._paymentInstruction?.value;
  }

  draft() {
    this.apply(new PaymentDrafted(this._type, this.amount));
  }

  onPaymentDrafted() {
    this._status = PaymentStatusFactory.draft();
  }

  create(content: string, conciliationId: string) {
    this.apply(new PaymentCreated(conciliationId, content));
  }

  onPaymentCreated({ content, conciliationId }: PaymentCreated) {
    this._paymentInstruction = PaymentInstructionFactory.create(
      'PixQRCode',
      content,
      conciliationId,
    );
    this._status = this._status.create();
  }

  approve() {
    this.apply(new PaymentApproved(this.id));
  }

  onPaymentApproved() {
    this._status = this._status.approve();
  }

  reject() {
    this.apply(new PaymentRejected(this.id));
  }

  onPaymentRejected() {
    this._status = this._status.reject();
  }
}