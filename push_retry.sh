#!/bin/bash
# 后台重试推送脚本：网络恢复后自动推送，成功后退出
REPO_DIR="/workspace/lifehub"
LOG="/tmp/push_log.txt"
MAX_LOOPS=240   # 240 * 60s = 4 小时上限
SLEEP=60

cd "$REPO_DIR" || exit 1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 重试循环启动 (最多 ${MAX_LOOPS} 次)" >> "$LOG"

for i in $(seq 1 $MAX_LOOPS); do
  out=$(timeout 50 git push origin master 2>&1)
  code=$?
  if [ $code -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 推送成功！(第 $i 次尝试)" >> "$LOG"
    echo "$out" >> "$LOG"
    echo "PUSH_SUCCESS" >> "$LOG"
    # 写标记文件，供下次交互确认
    date '+%Y-%m-%d %H:%M:%S' > /workspace/lifehub/PUSH_DONE.flag
    exit 0
  fi
  # 仅在整 10 次时记录一次，避免日志刷屏
  if [ $((i % 10)) -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 第 $i 次失败: $(echo "$out" | tail -1)" >> "$LOG"
  fi
  sleep $SLEEP
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⏰ 达到重试上限，停止循环（提交仍安全保留在本地）" >> "$LOG"
