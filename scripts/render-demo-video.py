"""Create a 2:45 captioned film from verified browser captures.

Requires Python 3, Pillow, and imageio-ffmpeg. No browser automation is used.
Intermediate files stay in .runtime/demo-video; final media stays in submission.
"""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'submission/cinematic-demo'
SHOTS = ROOT / 'submission/screenshots-cinematic/final'
WORK = ROOT / '.runtime/demo-video'
WORK.mkdir(parents=True, exist_ok=True)
SCENES = json.loads((OUT / 'video-scenes.json').read_text(encoding='utf-8-sig'))
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
FONT = 'C:/Windows/Fonts/segoeui.ttf'
BOLD = 'C:/Windows/Fonts/segoeuib.ttf'
W, H, FPS = 1920, 1080, 30


def run(args):
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


def text(draw, xy, value, size, color='#eeeae1', bold=False, width=1792):
    font = ImageFont.truetype(BOLD if bold else FONT, size)
    lines = []
    for paragraph in value.split('\n'):
        line = ''
        for word in paragraph.split():
            candidate = (line + ' ' + word).strip()
            if draw.textlength(candidate, font=font) > width and line:
                lines.append(line)
                line = word
            else:
                line = candidate
        lines.append(line)
    for j, line in enumerate(lines):
        assert draw.textlength(line, font=font) <= width, line
        draw.text((xy[0], xy[1]+j*(size+12)), line, font=font, fill=color)
    return len(lines)*(size+12)


def stamp(seconds, srt=False):
    if srt:
        ms = round(seconds*1000)
        return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
    return f'{int(seconds)//60}:{int(seconds)%60:02}'


elapsed, subtitles, timeline = 0, [], []
for i, scene in enumerate(SCENES):
    canvas = Image.new('RGB', (W,H), '#111210')
    draw = ImageDraw.Draw(canvas)
    original = Image.open(SHOTS / scene['image']).convert('RGB')
    if scene.get('kind') in ('opening', 'closing'):
        # Editorial split composition. The actual circuit artwork is cropped
        # from the verified hero; it is never presented as hardware footage.
        panel = original.crop((900,170,1870,950))
        panel = ImageOps.contain(panel, (1020,830), Image.Resampling.LANCZOS)
        canvas.paste(panel, (850+(1020-panel.width)//2, 130+(830-panel.height)//2))
        text(draw,(70,65),'CircuitLens',36,bold=True)
        text(draw,(70,245),scene['title'],64,bold=True,width=740)
        text(draw,(72,665),scene['caption'],29,width=650,color='#bcb6aa')
        text(draw,(72,975),scene['label'],18,color='#e7b477')
    else:
        text(draw,(64,25),scene['title'],34,bold=True)
        text(draw,(64,78),scene['label'],17,color='#e7b477')
        shot = original.crop(tuple(scene['crop'])) if 'crop' in scene else original
        shot = ImageOps.contain(shot, (1788,818), Image.Resampling.LANCZOS)
        draw.rectangle((63,121,1857,944),fill='#171816',outline='#393631',width=1)
        canvas.paste(shot,(64+(1792-shot.width)//2,122+(820-shot.height)//2))
        text(draw,(64,972),scene['caption'],28,width=1760)
    draw.line((64,1050,1856,1050),fill='#393631',width=2)
    draw.line((64,1050,64+int(1792*(elapsed+scene['duration'])/165),1050),fill='#c9a46d',width=2)
    frame = WORK / f'{i:02}.png'
    canvas.save(frame)
    duration=scene['duration']
    frames=duration*FPS
    # A 1% slow push stays inside the editorial safe margins; UI edges remain.
    vf=(f"zoompan=z='1+0.01*on/{frames}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps={FPS},"
        f"fade=t=in:st=0:d=0.3,fade=t=out:st={duration-0.3}:d=0.3,format=yuv420p")
    run(['-loop','1','-framerate',str(FPS),'-i',str(frame),'-vf',vf,'-frames:v',str(frames),
         '-c:v','libx264','-preset','fast','-crf','18','-an',str(WORK/f'{i:02}.mp4')])
    subtitles.append(f"{i+1}\n{stamp(elapsed,True)} --> {stamp(elapsed+duration,True)}\n{scene['title'].replace(chr(10),' ')}\n{scene['caption']}\n")
    timeline.append(f"| {stamp(elapsed)}–{stamp(elapsed+duration)} | {scene['image']} | {scene['title'].replace(chr(10),' ')} |")
    elapsed+=duration
    print(f'Rendered {i+1}/{len(SCENES)}',flush=True)

srt=OUT/'final-video-captions.srt'
srt.write_text('\n'.join(subtitles),encoding='utf-8')
concat=WORK/'concat.txt'
concat.write_text('\n'.join(f"file '{i:02}.mp4'" for i in range(len(SCENES))),encoding='utf-8')
run(['-f','concat','-safe','0','-i',str(concat),'-i',str(srt),'-map','0:v:0','-map','1:0',
     '-c:v','copy','-c:s','mov_text','-metadata:s:s:0','language=eng','-movflags','+faststart',str(OUT/'CircuitLens_Demo.mp4')])
(OUT/'final-video-timeline.md').write_text('# Final video timeline\n\nDuration: 2:45.000. 1920 × 1080, 30 fps. Captioned screenshot film; no narration.\n\n| Time | Actual capture | Beat |\n| --- | --- | --- |\n'+'\n'.join(timeline)+'\n',encoding='utf-8')
(OUT/'final-video-script.md').write_text('# Final on-screen script\n\nThe final film uses captions, not synthetic narration. All product states come from the final browser captures.\n\n'+'\n\n'.join(f"{i+1}. **{s['title'].replace(chr(10),' ')}**\n\n   {s['caption']}\n\n   Disclosure: {s['label']}" for i,s in enumerate(SCENES))+'\n',encoding='utf-8')
print(f'Exported {elapsed:.3f}s, 1920x1080, {FPS} fps, no narration.')
