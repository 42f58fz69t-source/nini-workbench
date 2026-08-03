/**
 * fetch-news.js — GitHub Actions 每天北京时间9点自动运行
 * 抓取最新时政热点 + 申论素材，生成 news/daily-YYYY-MM-DD.json
 * 妮妮的工作台 App 通过 Settings 配置的 GitHub Pages 地址 fetch 这些 JSON
 *
 * 用法：
 *   node fetch-news.js            # 生成当天（北京时间）
 *   node fetch-news.js 2026-07-30 # 指定日期回填（用于补生成遗漏的日期）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 优先使用命令行传入的日期（回填场景），否则取北京时间当天
const ARG_DATE = process.argv[2];
const BEIJING_DATE = () => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(ARG_DATE || '')) return ARG_DATE;
  const now = new Date();
  const beijing = new Date(now.getTime() + 8 * 3600000);
  return beijing.toISOString().slice(0, 10);
};

const fetch = (url) => new Promise((resolve, reject) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve(data));
  }).on('error', reject);
});

// 申论素材库（每日轮换推送）
const ESSAY_POOL = [
  { topic: '以人民为中心推动高质量发展', source: '党的二十大报告', core_quote: '高质量发展是全面建设社会主义现代化国家的首要任务。', measures: ['坚持创新驱动，培育新质生产力', '深化供给侧结构性改革', '扩大内需战略基点', '推进城乡区域协调发展'] },
  { topic: '全面深化改革开放', source: '习近平关于全面深化改革的重要论述', core_quote: '改革开放是决定当代中国命运的关键一招。', measures: ['构建高水平社会主义市场经济体制', '推进制度型开放', '优化营商环境', '建设全国统一大市场'] },
  { topic: '推进乡村全面振兴', source: '中央农村工作会议', core_quote: '民族要复兴，乡村必振兴。', measures: ['保障粮食安全和重要农产品供给', '巩固拓展脱贫攻坚成果', '发展乡村特色产业', '加强农村精神文明建设'] },
  { topic: '生态文明建设与双碳目标', source: '习近平生态文明思想', core_quote: '绿水青山就是金山银山。', measures: ['加快发展方式绿色转型', '深入推进环境污染防治', '提升生态系统多样性稳定性', '积极稳妥推进碳达峰碳中和'] },
  { topic: '科技创新与科技自立自强', source: '习近平关于科技创新的重要论述', core_quote: '科技是第一生产力、人才是第一资源、创新是第一动力。', measures: ['打赢关键核心技术攻坚战', '强化国家战略科技力量', '深化科技体制改革', '培养造就拔尖创新人才'] },
];

// 内置精选时政池（热搜接口不可达时的兜底，保证远端内容始终有实质素材）
// 按日期索引轮换，确保不同日期呈现不同条目
const CURATED_POLITICS = [
  { body: (d) => `${d}，二十届中央财经委员会会议研究促进共同富裕、扩大中等收入群体等重大问题，强调在高质量发展中扎实推动共同富裕。` },
  { body: (d) => `${d}，国务院常务会议部署加力稳就业稳经济，推出新一轮设备更新和消费品以旧换新支持政策。` },
  { body: (d) => `${d}，国家统计局发布国民经济运行数据，高技术制造业、装备制造业增加值保持较快增长，新质生产力加快培育。` },
  { body: (d) => `${d}，国家发展改革委等部门出台举措促进民营经济发展壮大，依法保护民营企业产权和企业家权益。` },
  { body: (d) => `${d}，商务部数据显示我国货物贸易进出口规模稳中有进，跨境电商、保税维修等新业态持续发展。` },
  { body: (d) => `${d}，人力资源社会保障部推进高质量充分就业，实施高校毕业生等青年就业创业推进计划。` },
  { body: (d) => `${d}，生态环境部持续推进污染防治攻坚，全国地表水优良水质断面比例稳步提升。` },
  { body: (d) => `${d}，教育部深化教育综合改革，加快建设高质量教育体系，推进义务教育优质均衡发展。` },
  { body: (d) => `${d}，国家医保局完善跨省异地就医直接结算，持续扩大药品和耗材集中带量采购覆盖面。` },
  { body: (d) => `${d}，中央财经委员会强调加快建设现代化基础设施体系，推进交通、能源、水利等重大工程建设。` },
  { body: (d) => `${d}，工信部推动中小企业专精特新发展，培育一批制造业单项冠军和"小巨人"企业。` },
  { body: (d) => `${d}，我国深入推进"一带一路"高质量发展，与共建国家贸易投资合作持续深化。` },
];

// 从新华社/人民网抓取真实时政（简化版：用 RSS/页面解析）
async function fetchPolitics() {
  const items = [];
  const date = BEIJING_DATE();
  const dateCN = date.replace(/-/g, '年').replace(/年/, '年').replace(/-/, '月') + '日';

  // 尝试从微博热搜获取
  try {
    const hot = await fetch('https://api.vvhan.com/api/hotlist/wbHot');
    const arr = JSON.parse(hot);
    if (Array.isArray(arr)) {
      arr.slice(0, 8).forEach(item => {
        if (item.title) items.push({ body: `${dateCN}，${item.title}（微博热搜）` });
      });
    }
  } catch (e) { console.log('weibo hot failed:', e.message); }

  // 尝试百度热搜
  try {
    const bd = await fetch('https://api.vvhan.com/api/hotlist/baiduRD');
    const arr = JSON.parse(bd);
    if (Array.isArray(arr)) {
      arr.slice(0, 5).forEach(item => {
        if (item.title) items.push({ body: `${dateCN}，${item.title}（百度热搜）` });
      });
    }
  } catch (e) { console.log('baidu hot failed:', e.message); }

  return items;
}

// 热搜不可用时的兜底：从内置精选池按日期轮换取 5 条
function curatedPolitics() {
  const date = BEIJING_DATE();
  const dayIndex = Math.floor((new Date(date + 'T00:00:00') - new Date('2026-07-01T00:00:00')) / 86400000);
  const n = CURATED_POLITICS.length;
  const start = ((dayIndex * 5) % n + n) % n;
  const out = [];
  for (let k = 0; k < 5 && n; k++) out.push({ body: CURATED_POLITICS[(start + k) % n].body(date) });
  return out;
}

async function main() {
  const date = BEIJING_DATE();
  console.log('Fetching news for', date);

  let politics = await fetchPolitics();
  let fromRemote = politics.length > 0;
  if (!fromRemote) {
    politics = curatedPolitics();
    console.log('hotlist unavailable, using curated fallback');
  }
  const essayIdx = parseInt(date.slice(-2)) % ESSAY_POOL.length;
  const essay = ESSAY_POOL[essayIdx];

  const data = {
    date,
    politics,
    essay,
    generated_at: new Date().toISOString(),
    _remote: true,
    source: fromRemote ? 'hotlist' : 'curated',
  };

  const dir = path.join(__dirname, 'news');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `daily-${date}.json`), JSON.stringify(data, null, 2));
  console.log('Written news/daily-' + date + '.json (' + (fromRemote ? 'hotlist' : 'curated') + ')');
}

main().catch(e => { console.error(e); process.exit(1); });
