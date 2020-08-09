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

if __name__ == "__main__":
    org = Image.open('testimage/1to1.jpg')
    wm = Image.open('watermarks/wm_test1.png')
    #how much area will be watermarked
    wm_proportion = 0.05
    #space to border (proportion: hight of wm)
    wm_border = .25
    #left = 0, center = 0.5 right = 1
    halgin = 1
    #top = 0, center = 0.5 bottom = 1
    valgin = 1

    wm = wm_resize(org, wm, wm_proportion)
    target_pos = wm_pos(org, wm, wm_border, halgin, valgin) 

    steps = 5
    min_std = None
    pos_min_std = None
    for vpos in range(0, steps + 1):
        vpos = vpos / steps
        for hpos in range(0, steps + 1):
            hpos = hpos / steps
            h, v = wm_pos(org, wm, wm_border, hpos, vpos)

            sample = org.crop((h, v, h + wm.width, v + wm.height))
            stat = Stat(sample)
            actual_std = statistics.mean(Stat(sample).stddev)
            if min_std is None or actual_std < min_std:
                min_std = actual_std
                pos_min_std = (h, v)
            print(f"{vpos} {hpos}: {statistics.mean(stat.stddev)}")

            #create new image with alpha channel (transparent)
            result = Image.new('RGBA', org.size)
            result.paste(org)

            result.paste(wm, (h, v), mask=wm)
            # result.show()
            #convert to image without alpha channel ()
            result = result.convert("RGB")
            result.save(f"results/{v}_{h}.jpg")

    #create new image with alpha channel (transparent)
    result = Image.new('RGBA', org.size)
    result.paste(org)

    result.paste(wm, pos_min_std, mask=wm)
    # result.show()
    #convert to image without alpha channel ()
    result = result.convert("RGB")
    result.save(f"selected.jpg")