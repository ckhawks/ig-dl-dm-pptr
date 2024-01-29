import yt_dlp

yt_opts = {
    'outtmpl': 'ig-videos/%(uploader)s%(upload_date)s%(title)s.%(ext)s'
}

ydl = yt_dlp.YoutubeDL(yt_opts)

# print(help(yt_dlp.YoutubeDL))

with open('videoUrls.txt', 'r') as f:
    lines = [line.rstrip('\n') for line in f]
    print(f"{len(lines)} videos to download...")

    for line in lines:
        ydl.download(line)
