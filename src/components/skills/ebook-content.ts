import { listLocalBooks, storeLocalBook, type LocalBook } from './LocalEBookReader';
import type JSZipArchive from 'jszip';

const MAX_COMIC_BYTES = 100 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
const encoder = new TextEncoder();
const chapter = (title: string, paragraphs: string[]) => ({ title, paragraphs });

const moonlightChapters = [
  chapter('第一章 · 出发之前', [
    '林澄是在一个普通的周五决定出门的。桌上的茶已经凉了，电脑里的光标还在一句没有写完的话后面闪烁。窗外的月亮很低，像一张贴在城市边缘的车票。她收起电脑，拿了一本空白的笔记本，想看看晚上的河岸有没有不同。',
    '楼下的便利店刚换班。店员把最后一只烤红薯递给她，说今天风小，沿河走会很舒服。她没有查路线，也没有给散步定一个终点，只把那只温热的纸袋握在掌心。这样的出发很轻，轻到不需要向任何人解释。',
    '穿过街口时，信号灯还剩十秒。她停了下来。以前她总会跑过去，像是错过这一盏绿灯，就要错过整座城市。今晚她愿意等。公交车从身旁滑过，车窗里有人睡着了，有人抱着花，所有人都带着一个她不知道的目的地。',
    '她在笔记本第一页写下：今晚，先不赶路。字写得有些歪，因为红薯的热气还在手指间。等到下一盏绿灯亮起，她才迈出脚步。这场旅行没有远方，只有从熟悉的生活里，往旁边轻轻挪开的一小步。',
  ]),
  chapter('第二章 · 风的方向', [
    '河岸入口有一棵很大的树。树下的自行车停得整整齐齐，车铃偶尔被风碰出一声。林澄把纸袋叠好，放进背包的侧袋。风从水面过来，带着湿润的凉意，也带着不远处餐馆里炒菜的香气。',
    '一位老人正在调一台旧收音机。旋钮转过几个电台，先是球赛，再是新闻，最后停在一首很慢的曲子上。他说，这台机器的天线断过一次，是用一根细铜丝接回去的。林澄看见那根铜丝在灯下发亮，像一条给声音搭的桥。',
    '他们没有谈很久。老人问她走到哪里，她说还不知道。他笑了一下，把收音机放在长椅的另一头，给她留出一个位置。两个人听完了一首歌，然后各自继续自己的晚上。',
    '她开始注意风的方向。迎着风时，衣角向后拽；背着风时，脚步似乎省下一点力气。她突然觉得，生活里许多没有说清的感受，也许只是不同方向的风。不必立刻给它们名字，先站稳，再慢慢往前走。',
  ]),
  chapter('第三章 · 河岸的灯', [
    '傍晚，城市慢慢安静下来。河边的灯一盏接一盏亮起，像给归途标出了温柔的坐标。水面把每一盏灯拉成一条长长的线，船经过时，那些线又碎成细小的金片，很快重新聚拢。',
    '林澄走到桥下。桥上车辆不断，桥下却有一小片听得见水声的地方。一个孩子蹲在台阶上，认真看一只蚂蚁搬运比自己大很多的碎屑。他的母亲没有催他，只在几步之外等着。她想，等待有时也是一种陪伴。',
    '她把今天遇见的风景写进笔记。那些看似平常的瞬间，后来都成了值得重读的故事：断了又接好的天线，一只被等候的蚂蚁，还有便利店员说起天气时的语气。原来一座城市的温度，藏在这样小的事情里。',
    '走累了，她在长椅上坐下。身后的办公楼还有许多亮着的窗，每一扇窗里都可能有人正在努力完成一天。她没有把这些灯想成催促，而是想成彼此照面的信号。无论走到哪里，总有人也还醒着。',
  ]),
  chapter('第四章 · 没有地址的明信片', [
    '桥边的小摊卖手画的明信片。画上没有地标，只有一把椅子、一只猫和一棵被风吹歪的树。摊主说，很多人认不出这是哪里，但都觉得自己曾经去过。林澄挑了那张椅子，因为空着的位置看上去很安静。',
    '她想给朋友写点什么。翻到背面，才发现自己记得朋友家附近的面包店和门口的蓝色自行车，却不记得完整的地址。手机当然能找到答案，但她暂时没有拿出来，只写了第一句话：今天我学会了等一盏绿灯。',
    '接下来写得很慢。她写收音机里的曲子，写河面上断开又接上的灯光，写一个母亲怎样等孩子看完蚂蚁。写到最后，明信片还没有地址，却已经有了要抵达的地方——朋友某个普通的傍晚。',
    '摊主给她一个透明的小袋。她把明信片放进去，没有急着寄。不是所有抵达都要当晚完成，也不是每一种想念都需要立即得到回音。把话好好写下来，本身就已经走完了一段路。',
  ]),
  chapter('第五章 · 归途', [
    '回家时，月亮移到了更高的地方。她沿着同一条路往回走，路却和来时有些不同。街口的树影变长了，便利店的灯更显明亮，修鞋摊已经收起工具，只剩一把靠在墙边的木椅。',
    '林澄在门前停了一会儿。她发现自己没有拍很多照片，也没有走完计划里的步数，但今晚没有因此少掉什么。鞋底沾了一点灰，纸袋里还留着红薯的香气，笔记本从空白变成了可以重新打开的地方。',
    '上楼后，她把明信片放在桌角，把窗打开一条缝。电脑仍停在那句没有写完的话后面。她读了一遍，删掉了几个急促的词，又接上一个缓慢的句子。窗外的风，刚好翻过笔记本的一页。',
    '旅行结束在一杯温水旁。她没有变成另一个人，只是更愿意留意那些已经存在的光。睡前，她在最后一页写道：明天也许很忙，但我知道河岸还在那里，下一盏绿灯也会亮起来。',
  ]),
];

const cityChapters = [
  chapter('第一章 · 清晨的缝隙', [
    '城市醒来之前，总会先露出几道小小的缝隙。清扫车缓慢驶过街角，面包房把第一盘面包送进柜台，送报的人在楼道口整理车筐。我从这些尚未被人群填满的空隙里，开始观察一条熟悉的街。',
    '早餐摊的蒸汽让招牌变得模糊。一个上夜班的人和一个刚要上班的人站在同一张小桌前，各自等一碗热粥。他们没有交谈，却一起给老板让出递碗的位置。城市每天都发生许多这样的配合，安静得像呼吸。',
    '树池旁长出一株不知名的草。它没有参加街道的规划，却用自己的方式占据了两块砖之间的地方。我蹲下看了一会儿，把它画在纸上。观察并不总是为了找出结论，有时只是让一件小事被看见。',
  ]),
  chapter('第二章 · 窗与招牌', [
    '午后的阳光沿着楼面移动，经过每一扇窗时，都像轻轻敲了一下门。有人把洗好的被单晾出来，有人在窗台上种葱，有一扇窗始终拉着蓝色的帘子。这些细节让重复的建筑有了不同的表情。',
    '街角的旧书店换了招牌，新招牌仍保留原先那个有些歪的字。老板说，是第一位顾客用毛笔写的，电脑排版怎样都写不出那个样子。我在门口站着，看见新的灯箱照亮一段旧的记忆。',
    '我们通常用道路和楼层描述城市，却用气味、颜色和某个人的声音记住它。回忆里的路不一定准确，但总有几处特别清楚。对我来说，是夏天被单的白色，和书店门铃迟半拍响起的声音。',
  ]),
  chapter('第三章 · 黄昏的座位', [
    '公园里有三张朝向不同的长椅。第一张看得到路口，第二张面对池塘，第三张藏在树荫里。黄昏时它们总会被不同的人占据：等车的人，看水的人，以及只想坐一会儿的人。',
    '我选了第二张。池塘里的倒影比真正的天空更早变暗，鸭子游过时，把云切成了几块。旁边一个女孩在练习画画，她擦掉又重画一条线，最后干脆换到纸的另一面。她没有显得沮丧，只是继续。',
    '长椅是一种很朴素的公共邀请：你可以暂时停下来，不必解释自己为何停下。等天色完全暗下去，我们先后离开，那张椅子又空出来，准备接住下一个经过这里的傍晚。',
  ]),
  chapter('第四章 · 记住一座城', [
    '夜里回看这些记录，我发现纸上并没有很多宏大的画面。多数是一个被等候的位置、一条砖缝、一声门铃，还有一张不用预约的长椅。它们没有说明整座城市，却让我更清楚自己怎样生活在这里。',
    '观察不能替代参与。第二天，我向书店老板道了谢，给树池里的草绕开一点空间，在早餐摊上把桌子擦干净。这些动作很小，却让记录和生活连在一起，不再只是隔着一扇窗看风景。',
    '如果你也想开始，可以选一条常走的路，每次只记一件以前没有注意过的事。很快你会发现，所谓熟悉，并不是已经看完；它只是给我们更多机会，慢慢看见。',
  ]),
];

function textSample(id: string, title: string, chapters: typeof moonlightChapters, cover: string): LocalBook {
  const paragraphs = chapters.map(item => item.paragraphs.join('\n\n'));
  return { id, title, author: 'Stellar 原创', format: 'txt', bytes: encoder.encode(paragraphs.join('\n')).buffer,
    paragraphs, toc: chapters.map((item, index) => ({ id: `chapter-${index + 1}`, label: item.title, href: String(index) })),
    cover, sample: true, readingState: 'want', location: '', progress: 0, lastRead: '', bookmarks: [], notes: [], tags: ['原创示例'] };
}

let seedPromise: Promise<LocalBook[]> | undefined;
export function ensureSampleBooks(): Promise<LocalBook[]> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const books = await listLocalBooks();
    const samples: LocalBook[] = [
      textSample('stellar-original-moonlight-v1', '月光旅行', moonlightChapters, '/ebook/moonlight-cover.svg'),
      textSample('stellar-original-city-v1', '城市观察', cityChapters, '/ebook/city-cover.svg'),
      { id: 'stellar-original-night-post-v1', title: '夜航邮局', author: 'Stellar 原创', format: 'comic', bytes: new ArrayBuffer(0),
        cover: '/ebook/night-post-page.png', sample: true, readingState: 'want', toc: [], comicPages: [
          { name: '第一话 · 写给明天', data: '/ebook/night-post-page.png' },
          { name: '第二话 · 河上的地址', data: '/ebook/night-post-02.svg' },
          { name: '第三话 · 灯亮的时候', data: '/ebook/night-post-03.svg' },
        ], location: '', progress: 0, lastRead: '', bookmarks: [], notes: [], tags: ['原创示例'] },
    ];
    for (const sample of samples) if (!books.some(book => book.id === sample.id)) await storeLocalBook(sample);
    return listLocalBooks();
  })().finally(() => { seedPromise = undefined; });
  return seedPromise;
}

function imageType(name: string, bytes: Uint8Array) {
  const declared = IMAGE_TYPES[name.split('.').pop()?.toLowerCase() || ''];
  const png = bytes.length >= 24 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const jpeg = bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.length >= 16 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  const actual = png ? 'image/png' : jpeg ? 'image/jpeg' : webp ? 'image/webp' : '';
  if (!declared || actual !== declared) throw new Error(`“${name}”不是有效的 PNG / JPEG / WebP 图片。`);
  return actual;
}

async function imageDataUrl(name: string, bytes: Uint8Array, mime?: string) {
  const type = imageType(name, bytes);
  if (mime && mime !== type && mime !== 'application/octet-stream') throw new Error(`“${name}”的图片类型与扩展名不符。`);
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`无法读取“${name}”。`));
    reader.readAsDataURL(new Blob([bytes], { type }));
  });
  await new Promise<void>((resolve, reject) => {
    const image = new Image();
    const timeout = setTimeout(() => reject(new Error(`“${name}”解码超时，请检查图片。`)), 10000);
    image.onload = () => { clearTimeout(timeout); image.naturalWidth && image.naturalHeight ? resolve() : reject(new Error(`“${name}”没有有效画面。`)); };
    image.onerror = () => { clearTimeout(timeout); reject(new Error(`“${name}”已损坏，无法打开。`)); };
    image.src = data;
  });
  return data;
}

export async function importComicBook(files: File[]): Promise<LocalBook> {
  if (!files.length || files.some(file => !file.size) || files.reduce((sum, file) => sum + file.size, 0) > MAX_COMIC_BYTES) throw new Error('请选择非空的图片序列或 CBZ，总大小不超过 100 MB。');
  const input: { name: string; bytes: Uint8Array; mime?: string }[] = [];
  const cbz = files.length === 1 && /\.cbz$/i.test(files[0].name);
  if (cbz) {
    const { default: JSZip } = await import('jszip'); // Reuse the ZIP dependency already required by EPUB.js.
    let zip: JSZipArchive;
    try { zip = await JSZip.loadAsync(await files[0].arrayBuffer()); }
    catch { throw new Error('CBZ 已损坏或不是有效的 ZIP 文件。'); }
    const entries = Object.values(zip.files).filter(item => !item.dir && !item.name.startsWith('__MACOSX/') && /\.(png|jpe?g|webp)$/i.test(item.name));
    if (!entries.length) throw new Error('CBZ 中没有 PNG / JPEG / WebP 图片。');
    // JSZip exposes declared uncompressed sizes on loaded entries; check before inflating.
    const declaredBytes = entries.reduce((sum, item) => sum + ((item as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || 0), 0);
    if (declaredBytes > MAX_COMIC_BYTES) throw new Error('CBZ 解压后的图片总大小超过 100 MB。');
    let total = 0;
    for (const item of entries) {
      const bytes = await item.async('uint8array'); total += bytes.byteLength;
      if (!bytes.byteLength || total > MAX_COMIC_BYTES) throw new Error('CBZ 含空图片，或解压后的图片总大小超过 100 MB。');
      input.push({ name: item.name, bytes });
    }
  } else {
    for (const file of files) input.push({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()), mime: file.type });
  }
  input.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true, sensitivity: 'base' }));
  const pages: NonNullable<LocalBook['comicPages']> = [];
  const hashes: string[] = [];
  for (const item of input) {
    pages.push({ name: item.name, data: await imageDataUrl(item.name, item.bytes, item.mime) });
    const hash = await crypto.subtle.digest('SHA-256', item.bytes);
    hashes.push(`${item.name}:${Array.from(new Uint8Array(hash)).map(v => v.toString(16).padStart(2, '0')).join('')}`);
  }
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(hashes.join('\n')));
  const id = `comic-${Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('')}`;
  const existing = (await listLocalBooks()).find(book => book.id === id);
  if (existing) return existing;
  const title = cbz ? files[0].name.replace(/\.[^.]+$/, '') : input[0].name.replace(/\.[^.]+$/, '').replace(/[-_\s]*\d+$/, '') || '导入的漫画';
  const item: LocalBook = { id, title,
    author: '作者未提供', format: 'comic', bytes: new ArrayBuffer(0), cover: pages[0].data, comicPages: pages, toc: [],
    location: '', progress: 0, lastRead: '', bookmarks: [], notes: [], readingState: 'want' };
  await storeLocalBook(item);
  return item;
}
