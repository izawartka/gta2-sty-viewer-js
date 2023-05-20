# gta2-sty-viewer-js

## About
A web viewer for GTA2 graphics files (.sty) written from scratch in pure JS. Features so far:
- Full support for these weird GTA2 virtual and physical palettes
- Tiles viewer
    - Info about selected tile
- Sprites viewer
    - Detailed info about selected sprite
    - Previewing remaps
    - Searching sprites by their base and ID
- Info about sprite bases (sprites count)
- Cars viewer
    - Info about selected car's hitboxes, flags, traffic info, doors, etc.
    - Tank, Gunjeep and Firetruck are displayed with their turrets
    - Previewing remaps
    - Deltas viewer (veriants of car's sprite with lights turned on, doors open etc.)
- Palettes viewer
    - Info about what sprites/tiles uses selected palette
    - Info about specific colors 
- Info about palette bases (virtual palettes count)
- Fonts list

## To do
- Editor
- Exporing tiles/sprites/palettes
- Virtual palettes list maybe?
- ...

## Example file
For legal reasons I can't upload an example STY file here so if you decide to download the code
and run it on your server, just drop `bil.sty` file from `<GTA2 root folder>\data\` to sty viewer's
root folder.

## Online link
https://maseuko.pl/soft/styjs/

## Author(s)
masuo (aka. izawartka)

## STY format documentation
https://gtamp.com/GTA2/gta2formats.zip