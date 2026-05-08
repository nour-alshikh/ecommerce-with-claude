<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation #{{ $order->id }}</title>
</head>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 22px; margin-bottom: 4px;">Thank you for your order!</h1>
  <p style="color: #6b7280; margin-top: 0;">Order #{{ $order->id }} has been received and is being processed.</p>

  <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
    <thead>
      <tr style="border-bottom: 2px solid #e5e7eb;">
        <th style="text-align: left; padding: 8px 0; font-size: 14px;">Product</th>
        <th style="text-align: right; padding: 8px 0; font-size: 14px;">Qty</th>
        <th style="text-align: right; padding: 8px 0; font-size: 14px;">Total</th>
      </tr>
    </thead>
    <tbody>
      @foreach($order->items as $item)
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 10px 0; font-size: 14px;">
          {{ $item->product_name }}
          @if($item->variant_name) — {{ $item->variant_name }}@endif
        </td>
        <td style="text-align: right; padding: 10px 0; font-size: 14px;">{{ $item->quantity }}</td>
        <td style="text-align: right; padding: 10px 0; font-size: 14px;">${{ number_format($item->subtotal, 2) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <div style="margin-top: 20px; text-align: right; font-size: 14px;">
    <p style="margin: 4px 0;">Subtotal: ${{ number_format($order->subtotal, 2) }}</p>
    @if($order->discount > 0)
    <p style="margin: 4px 0; color: #16a34a;">Discount: -${{ number_format($order->discount, 2) }}</p>
    @endif
    <p style="margin: 8px 0; font-size: 18px; font-weight: bold;">Total: ${{ number_format($order->total, 2) }}</p>
  </div>

  <div style="margin-top: 28px; padding: 16px; background: #f9fafb; border-radius: 8px; font-size: 14px; color: #374151;">
    <p style="margin: 0 0 4px; font-weight: 600;">Shipping to:</p>
    <p style="margin: 0;">{{ $order->shipping_name }}</p>
    <p style="margin: 0;">{{ $order->shipping_line1 }}{{ $order->shipping_line2 ? ', '.$order->shipping_line2 : '' }}</p>
    <p style="margin: 0;">{{ $order->shipping_city }}, {{ $order->shipping_state }} {{ $order->shipping_postal_code }}</p>
    <p style="margin: 0;">{{ $order->shipping_country }}</p>
  </div>
</body>
</html>
