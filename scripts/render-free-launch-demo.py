"""Edit actual browser viewport recordings into a captioned 150-second demo.

Input JPEG samples and frames.json live in ignored .runtime/production-launch/
recording-final. Requires locally available Pillow and imageio-ffmpeg. No APIs.
The sample cadence is about 5 fps; the encoded MP4 is 30 fps, with held reading
time at chapter ends. This is an edited browser recording, not hardware footage.
"""
import json
import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.runtime/production-launch/recording-final'
OUT = ROOT / 'production-launch'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SCENES = [
    ('01-homepage', 15, 'CircuitLens: follow the connection, understand the fault.'),
    ('02-linked-views', 15, 'Select D1. Both views follow the same component.'),
    ('03-workbench', 15, 'Open the engineering workspace. Start with a known circuit.'),
    ('04-select-example', 15, 'Choose Reversed polarity. Select the highlighted LED.'),
    ('05-diagnostic-evidence', 20, 'Inspect the schematic and the deterministic rule evidence.'),
    ('06-zoom-selection', 15, 'Zoom, fit, and select components without losing context.'),
    ('07-correct-model', 20, 'Swap A / K. Review the terminals, confirm, and analyze.'),
    ('08-corrected-physical', 20, 'Supported checks pass. Inspect the corrected assembly.'),
    ('09-finish', 15, 'Seven editable examples. No API credits required.'),
]
frames = json.loads((WORK / 'frames.json').read_text())
font = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 27)
small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 19)
timeline = []
elapsed = 0
clips = []


def run(args):
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


for scene, duration, caption in SCENES:
    selected = sorted([f for f in frames if f['scene'] == scene], key=lambda f: f['seconds'])
    assert len(selected) >= 20, f'Insufficient actual browser samples: {scene}'
    entries = []
    for i, sample in enumerate(selected):
        canvas = Image.new('RGB', (1920, 1080), '#182b38')
        image = Image.open(WORK / sample['file']).convert('RGB')
        # The browser capture excludes scrollbar pixels on the homepage.
        assert 1425 <= image.width <= 1440 and 890 <= image.height <= 900, image.size
        canvas.paste(image.resize((1600, 1000), Image.Resampling.LANCZOS), (160, 0))
        draw = ImageDraw.Draw(canvas)
        draw.text((160, 1008), caption, font=font, fill='#ffffff')
        draw.text((160, 1046), 'GENERATED CIRCUIT / DETERMINISTIC ENGINEERING / NO LIVE AI RECOGNITION',
                  font=small, fill='#ccd9df')
        assert draw.textlength(caption, font=font) <= 1600
        output = WORK / f'edited-{scene}-{i:05}.jpg'
        canvas.save(output, quality=94)
        next_time = selected[i + 1]['seconds'] if i + 1 < len(selected) else duration + selected[0]['seconds']
        entries.extend([f"file '{output.name}'", f"duration {max(0.001, next_time - sample['seconds']):.6f}"])
    entries.append(f"file 'edited-{scene}-{len(selected)-1:05}.jpg'")
    concat = WORK / f'{scene}.txt'
    concat.write_text('\n'.join(entries), encoding='utf-8')
    clip = WORK / f'{scene}.mp4'
    run(['-f', 'concat', '-safe', '0', '-i', str(concat), '-vf',
         f'fps=30,fade=t=in:st=0:d=0.2,fade=t=out:st={duration-0.2}:d=0.2',
         '-frames:v', str(duration * 30), '-c:v', 'libx264', '-preset', 'fast',
         '-crf', '18', '-pix_fmt', 'yuv420p', '-an', str(clip)])
    clips.append(clip)
    timeline.append({'start': elapsed, 'end': elapsed + duration, 'caption': caption,
                     'scene': scene, 'actualViewportSamples': len(selected)})
    elapsed += duration
    print(f'{scene}: {len(selected)} actual samples, {duration}s edited chapter', flush=True)

join = WORK / 'clips.txt'
join.write_text('\n'.join(f"file '{c.name}'" for c in clips), encoding='utf-8')
video = OUT / 'CircuitLens_Zero_Cost_Demo.mp4'
run(['-f', 'concat', '-safe', '0', '-i', str(join), '-c', 'copy', '-movflags', '+faststart', str(video)])
(OUT / 'demo-timeline.json').write_text(json.dumps({
    'durationSeconds': elapsed, 'encodedFps': 30, 'resolution': [1920, 1080],
    'narrationIncluded': False, 'source': 'actual browser viewport samples',
    'editing': 'reading holds and 0.2s chapter fades; no fabricated interactions',
    'chapters': timeline,
}, indent=2) + '\n')
print(f'Completed: {video.name}, {elapsed}s', flush=True)
