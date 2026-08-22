ADVERTISEMENTS
==============

Drop ad files in this folder to play them full-screen on the TV during a break.

TURNING ADS ON / OFF
--------------------
In the settings spreadsheet, set "Play Ads":

    Yes  ->  ads take over the screen
    No   ->  results as normal

The TV picks up the change within about 10 seconds. You do NOT need to reload
the page or restart TV mode.


NAMING THE FILES
----------------
Files must be named ad1, ad2, ad3, ... and so on, in the order you want them
played. The extension tells the TV whether it's an image or a video.

    ad1.jpg      <- shown for 15 seconds
    ad2.mp4      <- plays all the way through, then moves on
    ad3.png      <- shown for 15 seconds
    ad4.webm     <- plays all the way through

After the last one it starts again from ad1.

Images:  .jpg  .jpeg  .png  .webp  .gif
Videos:  .mp4  .webm  .m4v

IMPORTANT - no gaps in the numbering. The TV stops looking after two missing
numbers in a row, so if you have ad1, ad2 and then ad5, the last one is never
played. Renumber after deleting an ad.


NOTES
-----
- Videos play MUTED. Browsers block autoplaying sound on an unattended screen.
- Ads are letterboxed, not cropped, so nothing gets cut off. 1920x1080 files
  fill the screen exactly.
- Adding or removing files takes effect the next time the playlist loops back
  around to the start - no reload needed.
- If this folder is empty, ads are skipped and the results stay on screen.
  The TV rechecks every 30 seconds.
- The Exit TV button (top right) still works while ads are playing, as does Esc.
