const QPAY_BASE_URL = "https://merchant.qpay.mn/v2";

// Token cache — серверийн хооронд хадгална
let _token: string | null = null;
let _tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const username = process.env.QPAY_USERNAME;
  const password = process.env.QPAY_PASSWORD;
  if (!username || !password) throw new Error("QPAY_USERNAME / QPAY_PASSWORD тохируулаагүй байна");

  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  const res = await fetch(`${QPAY_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`QPay нэвтрэлт амжилтгүй: ${err}`);
  }

  const data = await res.json();
  _token = data.access_token as string;
  _tokenExpiry = Date.now() + ((data.expires_in ?? 3600) - 60) * 1000;
  return _token;
}

export type QpayInvoiceResult = {
  invoiceId: string;
  qrText: string;
  qrImage: string; // base64 PNG
  urls: Array<{
    name: string;
    description: string;
    logo: string;
    link: string;
  }>;
};

export async function createInvoice(params: {
  orderId: string;
  description: string;
  amount: number; // MNT
  callbackUrl: string;
}): Promise<QpayInvoiceResult> {
  const token = await getToken();
  const invoiceCode = process.env.QPAY_INVOICE_CODE;
  if (!invoiceCode) throw new Error("QPAY_INVOICE_CODE тохируулаагүй байна");

  const res = await fetch(`${QPAY_BASE_URL}/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: invoiceCode,
      sender_invoice_no: params.orderId,
      invoice_receiver_code: "terminal",
      invoice_description: params.description,
      amount: params.amount,
      callback_url: params.callbackUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`QPay invoice үүсгэх амжилтгүй: ${err}`);
  }

  const data = await res.json();
  return {
    invoiceId: data.invoice_id as string,
    qrText: data.qr_text as string,
    qrImage: data.qr_image as string,
    urls: (data.urls ?? []) as QpayInvoiceResult["urls"],
  };
}

export async function checkPayment(invoiceId: string): Promise<{
  paid: boolean;
  paidAmount: number;
  paymentId: string | null;
}> {
  const token = await getToken();

  const res = await fetch(
    `${QPAY_BASE_URL}/payment/check?invoice_id=${invoiceId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error("QPay төлбөр шалгах амжилтгүй");

  const data = await res.json();
  const paid = (data.count ?? 0) > 0;

  return {
    paid,
    paidAmount: data.paid_amount ?? 0,
    paymentId: paid ? (data.rows?.[0]?.payment_id ?? null) : null,
  };
}
