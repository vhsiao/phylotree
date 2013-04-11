import sys

if len(sys.argv) != 2:
    print "Nope; usage: test <name>"
else:
    print "Hello,", sys.argv[1]
