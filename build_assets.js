const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = __dirname;
const photoDir = path.join(root, 'SourcePhotos');
const postsDir = path.join(root, 'Posts');
const highlightsDir = path.join(root, 'Highlights');
fs.mkdirSync(postsDir, { recursive: true });
fs.mkdirSync(highlightsDir, { recursive: true });

const cards = [
  { eye: 'ПЕРЕД ПЕРЕХОДОМ', lines: ['Переход в MLM:', '5 вопросов до решения'], sub: 'Проверьте компанию до решения' },
  { eye: 'ВЫПЛАТЫ / РАСХОДЫ', lines: ['Команда растёт.', 'А чистый доход?'], sub: 'Считайте выплаты за вычетом затрат' },
  { eye: 'ПОВТОРНЫЙ СПРОС', lines: ['Купят продукт', 'клиенты снова?'], sub: 'Ценность важнее презентации' },
  { eye: 'УСЛОВИЯ УЧАСТИЯ', lines: ['Нужны закупки?', 'Проверьте условие'], sub: 'Уточните правила до регистрации' },
  { eye: 'КАК РАБОТАЕТ ПЛАН', lines: ['Процент — это', 'ещё не ваш доход'], sub: 'Сначала найдите базу расчёта' },
  { eye: 'РЕАЛЬНЫЙ ПОКУПАТЕЛЬ', lines: ['Продукт нужен', 'клиентам снова?'], sub: 'Спрос важен и вне бизнеса' },
  { eye: 'ПРОВЕРКА ДОКУМЕНТОВ', lines: ['Запросите эти', 'документы до старта'], sub: 'План, договор, цены и возвраты' },
  { eye: 'РОСТ КОМАНДЫ', lines: ['Больше людей —', 'больше выплат?'], sub: 'Сверьте объёмы и правила плана' },
  { eye: 'КРИТЕРИИ ВЫБОРА', lines: ['Как выбрать', 'MLM-компанию?'], sub: 'Продукт • обязательства • экономика' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function overlay(card, n) {
  const lines = card.lines.map((line, i) => `<text x="76" y="${858 + i * 100}" class="title">${esc(line)}</text>`).join('');
  const subLines = card.sub.length > 30
    ? [card.sub.slice(0, card.sub.lastIndexOf(' ', 30)), card.sub.slice(card.sub.lastIndexOf(' ', 30) + 1)]
    : [card.sub];
  const sub = subLines.map((line, i) => `<text x="78" y="${1080 + i * 38}" class="sub">${esc(line)}</text>`).join('');
  return Buffer.from(`<svg width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="47%" stop-color="#0F202E" stop-opacity="0"/><stop offset="60%" stop-color="#0F202E" stop-opacity=".88"/><stop offset="100%" stop-color="#0F202E" stop-opacity=".98"/></linearGradient></defs>
    <rect width="1080" height="1350" fill="url(#fade)"/>
    <rect x="62" y="54" width="316" height="48" rx="24" fill="#0F202E" fill-opacity=".86"/>
    <text x="84" y="86" font-family="Arial,sans-serif" font-size="20" font-weight="700" letter-spacing="2" fill="#F2EDE4">РАЗБОР MLM</text>
    <rect x="918" y="54" width="100" height="48" rx="24" fill="#0F202E" fill-opacity=".86"/>
    <text x="938" y="86" font-family="Arial,sans-serif" font-size="20" font-weight="700" letter-spacing="1" fill="#F2EDE4">${String(n).padStart(2, '0')} / 09</text>
    <rect x="76" y="724" width="94" height="6" rx="3" fill="#D7B57E"/>
    <text x="76" y="779" font-family="Arial,sans-serif" font-size="25" font-weight="700" letter-spacing="3" fill="#D7B57E">${esc(card.eye)}</text>
    ${lines}
    ${sub}
    <text x="78" y="1204" font-family="Arial,sans-serif" font-size="20" font-weight="700" letter-spacing="2" fill="#D7B57E">ПОДПИСИ В ОПИСАНИИ</text>
    <line x1="78" y1="1244" x2="1002" y2="1244" stroke="#F2EDE4" stroke-opacity=".35" stroke-width="2"/>
    <text x="78" y="1302" font-family="Arial,sans-serif" font-size="21" font-weight="600" letter-spacing="1.4" fill="#F2EDE4">ДЕНИС СТЕПАНОВ  ·  @STEPANOV_NSP</text>
    <style>.title{font-family:Arial,sans-serif;font-weight:800;font-size:84px;letter-spacing:-2px;fill:#fff}.sub{font-family:Arial,sans-serif;font-size:29px;font-weight:400;fill:#E2E8EB}</style>
  </svg>`);
}

async function buildCards() {
  for (let i = 0; i < cards.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const photo = path.join(photoDir, `photo_${num}.png`);
    const out = path.join(postsDir, `post_${num}.jpg`);
    await sharp(photo).resize(1080, 1350, { fit: 'cover', position: 'centre' }).composite([{ input: overlay(cards[i], i + 1) }]).jpeg({ quality: 91, mozjpeg: true }).toFile(out);
  }
  const tileW = 360, tileH = 450, gap = 8;
  const parts = [];
  for (let i = 0; i < 9; i++) {
    const num = String(i + 1).padStart(2, '0');
    const tile = await sharp(path.join(postsDir, `post_${num}.jpg`)).resize(tileW, tileH, { fit: 'cover' }).jpeg({ quality: 92 }).toBuffer();
    parts.push({ input: tile, left: (i % 3) * (tileW + gap), top: Math.floor(i / 3) * (tileH + gap) });
  }
  await sharp({ create: { width: tileW * 3 + gap * 2, height: tileH * 3 + gap * 2, channels: 3, background: '#0F202E' } }).composite(parts).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(root, 'setka_3x3.jpg'));
  await sharp(path.join(root, 'avatar.png')).resize(1080, 1080, { fit: 'cover' }).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(root, 'avatar.jpg'));
}

const icons = {
  start: '<path d="M256 130l62 126-62 126-62-126z"/><circle cx="256" cy="256" r="150"/><path d="M256 205v102m-51-51h102"/>',
  check: '<circle cx="256" cy="256" r="150"/><path d="M188 260l48 48 92-104"/>',
  expenses: '<rect x="152" y="112" width="208" height="292" rx="22"/><path d="M188 154h136v58H188zM194 252h16m50 0h16m50 0h16m-148 54h16m50 0h16m50 0h16m-148 54h16m50 0h16m50 0h16"/>',
  product: '<path d="M256 120l132 72v144l-132 72-132-72V192z"/><path d="M124 192l132 74 132-74m-132 74v142m-68-252l136 75"/>',
  book: '<path d="M126 146h98c26 0 42 16 42 40v206c0-24-16-40-42-40h-98zM386 146h-98c-26 0-42 16-42 40v206c0-24 16-40 42-40h98z"/><path d="M256 186v206"/>',
  partner: '<circle cx="196" cy="256" r="72"/><circle cx="316" cy="256" r="72"/><path d="M232 256h48m-84-84l40 40m40 88l40 40"/>'
};

async function buildHighlights() {
  const labels = ['start', 'check', 'expenses', 'product', 'book', 'partner'];
  for (const name of labels) {
    const svg = Buffer.from(`<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="#0F202E"/><circle cx="256" cy="256" r="207" fill="none" stroke="#D7B57E" stroke-width="4"/><g fill="none" stroke="#F2EDE4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</g></svg>`);
    await sharp(svg).png().toFile(path.join(highlightsDir, `${name}.png`));
  }
}

(async () => { await buildCards(); await buildHighlights(); })().catch((e) => { console.error(e); process.exit(1); });
