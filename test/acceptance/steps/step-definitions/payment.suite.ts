import { Given, Suite, Then, When } from '@fiap-burger/acceptance-factory';
import { HttpService } from '@nestjs/axios';
import { strict as assert } from 'assert';
import { setTimeout } from 'timers/promises';

@Suite()
export class PaymentSuite {
  private paymentId: string;

  constructor(private readonly http: HttpService) {}

  @Given('a payment was requested')
  async requestPayment() {
    const res = await this.http.axiosRef.post(
      'http://localhost:3000/v1/payments',
      {
        type: 'PixQrCode',
        amount: 999.99,
      },
    );
    this.paymentId = res.data.id;
    await setTimeout(500);
  }

  @When('customer executes the payment instruction')
  async executePaymentInstructionAndSystemGetsNotified() {
    await this.http.axiosRef.patch(
      `http://localhost:3000/v1/payments/${this.paymentId}/approve`,
    );
  }

  @Then('the payment gets approved')
  async verify() {
    const res = await this.http.axiosRef.get(
      `http://localhost:3000/v1/payments/${this.paymentId}`,
    );

    const paymentStatus = res.data.status;
    assert.equal(paymentStatus, 'Approved');
  }
}
