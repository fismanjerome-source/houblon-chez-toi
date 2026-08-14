async function nextInvoiceNumber(prisma) {
  const year = new Date().getFullYear();
  const counter = await prisma.invoiceCounter.upsert({
    where: { year },
    update: { lastNumber: { increment: 1 } },
    create: { year, lastNumber: 1 },
  });
  return `F${year}-${String(counter.lastNumber).padStart(4, '0')}`;
}

module.exports = { nextInvoiceNumber };
