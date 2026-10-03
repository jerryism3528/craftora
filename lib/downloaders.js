// Every downloader page on download.craftora.dev is built from this list.
// live: true = working download box. live: false = full SEO page with a "Soon" notice.

export const DL_BASE = 'https://download.' + 'craftora.dev';

export const downloaders = [
  {
    slug: 'tiktok-downloader', platform: 'tiktok', live: true, mode: 'video',
    name: 'TikTok Downloader', brand: 'TikTok', color: '#111111', icon: null, badge: 'TT',
    short: 'Save TikTok videos in HD MP4, no watermark.',
    title: 'TikTok Downloader: Download TikTok Videos Without Watermark (HD MP4)',
    description: 'Free TikTok downloader. Save TikTok videos without watermark in HD MP4, straight from the link. No app, no login, works on iPhone, Android, and PC. Fast and unlimited daily use.',
    keywords: ['tiktok downloader', 'tiktok video downloader', 'download tiktok video', 'tiktok downloader no watermark', 'tiktok without watermark', 'save tiktok video', 'tiktok mp4 download', 'snaptik alternative', 'ssstik alternative', 'tiktok video download hd', 'download tiktok on iphone', 'download tiktok on android', 'tiktok saver', 'tik tok downloader online'],
    faqs: [
      ['How do I download a TikTok video without watermark?', 'Open the video in TikTok, tap Share, then Copy link. Paste the link into the box above and click Download. The video is saved as an MP4 without the TikTok watermark whenever TikTok provides a clean version.'],
      ['Can I download TikTok videos on iPhone?', 'Yes. Copy the TikTok link, open this page in Safari, paste it, and tap Download. The video saves to your Files app, and from there you can save it to Photos.'],
      ['Does it work for TikTok slideshows and photo posts?', 'Video posts work best. Photo slideshows are supported when TikTok provides them as a video; if not, the download may contain only the audio.'],
      ['Can I download private TikTok videos?', 'No. Only public videos can be downloaded. Private videos and videos from private accounts are not accessible.'],
      ['Is this a SnapTik or SSSTik alternative?', 'Yes. It works the same way: paste a TikTok link and download the video in HD, without installing anything.'],
    ],
  },
  {
    slug: 'tiktok-to-mp3', platform: 'tiktok', live: true, mode: 'audio',
    name: 'TikTok to MP3', brand: 'TikTok', color: '#111111', icon: null, badge: 'TT',
    short: 'Extract the sound or song from any TikTok as MP3.',
    title: 'TikTok to MP3: Download TikTok Audio and Sounds as MP3',
    description: 'Free TikTok to MP3 converter. Extract the audio, song, or sound from any TikTok video and save it as a high-quality MP3. Just paste the link, no app or login needed.',
    keywords: ['tiktok to mp3', 'tiktok mp3 download', 'tiktok audio downloader', 'download tiktok sound', 'tiktok song download', 'tiktok to audio', 'save tiktok audio', 'tiktok music downloader', 'convert tiktok to mp3', 'tiktok sound downloader'],
    faqs: [
      ['How do I download the audio from a TikTok?', 'Copy the TikTok video link, paste it above, and click Download MP3. The audio track is extracted and saved as a 192 kbps MP3.'],
      ['Can I download a TikTok sound or song?', 'Yes. Use the link of any public video that uses the sound, and the audio from that video is saved as an MP3.'],
      ['What quality is the MP3?', 'Audio is saved at 192 kbps, which sounds great for music and voice. The final quality also depends on the original upload.'],
      ['Can I use the MP3 as a ringtone?', 'Yes, for personal use. Save the MP3 and set it as a ringtone in your phone settings.'],
    ],
  },
  {
    slug: 'instagram-reels-downloader', platform: 'instagram', live: true, mode: 'video',
    name: 'Instagram Reels Downloader', brand: 'Instagram', color: '#E1306C', icon: 'Instagram', badge: 'IG',
    short: 'Download Instagram Reels in HD MP4.',
    title: 'Instagram Reels Downloader: Download IG Reels in HD MP4 Free',
    description: 'Free Instagram Reels downloader. Save Instagram Reels in HD MP4 with sound, just by pasting the link. No login, no app. Works on iPhone, Android, and desktop.',
    keywords: ['instagram reels downloader', 'reels downloader', 'download instagram reels', 'ig reels download', 'instagram reel download hd', 'save instagram reels', 'reels video download', 'instagram reels to mp4', 'snapinsta alternative', 'download reels without app', 'instagram reels saver', 'insta reels downloader'],
    faqs: [
      ['How do I download an Instagram Reel?', 'In Instagram, tap the three dots or the share icon on the Reel, choose Copy link, paste it into the box above, and click Download. The Reel saves as an MP4 with sound.'],
      ['Do I need to log in to Instagram?', 'No. Public Reels download without any login. You never enter your Instagram password here.'],
      ['Can I download Reels from private accounts?', 'No. Only Reels from public accounts can be downloaded.'],
      ['Is the Reel saved with audio?', 'Yes. Reels are saved as MP4 files with their original audio.'],
      ['Is this a SnapInsta alternative?', 'Yes. Paste the Reel link and download it in HD, with no extensions or apps required.'],
    ],
  },
  {
    slug: 'instagram-video-downloader', platform: 'instagram', live: true, mode: 'video',
    name: 'Instagram Video Downloader', brand: 'Instagram', color: '#E1306C', icon: 'Instagram', badge: 'IG',
    short: 'Save Instagram videos and IGTV from any public post.',
    title: 'Instagram Video Downloader: Save IG Videos in HD Online',
    description: 'Free Instagram video downloader. Download videos from public Instagram posts, Reels, and IGTV in HD MP4 by pasting the link. Fast, no login, no app needed.',
    keywords: ['instagram video downloader', 'download instagram video', 'ig video downloader', 'instagram downloader', 'save instagram video', 'insta video download', 'igtv downloader', 'instagram post video download', 'instagram mp4 download', 'instagram downloader online'],
    faqs: [
      ['How do I download a video from Instagram?', 'Copy the link of the Instagram post (Share, then Copy link), paste it above, and click Download. The video is saved as an HD MP4.'],
      ['Does it work for IGTV and long videos?', 'Yes. Public IGTV videos and longer posts download the same way, up to 60 minutes long.'],
      ['Can I download Instagram videos to my phone?', 'Yes. Open this page in your phone browser, paste the link, and download. On iPhone the file goes to the Files app, on Android to your Downloads folder.'],
      ['Can I download Instagram Stories?', 'Stories usually require a login to view, so they are not supported right now. Public posts and Reels work.'],
    ],
  },
  {
    slug: 'facebook-video-downloader', platform: 'facebook', live: true, mode: 'video',
    name: 'Facebook Video Downloader', brand: 'Facebook', color: '#1877F2', icon: 'Facebook', badge: 'FB',
    short: 'Download Facebook videos and Reels in HD.',
    title: 'Facebook Video Downloader: Download FB Videos and Reels in HD',
    description: 'Free Facebook video downloader. Save public Facebook videos, Reels, and Watch videos in HD MP4 by pasting the link. Works with share links. No login or app required.',
    keywords: ['facebook video downloader', 'fb video downloader', 'download facebook video', 'facebook reels downloader', 'fb reels download', 'save facebook video', 'facebook video download hd', 'facebook watch downloader', 'fb downloader', 'facebook to mp4', 'fdown alternative'],
    faqs: [
      ['How do I download a Facebook video?', 'On the video, tap Share, then Copy link. Paste the link above and click Download. Both normal links and short share links work.'],
      ['Can I download Facebook Reels?', 'Yes. Public Facebook Reels download in HD the same way as regular videos.'],
      ['Can I download videos from private groups or profiles?', 'No. Only public videos are accessible. Videos shared to private groups or friends-only cannot be downloaded.'],
      ['What quality will I get?', 'You can choose from the qualities Facebook offers for that video, usually up to HD 720p or 1080p.'],
    ],
  },
  {
    slug: 'twitter-video-downloader', platform: 'x', live: true, mode: 'video',
    name: 'Twitter (X) Video Downloader', brand: 'X', color: '#111111', icon: 'Twitter', badge: 'X',
    short: 'Save videos and GIFs from X (Twitter) posts.',
    title: 'Twitter Video Downloader: Download X Videos and GIFs in HD',
    description: 'Free Twitter (X) video downloader. Save videos and GIFs from any public X post in HD MP4 by pasting the link. Fast, no login, works on mobile and desktop.',
    keywords: ['twitter video downloader', 'x video downloader', 'download twitter video', 'download x video', 'twitter gif downloader', 'save twitter video', 'twitter to mp4', 'x.com video download', 'twitter video download hd', 'tweet video downloader', 'twitter downloader online'],
    faqs: [
      ['How do I download a video from X (Twitter)?', 'Open the post, tap Share, then Copy link. Paste the link above and click Download. The video saves as an MP4 in the best quality available.'],
      ['Can I download Twitter GIFs?', 'Yes. GIFs on X are actually short videos, so they download as MP4 files that play everywhere.'],
      ['Does it work with x.com and twitter.com links?', 'Yes. Both x.com and twitter.com links are supported.'],
      ['Can I download videos from protected accounts?', 'No. Only posts from public accounts can be downloaded.'],
    ],
  },
  {
    slug: 'dailymotion-downloader', platform: 'dailymotion', live: true, mode: 'video',
    name: 'Dailymotion Downloader', brand: 'Dailymotion', color: '#0066DC', icon: null, badge: 'DM',
    short: 'Download Dailymotion videos in HD MP4.',
    title: 'Dailymotion Downloader: Download Dailymotion Videos in HD MP4',
    description: 'Free Dailymotion video downloader. Save Dailymotion videos in HD MP4 or extract the audio as MP3, just by pasting the link. No software or login needed.',
    keywords: ['dailymotion downloader', 'dailymotion video downloader', 'download dailymotion video', 'dailymotion to mp4', 'dailymotion to mp3', 'save dailymotion video', 'dailymotion hd download', 'dai.ly downloader'],
    faqs: [
      ['How do I download a Dailymotion video?', 'Copy the video link (or a short dai.ly link), paste it above, choose a quality, and click Download.'],
      ['Can I save just the audio?', 'Yes. Choose MP3 to extract only the audio track.'],
      ['How long can the video be?', 'Videos up to 60 minutes and 500 MB are supported.'],
    ],
  },

  // ---- Coming soon: full SEO pages, download disabled ----
  {
    slug: 'youtube-video-downloader', platform: 'youtube', live: false, mode: 'video',
    name: 'YouTube Video Downloader', brand: 'YouTube', color: '#FF0000', icon: 'Youtube', badge: 'YT',
    short: 'Download YouTube videos in HD MP4.',
    title: 'YouTube Video Downloader: Download YouTube Videos in HD MP4 Free',
    description: 'Free YouTube video downloader. Save YouTube videos in 1080p, 720p, and more as MP4, straight from the link. No software or extension needed. Coming soon to Craftora.',
    keywords: ['youtube video downloader', 'youtube downloader', 'download youtube video', 'youtube to mp4', 'yt downloader', 'save youtube video', 'youtube video download hd', 'youtube 1080p download', 'y2mate alternative', 'savefrom alternative', 'download youtube video online free'],
    faqs: [
      ['When will the YouTube downloader be available?', 'It is coming soon. Meanwhile, you can download from TikTok, Instagram, Facebook, X, and Dailymotion with Craftora right now.'],
      ['Which qualities will be supported?', 'MP4 in qualities up to 1080p, plus audio-only MP3.'],
      ['Will it work on mobile?', 'Yes. Like all Craftora downloaders, it will work in any phone or desktop browser with no app.'],
    ],
  },
  {
    slug: 'youtube-to-mp3', platform: 'youtube', live: false, mode: 'audio',
    name: 'YouTube to MP3', brand: 'YouTube', color: '#FF0000', icon: 'Youtube', badge: 'YT',
    short: 'Convert YouTube videos to MP3 audio.',
    title: 'YouTube to MP3 Converter: Download YouTube Audio as MP3 Free',
    description: 'Free YouTube to MP3 converter. Turn YouTube videos into high-quality MP3 audio by pasting the link. No software needed. Coming soon to Craftora.',
    keywords: ['youtube to mp3', 'youtube mp3 converter', 'yt to mp3', 'youtube to mp3 converter free', 'download youtube audio', 'youtube music to mp3', 'convert youtube to mp3', 'ytmp3 alternative', 'youtube audio downloader', 'youtube to mp3 320kbps'],
    faqs: [
      ['When will YouTube to MP3 be available?', 'It is coming soon. In the meantime, you can convert videos you already have to MP3 with the Craftora Video to MP3 tool.'],
      ['What audio quality will it offer?', 'High-quality MP3, with options up to 320 kbps.'],
    ],
  },
  {
    slug: 'youtube-shorts-downloader', platform: 'youtube', live: false, mode: 'video',
    name: 'YouTube Shorts Downloader', brand: 'YouTube', color: '#FF0000', icon: 'Youtube', badge: 'YT',
    short: 'Save YouTube Shorts in HD.',
    title: 'YouTube Shorts Downloader: Download Shorts in HD MP4 Free',
    description: 'Free YouTube Shorts downloader. Save YouTube Shorts videos in HD MP4 from the link, no app or login. Coming soon to Craftora.',
    keywords: ['youtube shorts downloader', 'download youtube shorts', 'shorts downloader', 'youtube shorts to mp4', 'save youtube shorts', 'yt shorts download', 'shorts video download hd'],
    faqs: [
      ['When will the Shorts downloader be available?', 'It is coming soon, together with the full YouTube downloader.'],
    ],
  },
  {
    slug: 'threads-video-downloader', platform: 'threads', live: false, mode: 'video',
    name: 'Threads Video Downloader', brand: 'Threads', color: '#111111', icon: null, badge: '@',
    short: 'Download videos from Threads posts.',
    title: 'Threads Video Downloader: Download Threads Videos in HD',
    description: 'Free Threads video downloader. Save videos from public Threads posts in HD MP4 by pasting the link. No login needed. Coming soon to Craftora.',
    keywords: ['threads video downloader', 'threads downloader', 'download threads video', 'threads net video download', 'save threads video', 'threads to mp4', 'meta threads downloader'],
    faqs: [
      ['When will the Threads downloader be available?', 'It is coming soon. For now, Instagram Reels and videos can be downloaded with Craftora.'],
    ],
  },
  {
    slug: 'vimeo-downloader', platform: 'vimeo', live: false, mode: 'video',
    name: 'Vimeo Downloader', brand: 'Vimeo', color: '#1AB7EA', icon: null, badge: 'V',
    short: 'Download Vimeo videos in HD.',
    title: 'Vimeo Downloader: Download Vimeo Videos in HD MP4',
    description: 'Free Vimeo video downloader. Save public Vimeo videos in HD MP4 by pasting the link. Coming soon to Craftora.',
    keywords: ['vimeo downloader', 'vimeo video downloader', 'download vimeo video', 'vimeo to mp4', 'save vimeo video', 'vimeo hd download'],
    faqs: [
      ['When will the Vimeo downloader be available?', 'It is coming soon.'],
    ],
  },
  {
    slug: 'bilibili-downloader', platform: 'bilibili', live: false, mode: 'video',
    name: 'Bilibili Downloader', brand: 'Bilibili', color: '#00A1D6', icon: null, badge: 'B',
    short: 'Download Bilibili videos in HD.',
    title: 'Bilibili Downloader: Download Bilibili Videos in HD MP4',
    description: 'Free Bilibili video downloader. Save Bilibili videos in HD MP4 by pasting the link. Coming soon to Craftora.',
    keywords: ['bilibili downloader', 'bilibili video downloader', 'download bilibili video', 'bilibili to mp4', 'bilibili download hd', 'b站 视频 下载', 'bilibili video download online'],
    faqs: [
      ['When will the Bilibili downloader be available?', 'It is coming soon.'],
    ],
  },
  {
    slug: 'douyin-downloader', platform: 'douyin', live: false, mode: 'video',
    name: 'Douyin Downloader', brand: 'Douyin', color: '#FE2C55', icon: null, badge: 'DY',
    short: 'Download Douyin videos without watermark.',
    title: 'Douyin Downloader: Download Douyin Videos Without Watermark',
    description: 'Free Douyin video downloader. Save Douyin (Chinese TikTok) videos without watermark in HD MP4 by pasting the link. Coming soon to Craftora.',
    keywords: ['douyin downloader', 'douyin video downloader', 'download douyin video', 'douyin no watermark', 'douyin to mp4', '抖音 视频 下载', 'chinese tiktok downloader'],
    faqs: [
      ['When will the Douyin downloader be available?', 'It is coming soon.'],
    ],
  },
  {
    slug: 'xiaohongshu-downloader', platform: 'xiaohongshu', live: false, mode: 'video',
    name: 'Xiaohongshu (RedNote) Downloader', brand: 'RedNote', color: '#FF2442', icon: null, badge: 'RN',
    short: 'Download RedNote videos without watermark.',
    title: 'Xiaohongshu Downloader: Download RedNote Videos Without Watermark',
    description: 'Free Xiaohongshu (RedNote) video downloader. Save RedNote videos without watermark in HD MP4 by pasting the link. Coming soon to Craftora.',
    keywords: ['xiaohongshu downloader', 'rednote downloader', 'xiaohongshu video download', 'rednote video downloader', 'xhs downloader', '小红书 视频 下载', 'xiaohongshu no watermark'],
    faqs: [
      ['When will the RedNote downloader be available?', 'It is coming soon.'],
    ],
  },
];

export function getDownloader(slug) {
  return downloaders.find((d) => d.slug === slug);
}

export const liveDownloaders = downloaders.filter((d) => d.live);
