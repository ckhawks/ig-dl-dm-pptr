out = ""

with open('videoUrls.txt', 'r') as f:
    lines = [line.rstrip('\n') for line in f]
    print(len(lines))

    lines = list(set(lines))  # removes duplicates
    print(len(lines))
    out = '\n'.join(lines)

with open('videoUrls.txt', 'w') as f:
    f.write(out)
