"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Save,
  ShoppingBag,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderProofOfDelivery, OrderStatus, OrderTracking } from "@/lib/types";
import { safeOrder, type SafeOrder } from "@/lib/safeOrder";
import ExportCsvButton from "./ExportCsvButton";

const STATUS_TABS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "dispatched", label: "Dispatched" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  dispatched: "bg-blue-100 text-blue-700 border-blue-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function OrdersEditor() {
  const { orders, setOrderStatus, updateOrder, deleteOrder, showToast, company } = useStore();
  const [tab, setTab] = useState<OrderStatus | "all">("all");

  // Normalize every order up front — prod data has legacy rows with missing
  // customer/items that would otherwise crash the page on render.
  const safeOrders = useMemo(
    () => orders.filter((o) => o && o.id).map(safeOrder),
    [orders],
  );

  const filtered = useMemo(() => {
    if (tab === "all") return safeOrders;
    return safeOrders.filter((o) => o.status === tab);
  }, [safeOrders, tab]);

  const counts = useMemo(
    () => ({
      all: safeOrders.length,
      pending: safeOrders.filter((o) => o.status === "pending").length,
      dispatched: safeOrders.filter((o) => o.status === "dispatched").length,
      delivered: safeOrders.filter((o) => o.status === "delivered").length,
      cancelled: safeOrders.filter((o) => o.status === "cancelled").length,
    }),
    [safeOrders]
  );

  const notifyCustomer = (order: SafeOrder, message: string) => {
    if (!order.customer.phone) {
      showToast("Customer has no phone on file.", "error");
      return;
    }
    const phone =
      order.customer.phone.length === 10 ? "91" + order.customer.phone : order.customer.phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    showToast("WhatsApp opened — review and send.", "success");
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy">Orders</h2>
          <p className="text-sm text-muted-foreground">
            Live orders placed through WhatsApp checkout. Add tracking when you dispatch, record
            proof of delivery once delivered.
          </p>
        </div>
        <ExportCsvButton entity="orders" />
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map((t) => {
          const count = counts[t.id as keyof typeof counts];
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                active
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy border-border hover:border-navy/40"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "ml-2 text-xs px-1.5 py-0.5 rounded-md",
                  active ? "bg-white/15 text-white" : "bg-cream text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <ShoppingBag size={32} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">No orders yet</h3>
          <p className="text-sm text-muted-foreground">
            Orders sent through the WhatsApp checkout will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              brand={company.brand}
              supportPhone={company.phone}
              onStatus={(s) => {
                setOrderStatus(order.id, s);
                showToast(`Order marked ${s}.`, "success");
              }}
              onSaveTracking={(tracking) => {
                updateOrder(order.id, {
                  tracking: { ...tracking, updatedAt: Date.now() },
                  status: order.status === "pending" ? "dispatched" : order.status,
                });
                showToast("Tracking saved.", "success");
              }}
              onSavePod={(pod) => {
                updateOrder(order.id, {
                  pod: { ...pod, recordedAt: Date.now() },
                  status: "delivered",
                });
                showToast("Proof of delivery saved.", "success");
              }}
              onDelete={() => {
                if (confirm("Delete this order permanently?")) {
                  deleteOrder(order.id);
                  showToast("Order deleted.", "info");
                }
              }}
              onNotifyCustomer={(msg) => notifyCustomer(order, msg)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildMessages(order: SafeOrder, brand: string, supportPhone: string) {
  const firstName = (order.customer.name || "").split(" ")[0] || "there";
  const itemLines = order.items
    .map((i) => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`)
    .join("\n");
  const addr = order.customer.address;
  const addrText = addr?.line1
    ? `${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city}, ${addr.state} - ${addr.pincode}`
    : "—";

  const trackingBlock = (t?: OrderTracking) => {
    if (!t || (!t.courier && !t.number && !t.url)) return "";
    const lines: string[] = ["\n*Tracking:*"];
    if (t.courier) lines.push(`Courier: ${t.courier}`);
    if (t.number) lines.push(`Tracking #: ${t.number}`);
    if (t.url) lines.push(`Track online: ${t.url}`);
    if (t.instructions) lines.push(`\nHow to track:\n${t.instructions}`);
    return lines.join("\n") + "\n";
  };

  const confirmation =
    `🎆 *Order Confirmed!* 🎆\n\n` +
    `Hi ${firstName}, thank you for shopping with *${brand}*.\n\n` +
    `*Order ID:* ${order.id}\n` +
    `*Txn / UTR ID:* ${order.txnId}\n` +
    `*Paid via:* ${order.paidVia}\n\n` +
    `*Items:*\n${itemLines}\n\n` +
    `*Total Paid:* ${formatPrice(order.total)}\n\n` +
    `*Shipping to:*\n${addrText}\n\n` +
    `We've received your payment and will dispatch shortly. For any queries, reply here or call ${supportPhone}.\n\n` +
    `— Team ${brand}`;

  const dispatched =
    `📦 *Order Dispatched* 📦\n\n` +
    `Hi ${firstName}, your order *${order.id}* from *${brand}* has been dispatched.\n\n` +
    `*Items:*\n${itemLines}\n\n` +
    `*Total:* ${formatPrice(order.total)}\n` +
    `${trackingBlock(order.tracking)}\n` +
    `*Shipping to:*\n${addrText}\n\n` +
    `You'll receive a delivery update soon. Questions? Reply here or call ${supportPhone}.\n\n` +
    `— Team ${brand}`;

  const delivered = (() => {
    const podLines: string[] = [];
    if (order.pod?.note) podLines.push(`\n*Delivery note:* ${order.pod.note}`);
    if (order.pod?.attachmentUrl) {
      podLines.push(
        `*${order.pod.attachmentLabel || "Proof of delivery"}:* ${order.pod.attachmentUrl}`
      );
    }
    return (
      `✅ *Order Delivered* ✅\n\n` +
      `Hi ${firstName}, your order *${order.id}* from *${brand}* has been delivered.\n` +
      `${podLines.join("\n")}\n\n` +
      `Thank you for choosing us! Reply here for any concerns or call ${supportPhone}.\n\n` +
      `— Team ${brand}`
    );
  })();

  return { confirmation, dispatched, delivered };
}

function OrderCard({
  order,
  brand,
  supportPhone,
  onStatus,
  onSaveTracking,
  onSavePod,
  onDelete,
  onNotifyCustomer,
}: {
  order: SafeOrder;
  brand: string;
  supportPhone: string;
  onStatus: (s: OrderStatus) => void;
  onSaveTracking: (tracking: OrderTracking) => void;
  onSavePod: (pod: Omit<OrderProofOfDelivery, "recordedAt">) => void;
  onDelete: () => void;
  onNotifyCustomer: (message: string) => void;
}) {
  const intl =
    order.customer.phone && order.customer.phone.length === 10
      ? "91" + order.customer.phone
      : order.customer.phone;

  const messages = buildMessages(order, brand, supportPhone);
  const showTrackingPanel = order.status !== "cancelled";
  const showPodPanel = order.status === "dispatched" || order.status === "delivered";

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-border bg-cream/40">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-black text-navy font-mono text-sm">{order.id}</h3>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                STATUS_STYLE[order.status]
              )}
            >
              {order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {order.customer.name} · {order.paidVia}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">
            Txn / UTR: {order.txnId}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <span className="text-lg font-black text-navy">{formatPrice(order.total)}</span>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock size={12} /> {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Detail label="Phone">
          {order.customer.phone ? (
            <a
              href={intl ? `https://wa.me/${intl}` : undefined}
              target="_blank"
              rel="noopener"
              className="text-navy font-bold inline-flex items-center gap-1 hover:text-blue"
            >
              <Phone size={12} /> {order.customer.phone}
            </a>
          ) : (
            "—"
          )}
        </Detail>
        <Detail label="Email">
          <span className="inline-flex items-center gap-1">
            <Mail size={12} /> {order.customer.email}
          </span>
        </Detail>
        {order.customer.address?.line1 && (
          <Detail label="Shipping Address" wide>
            <span className="whitespace-pre-wrap">
              {order.customer.address.line1}
              {order.customer.address.line2 ? `, ${order.customer.address.line2}` : ""}
              {`, ${order.customer.address.city}, ${order.customer.address.state} - ${order.customer.address.pincode}`}
            </span>
          </Detail>
        )}
      </div>

      <div className="px-5 py-4 border-t border-border">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
          <Package size={12} /> Items ({order.items.reduce((s, i) => s + i.qty, 0)})
        </div>
        <ul className="space-y-1.5 text-sm">
          {order.items.map((item, idx) => (
            <li key={item.id != null ? String(item.id) : `idx-${idx}`} className="flex justify-between gap-3">
              <span className="text-foreground">
                {item.name} <span className="text-muted-foreground">× {item.qty}</span>
                {item.bundleItems?.length ? (
                  <span className="block text-[11px] text-muted-foreground">
                    Includes: {item.bundleItems.join(", ")}
                  </span>
                ) : null}
              </span>
              <span className="font-bold text-navy whitespace-nowrap">
                {formatPrice(item.price * item.qty)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {showTrackingPanel && (
        <TrackingPanel
          tracking={order.tracking}
          onSave={onSaveTracking}
        />
      )}

      {showPodPanel && (
        <PodPanel pod={order.pod} onSave={onSavePod} />
      )}

      <div className="px-5 py-4 bg-cream/40 border-t border-border flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-navy/20 text-navy hover:bg-navy/5 font-bold"
          onClick={() =>
            window.open(
              `/admin/invoice/${encodeURIComponent(order.id)}?print=1`,
              "_blank",
              "noopener"
            )
          }
        >
          <FileText size={14} /> Invoice PDF
        </Button>
        <Button
          size="sm"
          className="bg-[#25D366] hover:bg-[#1aa550] text-white font-bold"
          onClick={() => onNotifyCustomer(messages.confirmation)}
          disabled={!order.customer.phone}
        >
          <MessageCircle size={14} /> Send Confirmation
        </Button>
        {order.status !== "dispatched" && order.status !== "delivered" && (
          <Button
            size="sm"
            className="bg-gold hover:bg-gold-spark text-navy font-bold"
            onClick={() => onStatus("dispatched")}
          >
            <Truck size={14} /> Mark Dispatched
          </Button>
        )}
        {order.status === "dispatched" && (
          <Button
            size="sm"
            variant="outline"
            className="border-[#25D366] text-[#1aa550] hover:bg-green-50"
            onClick={() => onNotifyCustomer(messages.dispatched)}
            disabled={!order.customer.phone}
          >
            <MessageCircle size={14} /> Notify Dispatched
          </Button>
        )}
        {order.status !== "delivered" && (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
            onClick={() => onStatus("delivered")}
          >
            <CheckCircle2 size={14} /> Mark Delivered
          </Button>
        )}
        {order.status === "delivered" && (
          <Button
            size="sm"
            variant="outline"
            className="border-[#25D366] text-[#1aa550] hover:bg-green-50"
            onClick={() => onNotifyCustomer(messages.delivered)}
            disabled={!order.customer.phone}
          >
            <MessageCircle size={14} /> Notify Delivered
          </Button>
        )}
        {order.status !== "cancelled" && order.status !== "delivered" && (
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onStatus("cancelled")}
          >
            <XCircle size={14} /> Cancel
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="border-border text-muted-foreground hover:bg-cream ml-auto"
          onClick={onDelete}
        >
          <Trash2 size={14} /> Delete
        </Button>
      </div>
    </div>
  );
}

function TrackingPanel({
  tracking,
  onSave,
}: {
  tracking?: OrderTracking;
  onSave: (t: OrderTracking) => void;
}) {
  const [courier, setCourier] = useState(tracking?.courier ?? "");
  const [number, setNumber] = useState(tracking?.number ?? "");
  const [url, setUrl] = useState(tracking?.url ?? "");
  const [instructions, setInstructions] = useState(tracking?.instructions ?? "");

  const dirty =
    courier !== (tracking?.courier ?? "") ||
    number !== (tracking?.number ?? "") ||
    url !== (tracking?.url ?? "") ||
    instructions !== (tracking?.instructions ?? "");

  return (
    <div className="px-5 py-4 border-t border-border bg-sky/5 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-navy uppercase tracking-wider">
        <Truck size={14} /> Shipment Tracking
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input
          placeholder="Courier (e.g. DTDC, Delhivery, India Post)"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
        />
        <Input
          placeholder="Tracking / AWB number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <Input
          className="md:col-span-2"
          placeholder="Tracking URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <textarea
          className="md:col-span-2 w-full min-h-[60px] rounded-md border border-border bg-white px-3 py-2 text-sm"
          placeholder="How customer can track (e.g. 'Visit dtdc.in and enter AWB. Status updates every 6h.')"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>
      {tracking?.url && (
        <a
          href={tracking.url}
          target="_blank"
          rel="noopener"
          className="text-xs text-[#FFD166] inline-flex items-center gap-1 hover:text-white hover:underline"
        >
          <ExternalLink size={12} /> Open current tracking link
        </a>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          {tracking?.updatedAt
            ? `Updated ${new Date(tracking.updatedAt).toLocaleString()}`
            : "No tracking saved yet."}
        </span>
        <Button
          size="sm"
          className="bg-gold hover:bg-gold-spark text-navy font-bold"
          disabled={!dirty || (!courier && !number && !url)}
          onClick={() => onSave({ courier, number, url, instructions })}
        >
          <Save size={14} /> Save Tracking
        </Button>
      </div>
    </div>
  );
}

function PodPanel({
  pod,
  onSave,
}: {
  pod?: OrderProofOfDelivery;
  onSave: (p: Omit<OrderProofOfDelivery, "recordedAt">) => void;
}) {
  const [note, setNote] = useState(pod?.note ?? "");
  const [attachmentUrl, setAttachmentUrl] = useState(pod?.attachmentUrl ?? "");
  const [attachmentLabel, setAttachmentLabel] = useState(
    pod?.attachmentLabel ?? "Delivery photo"
  );

  const dirty =
    note !== (pod?.note ?? "") ||
    attachmentUrl !== (pod?.attachmentUrl ?? "") ||
    attachmentLabel !== (pod?.attachmentLabel ?? "Delivery photo");

  return (
    <div className="px-5 py-4 border-t border-border bg-green-50/40 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-navy uppercase tracking-wider">
        <ClipboardCheck size={14} /> Proof of Delivery
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          placeholder="Attachment label (e.g. Signed receipt)"
          value={attachmentLabel}
          onChange={(e) => setAttachmentLabel(e.target.value)}
        />
        <Input
          className="md:col-span-2"
          placeholder="Attachment URL (photo / signed receipt / drive link)"
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
        />
        <textarea
          className="md:col-span-3 w-full min-h-[60px] rounded-md border border-border bg-white px-3 py-2 text-sm"
          placeholder="Delivery note (received by, time, condition, etc.)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {pod?.attachmentUrl && (
        <a
          href={pod.attachmentUrl}
          target="_blank"
          rel="noopener"
          className="text-xs text-[#FFD166] inline-flex items-center gap-1 hover:text-white hover:underline"
        >
          <ExternalLink size={12} /> View {pod.attachmentLabel || "attachment"}
        </a>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          {pod?.recordedAt
            ? `Recorded ${new Date(pod.recordedAt).toLocaleString()}`
            : "Record proof of delivery once the order arrives."}
        </span>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white font-bold"
          disabled={!dirty || (!note && !attachmentUrl)}
          onClick={() => onSave({ note, attachmentUrl, attachmentLabel })}
        >
          <Save size={14} /> Save Proof
        </Button>
      </div>
    </div>
  );
}

function Detail({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}
