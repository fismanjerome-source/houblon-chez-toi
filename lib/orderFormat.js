function euros(cents) {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
}

function orderLines(order) {
  const lines = [];
  for (const item of order.items) {
    if (item.format > 0) {
      let label = `${item.quantity} × ${item.beer.name} ${item.format}cl`;
      if (item.glass) label += ` + ${item.glass.name} ${item.glass.volumeCl}cl`;
      lines.push({ label, amount: item.unitPriceCents * item.quantity + item.depositCents + (item.glass ? Math.round(item.glass.price * 100) : 0) });
    } else if (item.glass) {
      lines.push({ label: `Verre ${item.glass.name} ${item.glass.volumeCl}cl (${item.beer.name})`, amount: Math.round(item.glass.price * 100) });
    }
  }
  for (const extra of order.extras || []) {
    lines.push({ label: `${extra.quantity} × ${extra.name}`, amount: extra.lineTotalCents });
  }
  return lines;
}

module.exports = { euros, orderLines };
