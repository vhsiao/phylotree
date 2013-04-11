import sys

if len(sys.argv) != 1:
    print "Nope, try again"
else:
    f = open('./public/siphonophorae.json')
    for line in f:
        print line,
