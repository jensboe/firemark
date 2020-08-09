from PIL import Image
from PIL.ImageStat import Stat
import math
import statistics
from typing import Tuple

def calcSize(actuallength, actualarea, targetarea) -> int:
    return  round(actuallength * math.sqrt(targetarea/actualarea))

def wm_resize(org: Image, wm: Image, proportion) ->Image:
    area_org = org.width * org.height
    area_wm = wm.width * wm.height
    area_target = area_org * proportion

    width_target = calcSize(wm.width, area_wm, area_target)
    height_target = calcSize(wm.height, area_wm, area_target)
    return wm.resize((width_target, height_target))

def calcPos(border, org_lengh, wm_length , rel_pos) -> int:
    min_pos = border
    max_pos = org_lengh - (border + wm_length)
    return round(min_pos + (max_pos - min_pos)* rel_pos)

def wm_pos(org: Image, wm: Image, border, halgin, valgin) -> Tuple[int, int]:
    wm_border = wm.height * border

    vpos = calcPos(wm_border, org.height, wm.height, valgin)
    hpos = calcPos(wm_border, org.width, wm.width, halgin)

    return (hpos, vpos)