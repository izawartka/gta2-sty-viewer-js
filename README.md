# gta2-sty-viewer-js

## About
A web viewer for GTA2 graphics files (.sty) written from scratch in pure JS. Features so far:
- Full support for these weird GTA2 virtual and physical palettes
- Browsing tiles & info about them
- Browsing sprites
    - Full info about selected sprite
    - Applying remaps (changes aren't saved to the file)
    - Getting sprite by its ID
- Info about sprite bases
- Browsing cars
    - Info about their hitboxes, flags, capacity, etc.
    - Displaying special cars with their turrets (tank, firetruck, gunjeep)
- Browsing physical palettes

## To do
- Easier car remapping
- Car's available remaps list
- Car's doors list
- Deltas support
- Opening car's doors, switching lights on, etc.
- More info about physical palettes
- Virtual palettes list maybe?
- Editor maybe?
- ...

## Example file
For legal reasons I can't upload an example STY file here so if you decide to download the code
and run it on your server, just drop `bil.sty` file from `<GTA2 root folder>\data\` to sty viewer's
root folder.

## Online link
(Updated more frequently than this page)
https://maseuko.pl/soft/styjs/

## Author(s)
masuo (aka. izawartka)

## STY format documentation
https://gtamp.com/GTA2/gta2formats.zip