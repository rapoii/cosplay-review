from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/cosplay-review/public')
plans = {
    'chibi-review-card.webp': ('chibi-review-card.webp', (1200, 1600), 82),
    'lilycosrent-avatar-square.webp': ('lilycosrent-avatar-square.webp', (512, 512), 84),
}

for source_name, (target_name, max_size, quality) in plans.items():
    source = root / source_name
    target = root / target_name
    with Image.open(source) as image:
        image = image.convert('RGB')
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=quality, method=6)
        print({
            'source': source_name,
            'target': target_name,
            'source_bytes': source.stat().st_size,
            'target_bytes': target.stat().st_size,
            'size': image.size,
        })
