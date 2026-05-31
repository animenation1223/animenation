import React, { useRef } from 'react';
import { FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GSTInvoice({ order }) {
  const printRef = useRef();

  const subtotal = order.items?.reduce((s, i) => s + i.price * (i.quantity || 1), 0) || 0;
  const shipping = subtotal >= 999 ? 0 : 79;
  const gst = Math.round(subtotal * 0.05);
  const cgst = Math.round(gst / 2);
  const sgst = Math.round(gst / 2);
  const total = order.total || subtotal + shipping + gst;
  const invoiceDate = order.created_date ? new Date(order.created_date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>GST Invoice - ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #000; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        th { background: #f5f5f5; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .brand { font-size: 20px; font-weight: bold; }
        h3 { margin: 0 0 4px; }
        .divider { border-top: 2px solid #000; margin: 8px 0; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-syne font-bold text-sm text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> GST Tax Invoice
        </h3>
        <Button onClick={handlePrint} size="sm" variant="outline" className="border-white/10 gap-2 text-xs">
          <Printer className="w-3.5 h-3.5" /> Print Invoice
        </Button>
      </div>

      <div ref={printRef} className="p-5 rounded-2xl bg-card border border-white/10 text-xs space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-syne font-extrabold text-base text-foreground">AnimeNation India</p>
            <p className="text-muted-foreground">Mumbai, Maharashtra — 400001</p>
            <p className="text-muted-foreground">GSTIN: 27AABCU9603R1ZX</p>
            <p className="text-muted-foreground">support@animenation.in</p>
          </div>
          <div className="text-right">
            <p className="font-syne font-bold text-foreground text-sm">TAX INVOICE</p>
            <p className="text-muted-foreground">#{order.order_number}</p>
            <p className="text-muted-foreground">Date: {invoiceDate}</p>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Bill to */}
        {order.shipping_address && (
          <div>
            <p className="font-syne font-bold text-foreground mb-1">Bill To:</p>
            <p className="text-muted-foreground">{order.shipping_address.name}</p>
            <p className="text-muted-foreground">{order.shipping_address.address}</p>
            <p className="text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}</p>
            <p className="text-muted-foreground">Ph: +91 {order.shipping_address.phone}</p>
          </div>
        )}

        {/* Items table */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-2 border border-white/10 font-syne font-bold text-muted-foreground">#</th>
              <th className="text-left p-2 border border-white/10 font-syne font-bold text-muted-foreground">Item</th>
              <th className="text-right p-2 border border-white/10 font-syne font-bold text-muted-foreground">Qty</th>
              <th className="text-right p-2 border border-white/10 font-syne font-bold text-muted-foreground">Rate (₹)</th>
              <th className="text-right p-2 border border-white/10 font-syne font-bold text-muted-foreground">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="p-2 border border-white/10 text-muted-foreground">{i + 1}</td>
                <td className="p-2 border border-white/10 text-foreground">{item.title}{item.size ? ` (${item.size})` : ''}</td>
                <td className="p-2 border border-white/10 text-right text-muted-foreground">{item.quantity || 1}</td>
                <td className="p-2 border border-white/10 text-right text-muted-foreground">₹{item.price?.toLocaleString('en-IN')}</td>
                <td className="p-2 border border-white/10 text-right text-foreground font-medium">₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-48 space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>CGST (2.5%)</span><span>₹{cgst}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>SGST (2.5%)</span><span>₹{sgst}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between font-syne font-extrabold text-foreground">
              <span>TOTAL</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10" />
        <p className="text-[10px] text-muted-foreground text-center">
          This is a computer-generated invoice and does not require a physical signature. · Thank you for shopping with AnimeNation India!
        </p>
      </div>
    </div>
  );
}