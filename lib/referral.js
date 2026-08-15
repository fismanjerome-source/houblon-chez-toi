// Génère un code de parrainage lisible à partir du prénom : ex. "JEROME482".
function makeReferralCode(name) {
  const base = (name || 'AMI')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // enlève les accents
    .split(' ')[0]
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 8) || 'AMI';
  const suffix = Math.floor(100 + Math.random() * 900); // 3 chiffres
  return `${base}${suffix}`;
}

async function generateUniqueReferralCode(prisma, name) {
  for (let i = 0; i < 10; i++) {
    const code = makeReferralCode(name);
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  return `${makeReferralCode(name)}${Date.now().toString().slice(-4)}`;
}

module.exports = { makeReferralCode, generateUniqueReferralCode };
