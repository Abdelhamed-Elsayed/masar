# Generates original illustrated avatars (96x96 SVG) for the Masar team.
import sys, os
out = sys.argv[1]

def avatar(key, bg1, bg2, skin, skin_shadow, hair, hair_style, shirt, collar, beard=None, glasses=None, tie=None, brow=None, extra=''):
    brow = brow or hair
    p = []
    p.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none" role="img">')
    p.append(f'<defs><linearGradient id="bg-{key}" x1="12" y1="6" x2="84" y2="92" gradientUnits="userSpaceOnUse"><stop stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/></linearGradient>'
             f'<clipPath id="c-{key}"><circle cx="48" cy="48" r="48"/></clipPath></defs>')
    p.append(f'<g clip-path="url(#c-{key})">')
    p.append(f'<rect width="96" height="96" fill="url(#bg-{key})"/>')
    p.append('<circle cx="76" cy="20" r="22" fill="#fff" fill-opacity=".14"/><circle cx="14" cy="80" r="16" fill="#fff" fill-opacity=".10"/>')
    # shoulders / shirt
    p.append(f'<path d="M6 98c1-23 15-32 28-35l14 7 14-7c13 3 27 12 28 35Z" fill="{shirt}"/>')
    # neck
    p.append(f'<path d="M40 56h16v13c0 4-3.6 7-8 7s-8-3-8-7V56Z" fill="{skin_shadow}"/>')
    # collar / tie
    p.append(f'<path d="M34 63l14 14-8 4-12-9Zm28 0L48 77l8 4 12-9Z" fill="{collar}"/>')
    if tie:
        p.append(f'<path d="M45 76h6l3 17-6 3-6-3Z" fill="{tie}"/><path d="M44.5 73.5h7l-1.2 4h-4.6Z" fill="{tie}"/>')
    # ears
    p.append(f'<ellipse cx="29.5" cy="44" rx="3.6" ry="5.2" fill="{skin}"/><ellipse cx="66.5" cy="44" rx="3.6" ry="5.2" fill="{skin}"/>')
    # back hair (curly/long)
    if hair_style == 'curly':
        p.append(f'<circle cx="31" cy="34" r="9" fill="{hair}"/><circle cx="65" cy="34" r="9" fill="{hair}"/>')
    # head
    p.append(f'<path d="M30 40c0-14 8-23 18-23s18 9 18 23v6c0 14-8 23-18 23s-18-9-18-23v-6Z" fill="{skin}"/>')
    # beard
    if beard == 'full':
        p.append(f'<path d="M30 46c0 15 8 24 18 24s18-9 18-24c-3 6-7 8-11 8h-14c-4 0-8-2-11-8Z" fill="{hair}"/><path d="M42 59c4 2.4 8 2.4 12 0" stroke="{skin}" stroke-width="2.4" stroke-linecap="round"/>')
    elif beard == 'trim':
        p.append(f'<path d="M30 47c1 13 9 22 18 22s17-9 18-22c-3 4-6 6-9 6.5-3-2-6-2.6-9-2.6s-6 .6-9 2.6c-3-.5-6-2.500-9-6.500Z" fill="{hair}" fill-opacity=".92"/><path d="M42.500 59.500c3.500 2 7.500 2 11 0" stroke="{skin}" stroke-width="2.200" stroke-linecap="round"/>')
    elif beard == 'stubble':
        p.append(f'<path d="M30 47c1 13 9 22 18 22s17-9 18-22c-3 4-6 6-9 6.500-3-2-6-2.600-9-2.600s-6 .6-9 2.600c-3-.5-6-2.500-9-6.500Z" fill="{hair}" fill-opacity=".38"/>')
    # hair styles
    if hair_style == 'short':
        p.append(f'<path d="M29 40c-2-16 6-26 19-26 12 0 21 8 19 26-3-3-5-7-6-11-8 5-20 7-32 11Z" fill="{hair}"/>')
    elif hair_style == 'side':
        p.append(f'<path d="M29 41c-3-17 5-28 20-28 13 0 20 9 18 28-2-5-3-9-3-12-9 2-22 1-30 3-2 3-4 6-5 9Z" fill="{hair}"/>')
    elif hair_style == 'curly':
        p.append(f'<path d="M28 40c-4-9-1-26 20-26s24 17 20 26c-2-5-4-8-6-10-6 4-18 5-26 2-3 2-6 5-8 8Z" fill="{hair}"/><circle cx="36" cy="20" r="6" fill="{hair}"/><circle cx="48" cy="16" r="7" fill="{hair}"/><circle cx="60" cy="20" r="6" fill="{hair}"/><circle cx="29" cy="30" r="5" fill="{hair}"/><circle cx="67" cy="30" r="5" fill="{hair}"/>')
    elif hair_style == 'fade':
        p.append(f'<path d="M30 38c-1-15 6-23 18-23s19 8 18 23c-2-4-3-8-4-10-9 3-19 3-28 0-2 3-3 7-4 10Z" fill="{hair}"/>')
    elif hair_style == 'receding':
        p.append(f'<path d="M30 40c-1-8 1-14 5-17-1 5 0 9 3 11-3 2-5 4-8 6Zm36 0c1-8-1-14-5-17 1 5 0 9-3 11 3 2 5 4 8 6Z" fill="{hair}"/><path d="M36 20c8-6 16-6 24 0-8-3-16-3-24 0Z" fill="{hair}" fill-opacity=".55"/>')
    elif hair_style == 'swept':
        p.append(f'<path d="M29 41c-3-18 6-29 21-28 13 1 19 10 17 28-3-7-5-10-8-12-6 2-14 3-22 6-3 1-6 3-8 6Z" fill="{hair}"/>')
    # eyebrows
    p.append(f'<path d="M37 37.500c2.500-1.500 5-1.500 7.500-.3m7 .3c2.500-1.200 5-1.200 7.500.3" stroke="{brow}" stroke-width="2.400" stroke-linecap="round"/>')
    # eyes
    p.append('<ellipse cx="41" cy="43" rx="2.100" ry="2.500" fill="#1b2430"/><ellipse cx="55" cy="43" rx="2.100" ry="2.500" fill="#1b2430"/><circle cx="41.700" cy="42.200" r=".7" fill="#fff"/><circle cx="55.700" cy="42.200" r=".7" fill="#fff"/>')
    # nose
    p.append(f'<path d="M48 44v8c-1.600 1.200-3 1.200-3.600 0m3.600 0c1.600 1.200 3 1.200 3.600 0" stroke="{skin_shadow}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')
    # mouth
    if beard in ('full', 'trim'):
        p.append('<path d="M43.500 59.500c3 1.600 6 1.600 9 0" stroke="#fff" stroke-opacity=".9" stroke-width="2" stroke-linecap="round"/>')
    else:
        p.append('<path d="M42.500 58c3.500 3.200 7.500 3.200 11 0" stroke="#8a3f3a" stroke-width="2.300" stroke-linecap="round"/>')
    # glasses
    if glasses == 'round':
        p.append('<circle cx="41" cy="43" r="6.600" stroke="#1d2a36" stroke-width="2"/><circle cx="55" cy="43" r="6.600" stroke="#1d2a36" stroke-width="2"/><path d="M47.600 43h.8M34.400 42l-4-1.200M61.600 42l4-1.200" stroke="#1d2a36" stroke-width="2" stroke-linecap="round"/>')
    elif glasses == 'rect':
        p.append('<rect x="33.500" y="38" width="15" height="10.500" rx="3" stroke="#1d2a36" stroke-width="2"/><rect x="47.500" y="38" width="15" height="10.500" rx="3" stroke="#1d2a36" stroke-width="2"/><path d="M48.500 42h-1M33.500 41l-4-1M62.500 41l4-1" stroke="#1d2a36" stroke-width="2" stroke-linecap="round"/>')
    p.append(extra)
    p.append('</g></svg>')
    return ''.join(p)

people = {
 'ahmed-ayman': dict(bg1='#BFEFE7', bg2='#5CC4B5', skin='#C98F68', skin_shadow='#B87A54', hair='#1f2a2e', hair_style='short', shirt='#127a70', collar='#0e5f57'),
 'ahmed-mohamed': dict(bg1='#CFE0F7', bg2='#6E9AD8', skin='#E0AA82', skin_shadow='#CD946B', hair='#2c2420', hair_style='side', shirt='#1d3f73', collar='#16305a', glasses='round'),
 'abdelrahman-mohamed': dict(bg1='#D9DFEA', bg2='#7B8AA6', skin='#C58E66', skin_shadow='#B07650', hair='#2a2a2e', hair_style='short', shirt='#2f3a4d', collar='#f3f5f8', beard='full', tie='#127a70'),
 'mostafa-kamel': dict(bg1='#FBE3C5', bg2='#EDA15C', skin='#B9825B', skin_shadow='#A56C47', hair='#1d1814', hair_style='curly', shirt='#4d8fc7', collar='#3a76ac'),
 'abdelrahman-ghoneim': dict(bg1='#E8DDF3', bg2='#9F86C4', skin='#D7A27B', skin_shadow='#C38A62', hair='#8e9096', hair_style='receding', shirt='#26334d', collar='#f3f5f8', beard='trim', glasses='rect', tie='#8b2f3f'),
 'abdelhamid-elsayed': dict(bg1='#F6E3A1', bg2='#C99A1E', skin='#CC9670', skin_shadow='#B8825A', hair='#23201d', hair_style='swept', shirt='#10151f', collar='#f3f5f8', beard='trim', tie='#d4af37'),
 'mahmoud-ayman': dict(bg1='#BFD3F2', bg2='#3F6FC4', skin='#D3A07A', skin_shadow='#BF8A63', hair='#17191c', hair_style='fade', shirt='#12161d', collar='#222a36', glasses='rect', beard='stubble'),
 'mohamed-abdelfattah': dict(bg1='#FAD7C8', bg2='#E27D5B', skin='#C48A62', skin_shadow='#AE7450', hair='#3a2a20', hair_style='swept', shirt='#8c4a35', collar='#6f3826', beard='stubble'),
}
os.makedirs(out, exist_ok=True)
for key, cfg in people.items():
    open(os.path.join(out, f'{key}.svg'), 'w').write(avatar(key, **cfg))
print('ok', len(people))
