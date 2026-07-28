/**
 * fetch-news.js — GitHub Actions 每天9点自动运行
 * 抓取最新时政热点 + 申论素材，生成 news/daily-YYYY-MM-DD.json
 * 妮妮的工作台 App 通过 Settings 配置的 GitHub Pages 地址 fetch 这些 JSON
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BEIJING_DATE = () => {
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

// 从新华社/人民网抓取真实时政（简化版：用 RSS/页面解析）
async function fetchPolitics() {
  const items = [];
  const date = BEIJING_DATE();
  const dateCN = date.replace(/-/g, '年').replace(/年/, '年').replace(/-/, '月') + '日';

  // 尝试从百度热搜新闻获取
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

// 申论素材库（每日轮换推送）
const ESSAY_POOL = [
  { topic: '以人民为中心推动高质量发展', source: '党的二十大报告', core_quote: '高质量发展是全面建设社会主义现代化国家的首要任务。', measures: ['坚持创新驱动，培育新质生产力', '深化供给侧结构性改革', '扩大内需战略基点', '推进城乡区域协调发展'] },
  { topic: '全面深化改革开放', source: '习近平关于全面深化改革的重要论述', core_quote: '改革开放是决定当代中国命运的关键一招。', measures: ['构建高水平社会主义市场经济体制', '推进制度型开放', '优化营商环境', '建设全国统一大市场'] },
  { topic: '推进乡村全面振兴', source: '中央农村工作会议', core_quote: '民族要复兴，乡村必振兴。', measures: ['保障粮食安全和重要农产品供给', '巩固拓展脱贫攻坚成果', '发展乡村特色产业', '加强农村精神文明建设'] },
  { topic: '生态文明建设与双碳目标', source: '习近平生态文明思想', core_quote: '绿水青山就是金山银山。', measures: ['加快发展方式绿色转型', '深入推进环境污染防治', '提升生态系统多样性稳定性', '积极稳妥推进碳达峰碳中和'] },
  { topic: '科技创新与科技自立自强', source: '习近平关于科技创新的重要论述', core_quote: '科技是第一生产力、人才是第一资源、创新是第一动力。', measures: ['打赢关键核心技术攻坚战', '强化国家战略科技力量', '深化科技体制改革', '培养造就拔尖创新人才'] },
];

async function main() {
  const date = BEIJING_DATE();
  console.log('Fetching news for', date);

  const politics = await fetchPolitics();
  const essayIdx = parseInt(date.slice(-2)) % ESSAY_POOL.length;
  const essay = ESSAY_POOL[essayIdx];

  const data = {
    date,
    politics: politics.length ? politics : [{ body: `${date}，暂未获取到实时新闻，请稍后刷新（GitHub Actions）` }],
    essay,
    generated_at: new Date().toISOString(),
    _remote: true,
  };

  const dir = path.join(__dirname, 'news');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `daily-${date}.json`), JSON.stringify(data, null, 2));
  console.log('Written news/daily-' + date + '.json');
}

main().catch(e => { console.error(e); process.exit(1); });
