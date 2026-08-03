#!/usr/bin/env python3
"""FGF reel profesional — desarrollo, diseño, sitios y apps."""

from __future__ import annotations

import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "fgf-reel.mp4"
FRAMES = ROOT / "_frames"
SHOTS = ROOT / "_screenshots"
W, H = 1280, 720
FPS = 24
DURATION = 24
N = FPS * DURATION

# Paleta premium (sin morado)
BG = (12, 12, 14)
SURFACE = (22, 22, 26)
SURFACE2 = (32, 32, 38)
TEXT = (245, 245, 247)
MUTED = (134, 134, 139)
ACCENT = (61, 214, 195)
ACCENT2 = (6, 182, 212)
LINE = (255, 255, 255, 18)

PROJECTS = [
    ("Desarmaduría FGF", "Sitio · Catálogo · App", SHOTS / "desarmaduria.png", (15, 23, 42), ACCENT2),
    ("Turismo Histórico", "Plataforma + Admin", SHOTS / "turismo.png", (55, 40, 20), (220, 180, 90)),
    ("Agro Fuenzalida", "Marca + Identidad", ROOT.parent / "clientes/agrofuenzalida/ENTREGA-CLIENTE/logo-agro-fuenzalida-final.png", (24, 70, 40), (120, 190, 80)),
    ("Edo Tattoo", "Web Profesional", SHOTS / "edo-tattoo.png", (18, 18, 20), (140, 140, 145)),
]

APPS = [
    ("Creador de Apps", "Webs por rubro al instante"),
    ("Admin Desarmaduría", "Gestión de operación"),
    ("App móvil FGF", "Ventas en el bolsillo"),
]

CODE = [
    "import { createSite, createApp } from '@fgf/core'",
    "",
    "export async function buildForClient(client) {",
    "  const design = await renderUI(client.brand)",
    "  const site = createSite({ design, seo: true })",
    "  const app = createApp({ sync: site.catalog })",
    "  return deploy({ site, app, hosting: 'fgf' })",
    "}",
]

SIDE_SITES = [
    ("Desarmaduría", SHOTS / "desarmaduria.png"),
    ("Turismo", SHOTS / "turismo.png"),
    ("Edo Tattoo", SHOTS / "edo-tattoo.png"),
    ("App Generadora", SHOTS / "app-gen.png"),
    ("Panadería", SHOTS / "panaderia.png"),
    ("Agro Fuenzalida", ROOT.parent / "clientes/agrofuenzalida/ENTREGA-CLIENTE/logo-agro-fuenzalida-final.png"),
]

_SIDE_CACHE: dict[Path, Image.Image] = {}


def font(size: int, bold: bool = False):
    opts = [
        "/usr/share/fonts/TTF/Inter-Bold.ttf" if bold else "/usr/share/fonts/TTF/Inter-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in opts:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ease_out(t: float) -> float:
    return 1 - (1 - ease(t)) ** 2


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def base_frame() -> Image.Image:
    img = Image.new("RGBA", (W, H), BG + (255,))
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(g)
    d.ellipse((W * 0.5, -120, W + 200, H * 0.85), fill=(61, 214, 195, 12))
    d.ellipse((-100, H * 0.3, W * 0.55, H + 100), fill=(6, 182, 212, 8))
    img = Image.alpha_composite(img, g)
    # vignette
    v = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(v)
    vd.rectangle((0, 0, W, H), outline=(0, 0, 0, 80), width=80)
    return Image.alpha_composite(img, v)


def paste_cover(base: Image.Image, img: Image.Image, box: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = box
    tw, th = x1 - x0, y1 - y0
    iw, ih = img.size
    s = max(tw / iw, th / ih)
    nw, nh = int(iw * s), int(ih * s)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    base.paste(img, (x0 + (tw - nw) // 2, y0 + (th - nh) // 2))


def paste_contain(base: Image.Image, img: Image.Image, box: tuple[int, int, int, int], bg: tuple[int, int, int] = (250, 250, 252)) -> None:
    x0, y0, x1, y1 = box
    tw, th = x1 - x0, y1 - y0
    fill = Image.new("RGBA", (tw, th), bg + (255,))
    iw, ih = img.size
    s = min(tw / iw, th / ih)
    nw, nh = max(1, int(iw * s)), max(1, int(ih * s))
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    fill.paste(img, ((tw - nw) // 2, 0))
    base.paste(fill, (x0, y0), fill)


def gradient_rect(size: tuple[int, int], c1: tuple[int, ...], c2: tuple[int, ...]) -> Image.Image:
    w, h = size
    g = Image.new("RGB", (w, h), c1)
    d = ImageDraw.Draw(g)
    for y in range(h):
        t = y / max(h - 1, 1)
        col = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
        d.line([(0, y), (w, y)], fill=col)
    return g


def label(draw: ImageDraw.ImageDraw, x: int, y: int, text: str) -> None:
    draw.text((x, y), text.upper(), fill=ACCENT, font=font(11, True))


def heading(draw: ImageDraw.ImageDraw, x: int, y: int, text: str) -> None:
    draw.text((x, y), text, fill=TEXT, font=font(34, True))


def load_side_image(path: Path) -> Image.Image | None:
    if path in _SIDE_CACHE:
        return _SIDE_CACHE[path]
    if not path.exists():
        return None
    try:
        im = Image.open(path).convert("RGBA")
        _SIDE_CACHE[path] = im
        return im
    except OSError:
        return None


def draw_side_card(
    base: Image.Image,
    x: int,
    y: int,
    w: int,
    h: int,
    title: str,
    shot: Image.Image | None,
    alpha: int,
    float_y: int,
) -> None:
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle((0, 0, w, h), 12, fill=SURFACE + (alpha,), outline=(255, 255, 255, min(40, alpha // 4)))
    d.rectangle((0, 0, w, 28), fill=SURFACE2 + (alpha,))
    for i, c in enumerate([(255, 95, 87), (255, 189, 46), (40, 201, 99)]):
        d.ellipse((10 + i * 14, 8, 20 + i * 14, 18), fill=c + (alpha,))
    thumb = (8, 32, w - 8, h - 34)
    tw, th = thumb[2] - thumb[0], thumb[3] - thumb[1]
    if shot:
        preview = Image.new("RGBA", (tw, th), (14, 14, 18, alpha))
        paste_contain(preview, shot.copy(), (0, 0, tw, th))
        card.alpha_composite(preview, (thumb[0], thumb[1]))
    else:
        d.rounded_rectangle((thumb[0], thumb[1], thumb[2], thumb[3]), 8, fill=(20, 20, 24, alpha))
    d.text((12, h - 22), title, fill=TEXT + (alpha,), font=font(10, True))
    base.alpha_composite(card, (x, y + float_y))


def apply_side_gallery(img: Image.Image, sec: float) -> Image.Image:
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    strength = ease(min(1, max(0, (sec - 1.2) / 1.5))) if sec < 21 else ease(max(0, 1 - (sec - 21) / 2))
    if strength <= 0:
        return img
    alpha = int(220 * strength)
    cw, ch = 168, 118
    slots = [
        (18, 130, 0),
        (18, 270, 1),
        (18, 410, 2),
        (W - 18 - cw, 130, 3),
        (W - 18 - cw, 270, 4),
        (W - 18 - cw, 410, 5),
    ]
    shift = int(sec / 2.8) % len(SIDE_SITES)
    for sx, sy, slot in slots:
        idx = (shift + slot) % len(SIDE_SITES)
        name, path = SIDE_SITES[idx]
        shot = load_side_image(path)
        fy = int(math.sin(sec * 1.4 + slot * 0.9) * 5)
        draw_side_card(img, sx, sy, cw, ch, name, shot, alpha, fy)
    return img


def finish_scene(img: Image.Image, sec: float) -> Image.Image:
    if img.mode == "RGB":
        img = img.convert("RGBA")
    return apply_side_gallery(img, sec)


def scene_open(t: float) -> Image.Image:
    img = base_frame()
    draw = ImageDraw.Draw(img)
    p = ease_out(t)
    alpha = int(255 * p)
    title = "FGF Digital"
    sub = "Desarrollo web y aplicaciones · Chile"
    tw = draw.textlength(title, font=font(48, True))
    sw = draw.textlength(sub, font=font(18))
    draw.text((W / 2 - tw / 2, H * 0.38), title, fill=TEXT + (alpha,), font=font(48, True))
    draw.text((W / 2 - sw / 2, H * 0.38 + 58), sub, fill=MUTED + (alpha,), font=font(18))
    lw = int(120 * p)
    draw.line([(W / 2 - lw / 2, H * 0.38 + 96), (W / 2 + lw / 2, H * 0.38 + 96)], fill=ACCENT + (alpha,), width=2)
    return img


def draw_monitor(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, 14, fill=SURFACE + (255,), outline=(255, 255, 255, 25))
    draw.rectangle((x0, y0, x1, y0 + 36), fill=SURFACE2 + (255,))
    for i, c in enumerate([(255, 95, 87), (255, 189, 46), (40, 201, 99)]):
        draw.ellipse((x0 + 14 + i * 18, y0 + 11, x0 + 26 + i * 18, y0 + 23), fill=c)
    draw.text((x0 + 72, y0 + 9), title, fill=MUTED, font=font(12))


def scene_dev(t: float) -> Image.Image:
    img = base_frame()
    draw = ImageDraw.Draw(img)
    label(draw, 220, 64, "01 · Desarrollo")
    heading(draw, 220, 88, "Código limpio. Producto real.")

    mon1 = (220, 160, 580, 500)
    mon2 = (620, 200, 1060, 540)
    draw_monitor(draw, mon1, "fgf-client — index.tsx")
    draw_monitor(draw, mon2, "terminal — deploy")

    # editor content
    inner = (mon1[0] + 10, mon1[1] + 42, mon1[2] - 10, mon1[3] - 10)
    ed = Image.new("RGBA", (inner[2] - inner[0], inner[3] - inner[1]), (14, 14, 18, 255))
    edd = ImageDraw.Draw(ed)
    fy = 12
    visible = int(t * 14)
    mono = font(13)
    colors = {
        "k": (198, 120, 221),
        "s": (152, 195, 121),
        "f": (97, 175, 239),
        "d": TEXT,
        "c": (92, 99, 112),
    }
    for i, line in enumerate(CODE):
        if i > visible:
            break
        if line.startswith("import"):
            col = colors["k"]
        elif line.startswith("export") or "async" in line:
            col = colors["k"]
        elif "await" in line or "return" in line:
            col = colors["k"]
        elif "create" in line or "deploy" in line:
            col = colors["f"]
        elif line.startswith("  const") or line.startswith("  return"):
            col = colors["d"]
        elif line.startswith("}"):
            col = colors["d"]
        else:
            col = colors["c"]
        edd.text((14, fy + i * 22), line, fill=col, font=mono)
    if int(t * 12) % 2 == 0:
        ln = min(visible, len(CODE) - 1)
        cx = 14 + edd.textlength(CODE[ln], font=mono)
        edd.rectangle((cx, fy + ln * 22 + 2, cx + 7, fy + ln * 22 + 18), fill=ACCENT)
    img.paste(ed, (inner[0], inner[1]))

    # terminal panel
    tin = (mon2[0] + 10, mon2[1] + 42, mon2[2] - 10, mon2[3] - 10)
    term = Image.new("RGBA", (tin[2] - tin[0], tin[3] - tin[1]), (10, 10, 12, 255))
    td = ImageDraw.Draw(term)
    logs = [
        "$ npm run build",
        "✓ diseño compilado",
        "✓ sitio optimizado",
        "✓ app empaquetada",
        "→ deploy fgfdigital.cl",
    ]
    for i, ln in enumerate(logs):
        if i > int(t * 8):
            break
        col = ACCENT if ln.startswith("✓") or ln.startswith("→") else MUTED
        td.text((14, 14 + i * 26), ln, fill=col, font=font(14))
    img.paste(term, (tin[0], tin[1]))

    # silueta sutil
    draw.rounded_rectangle((280, 530, 420, 620), 20, fill=(18, 18, 22, 200))
    draw.ellipse((320, 540, 380, 590), fill=(28, 28, 32))
    draw.text((300, 598), "Dev FGF", fill=MUTED, font=font(11))
    return img


def scene_design(t: float) -> Image.Image:
    img = base_frame()
    draw = ImageDraw.Draw(img)
    label(draw, 220, 64, "02 · Diseño")
    heading(draw, 220, 88, "Interfaces claras para cada rubro.")
    p = ease(min(1, t * 0.85))

    board = (220, 150, W - 220, H - 80)
    draw.rounded_rectangle(board, 20, fill=SURFACE + (255,), outline=(255, 255, 255, 20))

    # artboard
    ab = (board[0] + 40, board[1] + 40, board[0] + 520, board[3] - 40)
    draw.rounded_rectangle(ab, 12, fill=(16, 16, 20, 255), outline=(61, 214, 195, 40))

    nav_h = int(44 * ease(p / 0.25)) if p > 0 else 0
    if nav_h:
        draw.rounded_rectangle((ab[0] + 20, ab[1] + 20, ab[2] - 20, ab[1] + 20 + nav_h), 8, fill=SURFACE2 + (255,))
    if p > 0.2:
        h1 = int(36 * ease((p - 0.2) / 0.3))
        draw.rounded_rectangle((ab[0] + 20, ab[1] + 80, ab[0] + 280, ab[1] + 80 + h1), 6, fill=(255, 255, 255, 20))
    if p > 0.35:
        h2 = int(180 * ease((p - 0.35) / 0.35))
        draw.rounded_rectangle((ab[0] + 20, ab[1] + 130, ab[2] - 20, ab[1] + 130 + h2), 10, fill=(255, 255, 255, 14))
    if p > 0.55:
        for i in range(3):
            w = int(130 * ease((p - 0.55) / 0.45))
            draw.rounded_rectangle((ab[0] + 20 + i * 150, ab[3] - 120, ab[0] + 20 + i * 150 + w, ab[3] - 30), 8, fill=(61, 214, 195, 30))

    # panel propiedades
    props = (board[0] + 560, board[1] + 40, board[2] - 40, board[3] - 40)
    draw.rounded_rectangle(props, 12, fill=(16, 16, 20, 255), outline=(255, 255, 255, 15))
    draw.text((props[0] + 20, props[1] + 20), "Componentes", fill=TEXT, font=font(14, True))
    items = ["Tipografía", "Color", "Layout", "Mobile"]
    for i, it in enumerate(items):
        if p > 0.15 + i * 0.12:
            draw.rounded_rectangle((props[0] + 20, props[1] + 56 + i * 44, props[2] - 20, props[1] + 88 + i * 44), 8, fill=SURFACE2 + (255,))
            draw.text((props[0] + 32, props[1] + 68 + i * 44), it, fill=MUTED, font=font(13))
    return img


def scene_site(t: float, idx: int, blend: float) -> Image.Image:
    name, tag, path, c1, c2 = PROJECTS[idx % len(PROJECTS)]
    img = base_frame()
    draw = ImageDraw.Draw(img)
    label(draw, 220, 64, "03 · Sitios en línea")
    heading(draw, 220, 88, "Publicados y listos para vender.")

    slide = ease(blend)
    bx = int(lerp(220, 200, slide))
    browser = (bx, 150, W - 200, H - 70)
    draw.rounded_rectangle(browser, 18, fill=SURFACE + (255,), outline=(255, 255, 255, 22))
    draw.rectangle((browser[0], browser[1], browser[2], browser[1] + 40), fill=SURFACE2 + (255,))
    for i, c in enumerate([(255, 95, 87), (255, 189, 46), (40, 201, 99)]):
        draw.ellipse((browser[0] + 16 + i * 20, browser[1] + 12, browser[0] + 28 + i * 20, browser[1] + 24), fill=c)
    url = name.lower().replace(" ", "-") + ".cl"
    draw.text((browser[0] + 80, browser[1] + 10), url, fill=MUTED, font=font(13))

    view = (browser[0] + 8, browser[1] + 48, browser[2] - 8, browser[3] - 8)
    vw, vh = view[2] - view[0], view[3] - view[1]
    shot = gradient_rect((vw, vh), c1[:3] if len(c1) == 3 else c1, c2[:3] if len(c2) == 3 else c2)
    if path and path.exists():
        try:
            paste_contain(shot, Image.open(path).convert("RGB"), (0, 0, vw, vh), (14, 14, 18))
        except OSError:
            pass
    # overlay suave
    ov = Image.new("RGBA", (vw, vh), (0, 0, 0, 0))
    ImageDraw.Draw(ov).rectangle((0, vh - 100, vw, vh), fill=(0, 0, 0, 120))
    shot = Image.alpha_composite(shot.convert("RGBA"), ov).convert("RGB")
    img.paste(shot, (view[0], view[1]))

    sd = ImageDraw.Draw(img)
    sd.text((view[0] + 24, view[3] - 72), tag, fill=ACCENT, font=font(13, True))
    sd.text((view[0] + 24, view[3] - 48), name, fill=TEXT, font=font(26, True))
    return img


def scene_apps(t: float) -> Image.Image:
    img = base_frame()
    draw = ImageDraw.Draw(img)
    label(draw, 220, 64, "04 · Aplicaciones")
    heading(draw, 220, 88, "Herramientas que operan tu negocio.")
    p = ease(min(1, t * 0.9))

    for i, (title, sub) in enumerate(APPS):
        r = ease(max(0, min(1, (p - i * 0.12) / 0.75)))
        if r <= 0:
            continue
        cx = 250 + i * 250
        cy = 200 + int((1 - r) * 30)
        pw, ph = 240, 460
        # sombra
        draw.rounded_rectangle((cx + 8, cy + 12, cx + pw + 8, cy + ph + 12), 36, fill=(0, 0, 0, 80))
        draw.rounded_rectangle((cx, cy, cx + pw, cy + ph), 36, fill=(18, 18, 22, 255), outline=(255, 255, 255, 25))
        draw.rounded_rectangle((cx + 8, cy + 8, cx + pw - 8, cy + ph - 8), 32, fill=(10, 10, 12, 255))
        draw.rounded_rectangle((cx + 24, cy + 48, cx + pw - 24, cy + 160), 14, fill=(61, 214, 195, 35))
        draw.rounded_rectangle((cx + 24, cy + 180, cx + pw - 24, cy + 220), 8, fill=(255, 255, 255, 16))
        draw.rounded_rectangle((cx + 24, cy + 236, cx + pw - 24, cy + 276), 8, fill=(255, 255, 255, 10))
        draw.text((cx + 24, cy + 310), title, fill=TEXT, font=font(17, True))
        draw.text((cx + 24, cy + 340), sub, fill=MUTED, font=font(13))
    return img


def scene_outro(t: float) -> Image.Image:
    img = base_frame()
    draw = ImageDraw.Draw(img)
    p = ease_out(t)
    lines = [
        ("No te dejamos solo.", font(38, True), TEXT),
        ("Web · Apps · Hosting FGF · Talagante", font(17), MUTED),
    ]
    y = H * 0.40
    for text, f, col in lines:
        tw = draw.textlength(text, font=f)
        draw.text((W / 2 - tw / 2, y), text, fill=col, font=f)
        y += 52
    bw = int(200 * p)
    draw.rounded_rectangle((W / 2 - bw / 2, H * 0.68, W / 2 + bw / 2, H * 0.68 + 44), 10, fill=ACCENT if p > 0.5 else SURFACE2)
    if p > 0.5:
        draw.text((W / 2 - 68, H * 0.68 + 11), "fgfdigital.cl", fill=BG, font=font(15, True))
    return img


def blend_frames(a: Image.Image, b: Image.Image, t: float) -> Image.Image:
    t = ease(t)
    return Image.blend(a, b, t)


def raw_scene(sec: float) -> Image.Image:
    if sec < 3.5:
        return scene_open(sec / 3.5)
    if sec < 8.5:
        return scene_dev(sec - 3.5)
    if sec < 12.5:
        return scene_design(sec - 8.5)
    if sec < 18.5:
        block = sec - 12.5
        idx = int(block / 1.5)
        local = (block % 1.5) / 1.5
        return scene_site(sec, idx, min(1, local * 1.4))
    if sec < 21.5:
        return scene_apps(sec - 18.5)
    return scene_outro(sec - 21.5)


def frame_at(i: int) -> Image.Image:
    sec = i / FPS
    frame = raw_scene(sec)
    fade = 0.4
    boundaries = [3.5, 8.5, 12.5, 18.5, 21.5]
    for b in boundaries:
        if b - fade <= sec < b:
            t = (sec - (b - fade)) / fade
            prev = raw_scene(b - fade - 0.04)
            nxt = raw_scene(b + 0.04)
            frame = blend_frames(prev, nxt, t)
            break
    frame = finish_scene(frame, sec)
    return frame.convert("RGB")


def main() -> None:
    FRAMES.mkdir(exist_ok=True)
    for old in FRAMES.glob("*.png"):
        old.unlink()
    print(f"Generando {N} frames (reel profesional)…")
    for i in range(N):
        frame_at(i).save(FRAMES / f"frame_{i:04d}.png", quality=95)
        if i % 48 == 0:
            print(f"  {i}/{N}")
    subprocess.run(
        ["ffmpeg", "-y", "-framerate", str(FPS), "-i", str(FRAMES / "frame_%04d.png"),
         "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT)],
        check=True,
    )
    print(f"Listo: {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
