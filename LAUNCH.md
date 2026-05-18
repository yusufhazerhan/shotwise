# Shotwise — Production Launch Checklist

Sıfırdan canlıya geçiş. Her adımı sırayla yap.

---

## 1. Hesapları Aç (Bir Kez)

| Servis | Ne İçin | Link |
|--------|---------|------|
| **Hetzner** | VPS (CX22, ~4€/ay) | hetzner.com |
| **Resend** | Magic-link e-postası (free: 3k/ay) | resend.com |
| **Google AI Studio** | Gemini API key (free tier yeterli) | aistudio.google.com |
| **Paddle** | Ödeme sistemi (sandbox önce, sonra live) | paddle.com |
| **GitHub** | Kod + CI/CD image build | github.com |
| **Domain** | shotwise.app veya kendi domain | namecheap / porkbun |

---

## 2. Domain DNS Ayarı

Domain satın aldıktan sonra:

```
A   @       → <VPS IP>
A   www     → <VPS IP>
```

Propagasyon 5–30 dk sürer. Test:

```bash
dig +short yourdomain.com
# → VPS IP çıkmalı
```

---

## 3. GitHub Repo Ayarı

```bash
# Repoyu GitHub'a push et
git remote add origin https://github.com/<kullanici>/shotwise.git
git push -u origin main
```

### GitHub Actions Secrets

Repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Değer |
|--------|-------|
| `GHCR_TOKEN` | GitHub → Settings → Developer settings → PAT (write:packages) |

### GitHub Actions Variables

| Variable | Değer |
|----------|-------|
| `VPS_HOST` | VPS IP adresi |
| `VPS_USER` | `root` (veya sudo user) |
| `VPS_SSH_KEY` | SSH private key (`cat ~/.ssh/id_ed25519`) |
| `VPS_DEPLOY_PATH` | `/opt/shotwise` |

---

## 4. Resend Ayarı

1. resend.com → Sign up
2. **Domains** → Add Domain → `mail.yourdomain.com` → DNS kayıtlarını ekle
3. **API Keys** → Create API Key → kopyala
4. `RESEND_API_KEY` ve `RESEND_FROM_EMAIL=Shotwise <noreply@yourdomain.com>` değerlerini kaydet

---

## 5. Gemini API Key

1. aistudio.google.com → Sign in with Google
2. **Get API key** → Create API key
3. `GEMINI_API_KEY` değerini kaydet

> Free tier: 15 req/min, 1M token/day — başlangıç için yeterli.

---

## 6. Paddle Ayarı

### 6a. Sandbox'ta Test Et (Önce)

1. paddle.com → Register → Business bilgilerini gir
2. **Developer tools** → Authentication → Generate API Key → `PADDLE_API_KEY`
3. **Developer tools** → Client-side tokens → `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`

### 6b. Ürünleri Oluştur

Paddle Dashboard → Catalog → Products:

**Ürün 1: Starter Pack**
- Name: `Starter Pack`
- Type: One-time
- Price: `$4.99`
- → Price ID'yi kaydet → `PADDLE_PRICE_STARTER=pri_xxxx`

**Ürün 2: Top Up**
- Name: `Top Up 50`
- Type: One-time
- Price: `$2.99`
- → Price ID'yi kaydet → `PADDLE_PRICE_TOPUP=pri_xxxx`

### 6c. Webhook Kur

Paddle → Developer Tools → Notifications → New notification:

- URL: `https://yourdomain.com/api/webhooks/paddle`
- Events: `transaction.completed`
- → Webhook secret'ı kaydet → `PADDLE_WEBHOOK_SECRET`

> Sandbox'ta test et, çalışınca **Live** moduna geç (aynı adımları live dashboard'da tekrarla).

---

## 7. VPS Kurulum

```bash
# VPS'e bağlan
ssh root@<VPS_IP>

# Docker kur
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git curl

# Docker daemon başlat
systemctl enable docker && systemctl start docker

# Repo klasörü
mkdir -p /opt/shotwise && cd /opt/shotwise

# GitHub'dan çek (SSH key kuruluysa)
git clone https://github.com/<kullanici>/shotwise.git .
```

---

## 8. Environment Değişkenleri

```bash
cd /opt/shotwise
cp .env.example .env
nano .env   # aşağıdaki değerleri doldur
```

Doldurulacak `.env`:

```env
# === ZORUNLU ===

NODE_ENV=production
DOMAIN=yourdomain.com
APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
BETTER_AUTH_URL=https://yourdomain.com

# Güçlü random string (32+ karakter):
BETTER_AUTH_SECRET=<openssl rand -base64 32 çıktısı>

# Database (postgres container'a bağlanır, değiştirme)
DATABASE_URL=postgres://shotwise:<POSTGRES_PASSWORD>@postgres:5432/shotwise
POSTGRES_PASSWORD=<güçlü bir şifre oluştur>

# Resend
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=Shotwise <noreply@yourdomain.com>

# Gemini
GEMINI_API_KEY=AIza...

# MinIO (container içi, değiştirme)
S3_ENDPOINT=http://minio:9000
S3_PUBLIC_ENDPOINT=https://yourdomain.com   # signed URL'ler için
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<güçlü kullanıcı adı>
S3_SECRET_ACCESS_KEY=<güçlü şifre, min 8 karakter>
S3_BUCKET_RAW=shotwise-raw
S3_BUCKET_EXPORTS=shotwise-exports
S3_FORCE_PATH_STYLE=true

# Paddle (sandbox → live geçince PADDLE_ENV=production yap)
PADDLE_ENV=sandbox
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
PADDLE_PRICE_STARTER=pri_xxxx
PADDLE_PRICE_TOPUP=pri_xxxx
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
NEXT_PUBLIC_PADDLE_ENV=sandbox

# Cron (random string, gizli tut)
CRON_SECRET=<openssl rand -hex 16 çıktısı>

# === OPSİYONEL ===

# Google OAuth (boş bırakılırsa Google butonu gizlenir)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Sentry (boş bırakılırsa kapalı)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 9. İlk Deploy

```bash
cd /opt/shotwise

# Image'ı çek (GitHub Actions build etmişse)
docker compose -f infra/docker-compose.prod.yml pull

# Tüm servisleri başlat
docker compose -f infra/docker-compose.prod.yml up -d

# Logları izle (Caddy SSL alana kadar 1-2 dk bekle)
docker compose -f infra/docker-compose.prod.yml logs -f
```

### Database Tablolarını Oluştur

```bash
# app container içinden
docker compose -f infra/docker-compose.prod.yml exec app sh -c "pnpm db:push"
```

veya workstation'dan (DATABASE_URL'i prod'a yönlendir):

```bash
DATABASE_URL="postgres://shotwise:<pw>@<VPS_IP>:5432/shotwise" pnpm db:push
```

---

## 10. Kontrol Listesi

```bash
# Tüm containerlar çalışıyor mu?
docker compose -f infra/docker-compose.prod.yml ps
# → app, postgres, minio, caddy: Up olmalı

# SSL çalışıyor mu?
curl -I https://yourdomain.com
# → HTTP/2 200

# MinIO bucket'ları oluştu mu?
docker compose -f infra/docker-compose.prod.yml logs minio-init
# → "Bucket created" mesajları olmalı
```

### Manuel Test Akışı

1. `https://yourdomain.com` → landing açılıyor
2. `/sign-up` → e-posta gir → magic link geldi → giriş yapıldı
3. Giriş sonrası credit_ledger'da `+5 trial` kaydı var mı: `/credits` → **5 credits** görünmeli
4. `/wizard/new` → 6 adım tamamla → export → ZIP indir
5. `/editor/new` → screenshot yükle → live preview → export
6. Paddle sandbox checkout: `/credits` → Buy Starter Pack → sandbox kartla öde → balance **+100** olmalı

---

## 11. Cron Job Kur

VPS'de host crontab'ı düzenle:

```bash
crontab -e
```

Ekle:

```cron
# Her saat başı: eski export'ları ve raw upload'ları temizle
0 * * * * /opt/shotwise/infra/cron/cleanup-expired.sh >> /var/log/shotwise-cleanup.log 2>&1

# Her ayın 1'i gece yarısı: aktif kullanıcılara +20 kredi
0 0 1 * * /opt/shotwise/infra/cron/monthly-refill.sh >> /var/log/shotwise-refill.log 2>&1
```

Script'lerin içinde `CRON_SECRET` ve `APP_URL` environment variable gerekiyor:

```bash
# /etc/environment dosyasına ekle (ya da scripti düzenle)
echo 'CRON_SECRET=<değerin>' >> /etc/environment
echo 'APP_URL=https://yourdomain.com' >> /etc/environment
source /etc/environment
```

---

## 12. Paddle Live'a Geç

Testler sandbox'ta başarılı olduktan sonra:

1. Paddle Dashboard → sol altta **Live** moduna geç
2. Aynı ürünleri live'da oluştur → yeni price ID'leri al
3. Webhook'u live URL ile tekrar kur
4. `.env` güncelle:

```env
PADDLE_ENV=production
PADDLE_API_KEY=<live key>
PADDLE_WEBHOOK_SECRET=<live webhook secret>
PADDLE_PRICE_STARTER=pri_live_xxxx
PADDLE_PRICE_TOPUP=pri_live_xxxx
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=<live client token>
NEXT_PUBLIC_PADDLE_ENV=production
```

5. Yeniden deploy et:

```bash
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate app
```

---

## 13. Sonraki Deploylar (CI/CD ile)

`main` branch'e push ettiğinde GitHub Actions otomatik:
1. Build eder → Docker image → GHCR'a push eder
2. VPS'e SSH bağlanır → `docker compose pull && up -d`

Manuel deploy gerekirse:

```bash
cd /opt/shotwise
git pull origin main
docker compose -f infra/docker-compose.prod.yml pull
docker compose -f infra/docker-compose.prod.yml up -d --no-deps app
```

---

## 14. Yedek (Önemli)

```bash
# Günlük pg_dump (host crontab'a ekle)
0 3 * * * /opt/shotwise/infra/backup/pg-backup.sh >> /var/log/shotwise-backup.log 2>&1
```

MinIO verileri volume'da, postgres verileri volume'da. VPS snapshot'ı da al (Hetzner dashboard'dan).

---

## Özet Komutlar

```bash
# İlk kurulum
docker compose -f infra/docker-compose.prod.yml up -d
docker compose -f infra/docker-compose.prod.yml exec app sh -c "pnpm db:push"

# Güncelleme
git pull && docker compose -f infra/docker-compose.prod.yml pull && docker compose -f infra/docker-compose.prod.yml up -d --no-deps app

# Log izleme
docker compose -f infra/docker-compose.prod.yml logs -f app

# Restart
docker compose -f infra/docker-compose.prod.yml restart app

# Tamamen kapat
docker compose -f infra/docker-compose.prod.yml down
```
