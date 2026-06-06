import { CartItem } from '@/types'

export function buildWhatsAppMessage(items: CartItem[], total: number): string {
  const lines = items.map(
    ({ product, quantity }) =>
      `• ${product.name} x${quantity} — $${(product.price * quantity).toFixed(2)}`
  )
  const message = [
    '¡Hola VOSCO! Quiero hacer un pedido:',
    '',
    ...lines,
    '',
    `*Total: $${total.toFixed(2)}*`,
    '',
    'Por favor confirmar disponibilidad. Gracias.',
  ].join('\n')
  return message
}

export function getWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '584141234567'
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
