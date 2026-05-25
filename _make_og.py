from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
img = Image.new('RGB', (W, H), '#f5f4f0')
d = ImageDraw.Draw(img)

# franja superior gradiente magenta
for y in range(0, 8):
    d.rectangle([(0,y),(W,y+1)], fill='#FF1493')

# franja decorativa de colores (paleta del cohort)
colors = ['#FF1493','#FFD60A','#A8FF00','#00B8C4','#BF00FF']
stripe_h = 6
for i, c in enumerate(colors):
    x = 80 + i*30
    d.rectangle([(x, 70),(x+22, 70+stripe_h)], fill=c)

# avatares circulares
avatars = [
    ('A', '#FF1493'),
    ('C', '#00B8C4'),
    ('E', '#FFD60A'),
    ('C', '#BF00FF'),
    ('A', '#A8FF00'),
]
ax = 80
ay = 470
size = 84
gap = 24

try:
    font_big = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 96)
    font_sub = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 32)
    font_eyebrow = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
    font_av = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 38)
    font_foot = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 24)
except Exception:
    font_big = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_eyebrow = ImageFont.load_default()
    font_av = ImageFont.load_default()
    font_foot = ImageFont.load_default()

# eyebrow
d.text((80, 110), 'ALMUERCITO  TECH', fill='#FF1493', font=font_eyebrow)

# título
d.text((80, 160), 'Cinco profesionales,', fill='#111', font=font_big)
d.text((80, 270), 'una meta a la semana.', fill='#111', font=font_big)

# subtítulo
d.text((80, 400), 'Tracker semanal del cohort 4', fill='#555', font=font_sub)

# avatares
for i, (letter, color) in enumerate(avatars):
    x = ax + i*(size+gap)
    d.ellipse([(x, ay),(x+size, ay+size)], fill=color)
    # centrar letra
    bbox = d.textbbox((0,0), letter, font=font_av)
    tw = bbox[2]-bbox[0]; th = bbox[3]-bbox[1]
    d.text((x + (size-tw)/2 - bbox[0], ay + (size-th)/2 - bbox[1]), letter, fill='#fff', font=font_av)

# plantita y dominio
d.text((80, 580), 'almuercito-tech', fill='#555', font=font_foot)

# emoji-ish plantita en esquina derecha
d.text((W-160, 550), '🌳', fill='#A8FF00', font=ImageFont.truetype('C:/Windows/Fonts/seguiemj.ttf', 72) if os.path.exists('C:/Windows/Fonts/seguiemj.ttf') else font_big)

img.save('og.png', 'PNG', optimize=True)
print('OK', os.path.getsize('og.png'))
