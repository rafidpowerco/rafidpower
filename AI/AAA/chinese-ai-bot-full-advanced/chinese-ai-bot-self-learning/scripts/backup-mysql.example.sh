#!/usr/bin/env bash
# مثال نسخ احتياطي لـ MySQL — انسخ إلى backup-mysql.sh وعدّل المتغيرات.
# لا تضع كلمات المرور في Git؛ استخدم متغيرات بيئة على الخادم أو مدير أسرار.
set -euo pipefail
: "${DB_HOST:?ضع DB_HOST}"
: "${DB_USER:?ضع DB_USER}"
: "${DB_NAME:?ضع DB_NAME}"
OUT="${BACKUP_DIR:-.}/botdb-$(date -u +%Y%m%d-%H%M%S).sql.gz"
mysqldump -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" --single-transaction --routines "$DB_NAME" | gzip >"$OUT"
echo "تم: $OUT"
